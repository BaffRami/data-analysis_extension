// extension.js
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const xlsx = require("xlsx");

let selectedFilePath = null;
let customOperationsByCategory = {};

function activate(context) {
  console.log('Congratulations, your extension "data-analysis" is now active!');

  // Load custom operations
  loadCustomOperations(context);

  // Register command to select file
  let disposable = vscode.commands.registerCommand(
    "data-analysis.selectFile",
    async function () {
      try {
        // Prompt to select file
        selectedFilePath = await promptToSelectFile(context);

        if (selectedFilePath) {
          // Proceed to open the webview for selection
          await openWebviewForSelection(context);
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Command failed: ${error.message}`);
        console.error("Command error:", error);
      }
    }
  );

  context.subscriptions.push(disposable);
}

function loadCustomOperations(context) {
  const customOperationsDir = path.join(
    context.extensionPath,
    "custom_operations"
  );

  if (fs.existsSync(customOperationsDir)) {
    const files = fs.readdirSync(customOperationsDir);

    files.forEach((file) => {
      const operationPath = path.join(customOperationsDir, file);

      if (fs.statSync(operationPath).isFile() && file.endsWith(".js")) {
        try {
          const operation = require(operationPath);
          if (!customOperationsByCategory[operation.category]) {
            customOperationsByCategory[operation.category] = [];
          }
          customOperationsByCategory[operation.category].push(operation);
        } catch (error) {
          console.error(`Failed to load operation ${file}:`, error);
        }
      }
    });
  }
}

async function promptToSelectFile(context) {
  try {
    const options = {
      canSelectMany: false,
      openLabel: "Open",
      filters: {
        "CSV, Excel, and JSON files": ["csv", "xlsx", "json"],
        "All files": ["*"],
      },
    };

    const fileUri = await vscode.window.showOpenDialog(options);
    if (fileUri && fileUri[0]) {
      const filePath = fileUri[0].fsPath;

      // Store the selected file path temporarily
      context.workspaceState.update("selectedFile", filePath);

      return filePath;
    } else {
      return null; // User canceled the file selection
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to select file: ${error.message}`);
    console.error("File selection error:", error);
    return null;
  }
}

async function openWebviewForSelection(context) {
  const activeEditor = vscode.window.activeNotebookEditor;

  if (!activeEditor) {
    vscode.window.showErrorMessage(
      "Please open a Jupyter notebook to perform the operation."
    );
    return;
  }

  // Open the webview
  const panel = vscode.window.createWebviewPanel(
    "dataAnalysis",
    "Data Analysis",
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(context.extensionUri, "media"),
        vscode.Uri.joinPath(context.extensionUri, "media", "css"),
        vscode.Uri.joinPath(context.extensionUri, "media", "webfonts"),
      ],
    }
  );

  let columns = await getFileHeaders(selectedFilePath);

  // Read HTML file
  const htmlPath = vscode.Uri.joinPath(
    context.extensionUri,
    "media",
    "index.html"
  );
  let htmlContent = fs.readFileSync(htmlPath.fsPath, "utf8");

  // Generate webview URIs for local resources
  const styleUri = panel.webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "media", "style.css")
  );

  const fontAwesomeUri = panel.webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "media", "css", "all.min.css")
  );

  // Update paths in HTML content
  htmlContent = htmlContent
    .replace("style.css", styleUri.toString())
    .replace("css/all.min.css", fontAwesomeUri.toString());

  // Set the HTML content
  panel.webview.html = htmlContent;

  // Handle messages from the webview
  panel.webview.onDidReceiveMessage(
    async (message) => {
      switch (message.command) {
        case "ready":
          // Send available columns
          panel.webview.postMessage({
            command: "setColumns",
            columns: columns,
          });
          // Send available categories
          panel.webview.postMessage({
            command: "setCategories",
            categories: Object.keys(customOperationsByCategory),
          });
          break;

        case "requestCategories":
          panel.webview.postMessage({
            command: "setCategories",
            categories: Object.keys(customOperationsByCategory),
          });
          break;

        case "categorySelected":
          const selectedCategory = message.category;
          const operations = customOperationsByCategory[selectedCategory].map(
            (op) => ({
              name: op.name,
              needsUserInput: op.needsUserInput || false,
              userInputPlaceholder: op.userInputPlaceholder || "",
            })
          );
          panel.webview.postMessage({
            command: "setOperations",
            operations: operations,
          });
          break;

        case "changeFile":
          // Trigger file change process
          const newFilePath = await promptToSelectFile(context);

          if (newFilePath) {
            selectedFilePath = newFilePath; // Only update if a new file was selected
            columns = await getFileHeaders(selectedFilePath);

            // Send the updated columns to the webview
            panel.webview.postMessage({
              command: "setColumns",
              columns: columns,
            });
          }
          break;

        case "previewData":
          if (selectedFilePath) {
            const dataPreview = await getPreviewData(selectedFilePath);
            panel.webview.postMessage({
              command: "showDataPreview",
              data: dataPreview,
            });
          } else {
            vscode.window.showErrorMessage("No file selected for preview.");
          }
          break;

        case "performOperations":
          // Handle multiple operations
          for (const op of message.operations) {
            const operation = findOperationByName(op.operationName);
            if (operation) {
              await handleOperation(op.columns, operation, op.userInput);
            } else {
              vscode.window.showErrorMessage(
                `Unsupported operation selected: ${op.operationName}.`
              );
            }
          }
          break;

        default:
          console.error(
            `Unknown command received from webview: ${message.command}`
          );
          break;
      }
    },
    undefined,
    context.subscriptions
  );
}

// Function to get file headers
function getFileHeaders(filePath) {
  return new Promise((resolve, reject) => {
    const fileExtension = path.extname(filePath).toLowerCase();

    try {
      if (fileExtension === ".csv") {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("headers", (headers) => resolve(headers))
          .on("error", (error) => reject(error));
      } else if (fileExtension === ".xlsx") {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        const headers = jsonData[0];
        resolve(headers);
      } else if (fileExtension === ".json") {
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const headers = Object.keys(jsonData[0]);
        resolve(headers);
      } else {
        throw new Error("Unsupported file format");
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Function to fetch the entire dataset for preview
function getPreviewData(filePath) {
  return new Promise((resolve, reject) => {
    const fileExtension = path.extname(filePath).toLowerCase();
    const data = [];

    try {
      if (fileExtension === ".csv") {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (row) => {
            data.push(Object.values(row)); // Capture all rows
          })
          .on("end", () => resolve(data))
          .on("error", (error) => reject(error));
      } else if (fileExtension === ".xlsx") {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        resolve(jsonData); // Return all rows including the header
      } else if (fileExtension === ".json") {
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const keys = Object.keys(jsonData[0]);
        const preview = jsonData.map((row) => keys.map((key) => row[key]));
        resolve([keys, ...preview]); // Return all rows
      } else {
        throw new Error("Unsupported file format");
      }
    } catch (error) {
      reject(error);
    }
  });
}

async function handleOperation(columns, operation, userInput) {
  try {
    const pandasCode = operation.operation(columns, userInput); // Pass the user input
    await addCodeCell(pandasCode); // Add the code to Jupyter notebook
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to handle operation: ${error.message}`
    );
    console.error("Operation handling error:", error);
  }
}

async function addCodeCell(code) {
  try {
    // Use visibleNotebookEditors to find an active notebook editor
    const editor = vscode.window.visibleNotebookEditors.find(
      (e) => e.notebook !== undefined
    );

    if (!editor) {
      vscode.window.showErrorMessage(
        "Please open a Jupyter notebook to add the code cell."
      );
      return;
    }

    const notebook = editor.notebook;

    // Prepare a new code cell with the generated code
    const cell = new vscode.NotebookCellData(
      vscode.NotebookCellKind.Code,
      code,
      "python"
    );

    // Create a workspace edit to insert the new cell
    const edit = new vscode.WorkspaceEdit();
    edit.set(notebook.uri, [
      vscode.NotebookEdit.insertCells(notebook.cellCount, [cell]),
    ]);

    // Apply the workspace edit to add the new cell
    await vscode.workspace.applyEdit(edit);

    vscode.window.showInformationMessage(
      "Added new code cell to Jupyter notebook"
    );

    // Focus back on the notebook editor
    await vscode.window.showNotebookDocument(notebook, {
      viewColumn: vscode.ViewColumn.One,
    });
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to add code cell: ${error.message}`);
    console.error("Add code cell error:", error);
  }
}

function deactivate(context) {
  // Clear the stored file path on deactivation
  context.workspaceState.update("selectedFile", null);
}

// Utility function to find operation by name across categories
function findOperationByName(name) {
  for (const category in customOperationsByCategory) {
    const operation = customOperationsByCategory[category].find(
      (op) => op.name === name
    );
    if (operation) {
      return operation;
    }
  }
  return null;
}

module.exports = {
  activate,
  deactivate,
};
