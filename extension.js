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
  customOperationsByCategory = {}; // Reset the object
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
          delete require.cache[require.resolve(operationPath)]; // Clear cache
          const operation = require(operationPath);

          // Add the file name to the operation object
          operation.fileName = file;

          // Use the category as-is to preserve original casing
          const category = operation.category;

          if (!customOperationsByCategory[category]) {
            customOperationsByCategory[category] = [];
          }
          customOperationsByCategory[category].push(operation);
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

  // Determine the file type and generate the appropriate Python code
  const fileExtension = path.extname(selectedFilePath).toLowerCase();
  let pandasImportCode = "import pandas as pd\n";
  let fileLoadingCode = "";
  const fileName = path.basename(selectedFilePath);

  // Replace backslashes with forward slashes
  const correctFilePath = selectedFilePath.replace(/\\/g, "/");

  if (fileExtension === ".csv") {
    fileLoadingCode = `df = pd.read_csv('${correctFilePath}')\n`;
  } else if (fileExtension === ".xlsx") {
    fileLoadingCode = `df = pd.read_excel('${correctFilePath}')\n`;
  } else if (fileExtension === ".json") {
    fileLoadingCode = `df = pd.read_json('${correctFilePath}')\n`;
  } else {
    vscode.window.showErrorMessage("Unsupported file format.");
    return;
  }

  const fullCode = pandasImportCode + fileLoadingCode;

  // Add this code to the Jupyter notebook
  await addCodeCell(fullCode);

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
      try {
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

          case "requestCategoriesForManagement":
            panel.webview.postMessage({
              command: "setCategoriesForManagement",
              categories: Object.keys(customOperationsByCategory),
            });
            break;

          case "categorySelected":
            const selectedCategory = message.category;
            const operations = customOperationsByCategory[selectedCategory].map(
              (op) => ({
                name: op.name,
                needsUserInput: op.needsUserInput || false,
                userInputPlaceholders: op.userInputPlaceholders || [],
                requiresColumns: op.requiresColumns || false,
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
                const userInputs = op.userInputs || [];
                await handleOperation(op.columns, operation, userInputs);
              } else {
                vscode.window.showErrorMessage(
                  `Unsupported operation selected: ${op.operationName}.`
                );
              }
            }
            break;

          case "createCustomOperation":
            const operationData = message.data;
            await createCustomOperationFile(operationData, context);
            // Reload custom operations
            loadCustomOperations(context);
            // Send updated categories to the webview
            panel.webview.postMessage({
              command: "setCategories",
              categories: Object.keys(customOperationsByCategory),
            });
            break;

          case "requestCustomOperations":
            // Send the list of custom operations to the webview
            const customOperations = getCustomOperationsList();
            panel.webview.postMessage({
              command: "setCustomOperations",
              customOperations: customOperations,
            });
            break;

          case "confirmDeleteCustomOperation":
            // Show confirmation dialog to the user
            const confirmDeletion = await vscode.window.showWarningMessage(
              `Are you sure you want to delete "${message.fileName}"?`,
              { modal: true },
              "Yes",
              "No"
            );

            if (confirmDeletion === "Yes") {
              // Proceed with deletion
              await deleteCustomOperationFile(message.fileName, context);
              // Reload custom operations
              loadCustomOperations(context);
              // Notify the webview to refresh the list
              const updatedCustomOperations = getCustomOperationsList();
              panel.webview.postMessage({
                command: "setCustomOperations",
                customOperations: updatedCustomOperations,
              });
              // Update categories
              panel.webview.postMessage({
                command: "setCategories",
                categories: Object.keys(customOperationsByCategory),
              });
              // Inform the webview of successful deletion
              panel.webview.postMessage({
                command: "deleteOperationSuccess",
                message: `Successfully deleted "${message.fileName}".`,
              });
            } else {
              // Inform the webview that deletion was canceled
              panel.webview.postMessage({
                command: "deleteOperationFailure",
                message: `Deletion of "${message.fileName}" was canceled.`,
              });
            }
            break;

          case "confirmDeleteCategory":
            // Show confirmation dialog to the user
            const categoryToDelete = message.category;
            const confirmCategoryDeletion =
              await vscode.window.showWarningMessage(
                `Are you sure you want to delete the category "${categoryToDelete}" and all its operations?`,
                { modal: true },
                "Yes",
                "No"
              );

            if (confirmCategoryDeletion === "Yes") {
              // Proceed with category deletion
              await deleteCategory(categoryToDelete, context);
              // Reload custom operations
              loadCustomOperations(context);
              // Update the categories in the webview
              panel.webview.postMessage({
                command: "setCategories",
                categories: Object.keys(customOperationsByCategory),
              });
              // Notify any pages that display categories
              panel.webview.postMessage({
                command: "categoryDeleted",
                category: categoryToDelete,
              });
              // Inform the webview of successful deletion
              panel.webview.postMessage({
                command: "deleteCategorySuccess",
                message: `Successfully deleted category "${categoryToDelete}".`,
              });
            } else {
              // Inform the webview that deletion was canceled
              panel.webview.postMessage({
                command: "deleteCategoryFailure",
                message: `Deletion of category "${categoryToDelete}" was canceled.`,
              });
            }
            break;

          case "requestOperationDetails":
            const operationDetails = await getOperationDetails(
              message.fileName,
              context
            );
            panel.webview.postMessage({
              command: "setOperationDetails",
              operation: operationDetails,
            });
            break;

          case "updateCustomOperation":
            await updateCustomOperationFile(message.data, context);
            // Reload custom operations
            loadCustomOperations(context);
            // Update the categories and operations in the webview
            panel.webview.postMessage({
              command: "setCategories",
              categories: Object.keys(customOperationsByCategory),
            });
            panel.webview.postMessage({
              command: "setCustomOperations",
              customOperations: getCustomOperationsList(),
            });
            vscode.window.showInformationMessage(
              `Custom operation "${message.data.name}" updated successfully.`
            );
            break;

          default:
            console.error(
              `Unknown command received from webview: ${message.command}`
            );
            break;
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
        console.error("Error handling message:", error);
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

async function handleOperation(columns, operation, userInputs) {
  try {
    // If the operation doesn't require columns, set columns to an empty array
    if (!operation.requiresColumns) {
      columns = [];
    }

    // Step 1: Process user inputs to replace &cX placeholders with actual column values
    const processedUserInputs = userInputs.map((input) => {
      return input.replace(/&c(\d+)/g, (match, index) => {
        // Replace &c0 with columns[0], &c1 with columns[1], etc.
        return columns[index] || match; // If column exists, replace; else, keep original
      });
    });

    // Step 2: Generate pandas code with processed user inputs
    const pandasCode = operation.operation(columns, processedUserInputs); // Pass the processed user inputs array

    // Step 3: Add the generated code to the Jupyter notebook
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
    const activeCell = editor.selection.active;

    if (activeCell) {
      // Check if the active cell is a code cell
      if (
        notebook.cellAt(activeCell.index).kind === vscode.NotebookCellKind.Code
      ) {
        // If a code cell is selected, append the code to the active cell's document
        const edit = new vscode.WorkspaceEdit();
        const position = new vscode.Position(
          notebook.cellAt(activeCell.index).document.lineCount,
          0
        );

        edit.insert(
          notebook.cellAt(activeCell.index).document.uri,
          position,
          `\n${code}`
        );

        // Apply the edit to modify the current cell
        await vscode.workspace.applyEdit(edit);
        vscode.window.showInformationMessage(
          "Appended code to the selected cell."
        );
      } else {
        // If the selected cell isn't a code cell, insert a new code cell after it
        const newCell = new vscode.NotebookCellData(
          vscode.NotebookCellKind.Code,
          code,
          "python"
        );

        const edit = new vscode.WorkspaceEdit();
        edit.set(notebook.uri, [
          vscode.NotebookEdit.insertCells(activeCell.index + 1, [newCell]),
        ]);

        // Apply the edit to add a new cell
        await vscode.workspace.applyEdit(edit);
        vscode.window.showInformationMessage(
          "Added new code cell after the selected cell."
        );
      }
    } else {
      // If no active cell is selected, insert a new code cell at the end
      const newCell = new vscode.NotebookCellData(
        vscode.NotebookCellKind.Code,
        code,
        "python"
      );

      const edit = new vscode.WorkspaceEdit();
      edit.set(notebook.uri, [
        vscode.NotebookEdit.insertCells(notebook.cellCount, [newCell]),
      ]);

      // Apply the workspace edit to add the new cell
      await vscode.workspace.applyEdit(edit);
      vscode.window.showInformationMessage("Added new code cell at the end.");
    }

    // Focus back on the notebook editor
    await vscode.window.showNotebookDocument(notebook, {
      viewColumn: vscode.ViewColumn.One,
    });
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to add code cell: ${error.message}`);
    console.error("Add code cell error:", error);
  }
}

async function createCustomOperationFile(operationData, context) {
  const customOperationsDir = path.join(
    context.extensionPath,
    "custom_operations"
  );

  // Ensure the directory exists
  if (!fs.existsSync(customOperationsDir)) {
    fs.mkdirSync(customOperationsDir);
  }

  // Generate a valid filename
  const fileName = `${operationData.name.replace(/\s+/g, "_")}.js`;
  const filePath = path.join(customOperationsDir, fileName);

  // Replace placeholders in the operation code
  let operationCode = operationData.operationCode;

  // Replace column placeholders if operation requires columns
  if (operationData.requiresColumns) {
    operationCode = operationCode.replace(/&c(\d+)/g, (match, index) => {
      return `\${columns[${index}]}`;
    });
  } else {
    // Remove any column placeholders if operation doesn't require columns
    operationCode = operationCode.replace(/&c\d+/g, "");
  }

  // Replace user input placeholders
  if (operationData.needsUserInput) {
    operationCode = operationCode.replace(/&i(\d+)/g, (match, index) => {
      return `\${userInputs[${index}]}`;
    });
  }

  // Create the content of the JS file
  const fileContent = `
module.exports = {
  name: "${operationData.name}",
  category: "${operationData.category}",
  needsUserInput: ${operationData.needsUserInput},
  requiresColumns: ${operationData.requiresColumns},
  userInputPlaceholders: ${JSON.stringify(operationData.userInputPlaceholders)},
  operationCode: \`${
    operationData.operationCode
  }\`, // Store the raw operation code
  operation: (columns, userInputs) => {
    return \`
${operationCode}
    \`;
  },
};
`;

  // Write the file
  fs.writeFileSync(filePath, fileContent, "utf8");
}

// Function to get operation details for editing
async function getOperationDetails(fileName, context) {
  const customOperationsDir = path.join(
    context.extensionPath,
    "custom_operations"
  );
  const filePath = path.join(customOperationsDir, fileName);

  if (fs.existsSync(filePath)) {
    try {
      const operationModule = require(filePath);
      const fileContent = fs.readFileSync(filePath, "utf8");

      // Extract the raw operation code
      const operationCodeMatch = fileContent.match(
        /operationCode:\s*`([^`]*)`/s
      );
      const rawOperationCode = operationCodeMatch
        ? operationCodeMatch[1].trim()
        : "";

      return {
        name: operationModule.name,
        category: operationModule.category,
        needsUserInput: operationModule.needsUserInput,
        userInputPlaceholders: operationModule.userInputPlaceholders || [],
        requiresColumns: operationModule.requiresColumns,
        rawOperationCode: rawOperationCode,
        fileName: fileName, // Include the file name for reference
      };
    } catch (error) {
      console.error(`Failed to load operation ${fileName}:`, error);
      throw new Error(`Failed to load operation ${fileName}.`);
    }
  } else {
    throw new Error(`Operation file "${fileName}" not found.`);
  }
}

// Function to update an existing custom operation file
async function updateCustomOperationFile(operationData, context) {
  const customOperationsDir = path.join(
    context.extensionPath,
    "custom_operations"
  );
  const filePath = path.join(customOperationsDir, operationData.fileName);

  if (fs.existsSync(filePath)) {
    try {
      // Replace placeholders in the operation code
      let operationCode = operationData.operationCode;

      // Replace column placeholders if operation requires columns
      if (operationData.requiresColumns) {
        operationCode = operationCode.replace(/&c(\d+)/g, (match, index) => {
          return `\${columns[${index}]}`;
        });
      } else {
        // Remove any column placeholders if operation doesn't require columns
        operationCode = operationCode.replace(/&c\d+/g, "");
      }

      // Replace user input placeholders
      if (operationData.needsUserInput) {
        operationCode = operationCode.replace(/&i(\d+)/g, (match, index) => {
          return `\${userInputs[${index}]}`;
        });
      }

      // Create the content of the JS file
      const fileContent = `
module.exports = {
  name: "${operationData.name}",
  category: "${operationData.category}",
  needsUserInput: ${operationData.needsUserInput},
  requiresColumns: ${operationData.requiresColumns},
  userInputPlaceholders: ${JSON.stringify(operationData.userInputPlaceholders)},
  operationCode: \`${
    operationData.operationCode
  }\`, // Store the raw operation code
  operation: (columns, userInputs) => {
    return \`
${operationCode}
    \`;
  },
};
`;

      // Write the updated content to the file
      fs.writeFileSync(filePath, fileContent, "utf8");
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to update operation: ${error.message}`
      );
      console.error("Update operation error:", error);
      throw error;
    }
  } else {
    throw new Error(`Operation file "${operationData.fileName}" not found.`);
  }
}

// Function to get the list of custom operations
function getCustomOperationsList() {
  let customOperations = [];
  for (const category in customOperationsByCategory) {
    customOperationsByCategory[category].forEach((op) => {
      customOperations.push({
        name: op.name,
        category: op.category,
        fileName: op.fileName || `${op.name.replace(/\s+/g, "_")}.js`,
      });
    });
  }
  return customOperations;
}

// Function to delete a custom operation file
async function deleteCustomOperationFile(fileName, context) {
  const customOperationsDir = path.join(
    context.extensionPath,
    "custom_operations"
  );
  const filePath = path.join(customOperationsDir, fileName);

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      vscode.window.showInformationMessage(
        `Deleted custom operation "${fileName}".`
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to delete operation: ${error.message}`
      );
      console.error("Delete operation error:", error);
    }
  } else {
    vscode.window.showErrorMessage(`Operation file "${fileName}" not found.`);
  }
}

// Function to delete all operations under a category
async function deleteCategory(categoryName, context) {
  const customOperationsDir = path.join(
    context.extensionPath,
    "custom_operations"
  );

  if (customOperationsByCategory[categoryName]) {
    const operations = customOperationsByCategory[categoryName];
    for (const operation of operations) {
      const fileName = operation.fileName;
      const filePath = path.join(customOperationsDir, fileName);

      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          vscode.window.showErrorMessage(
            `Failed to delete operation "${operation.name}": ${error.message}`
          );
          console.error("Delete operation error:", error);
        }
      }
    }
    vscode.window.showInformationMessage(
      `Deleted category "${categoryName}" and all its operations.`
    );
  } else {
    vscode.window.showErrorMessage(`Category "${categoryName}" not found.`);
  }
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

function deactivate(context) {
  // Clear the stored file path on deactivation
  context.workspaceState.update("selectedFile", null);
}

module.exports = {
  activate,
  deactivate,
};
