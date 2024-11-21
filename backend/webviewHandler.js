const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const {
  loadCustomOperations,
  getCustomOperationsByCategory,
  findOperationByName,
  getCustomOperationsList,
  createCustomOperationFile,
  getOperationDetails,
  updateCustomOperationFile,
  deleteCustomOperationFile,
  deleteCategory,
} = require("./customOperations");
const {
  getFileHeaders,
  getUniqueValuesFromColumn,
  getPreviewData,
} = require("./fileHandlers");
const { handleOperation } = require("./operationHandler");
const { addCodeCell } = require("./notebookUtils");

async function openWebviewForSelection(context, selectedFilePath) {
  const extensionPath = context.extensionPath;

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

  const jsUri = panel.webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "media", "js", "main.js")
  );

  const checkboxUri = panel.webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "media", "js", "checkboxes.js")
  );

  // Update paths in HTML content
  htmlContent = htmlContent
    .replace("style.css", styleUri.toString())
    .replace("css/all.min.css", fontAwesomeUri.toString())
    .replace("js/main.js", jsUri.toString())
    .replace("js/checkboxes.js", checkboxUri.toString());

  // Set the HTML content
  panel.webview.html = htmlContent;

  // Load custom operations
  loadCustomOperations(extensionPath);
  let customOperationsByCategory = getCustomOperationsByCategory();

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
                requiresColumnValues: op.requiresColumnValues || false,
              })
            );
            panel.webview.postMessage({
              command: "setOperations",
              operations: operations,
            });
            break;

          case "changeFile":
            // Trigger file change process
            const newFilePath = await promptToSelectFile();

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
                const values = op.values || []; // Get selected values
                await handleOperation(
                  op.columns,
                  operation,
                  userInputs,
                  values
                );
              } else {
                vscode.window.showErrorMessage(
                  `Unsupported operation selected: ${op.operationName}.`
                );
              }
            }
            break;

          case "createCustomOperation":
            const operationData = message.data;
            await createCustomOperationFile(operationData, extensionPath);
            // Reload custom operations
            loadCustomOperations(extensionPath);
            customOperationsByCategory = getCustomOperationsByCategory();
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
              await deleteCustomOperationFile(message.fileName, extensionPath);
              // Reload custom operations
              loadCustomOperations(extensionPath);
              customOperationsByCategory = getCustomOperationsByCategory();
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
              await deleteCategory(categoryToDelete, extensionPath);
              // Reload custom operations
              loadCustomOperations(extensionPath);
              customOperationsByCategory = getCustomOperationsByCategory();
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
              extensionPath
            );
            panel.webview.postMessage({
              command: "setOperationDetails",
              operation: operationDetails,
            });
            break;

          case "updateCustomOperation":
            await updateCustomOperationFile(message.data, extensionPath);
            // Reload custom operations
            loadCustomOperations(extensionPath);
            customOperationsByCategory = getCustomOperationsByCategory();
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

          case "requestColumnValues":
            const columnName = message.columnName;
            const uniqueValues = await getUniqueValuesFromColumn(
              columnName,
              selectedFilePath
            );
            panel.webview.postMessage({
              command: "setColumnValues",
              values: uniqueValues,
              columnName: columnName, // Include column name for reference
            });
            break;

          case "showMessage":
            if (message.type === "info") {
              vscode.window.showInformationMessage(message.message);
            } else if (message.type === "error") {
              vscode.window.showErrorMessage(message.message);
            }
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

// Function to prompt the user to select a file
async function promptToSelectFile() {
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

module.exports = {
  openWebviewForSelection,
  promptToSelectFile,
};
