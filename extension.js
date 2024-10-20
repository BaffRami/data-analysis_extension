// extension.js

const vscode = require("vscode");
const path = require("path");
const {
  openWebviewForSelection,
  promptToSelectFile,
} = require("./backend/webviewHandler");
const { loadCustomOperations } = require("./backend/customOperations");

function activate(context) {
  console.log('Congratulations, your extension "data-analysis" is now active!');

  // Register command to select file
  let disposable = vscode.commands.registerCommand(
    "data-analysis.selectFile",
    async function () {
      try {
        // Prompt to select file
        const selectedFilePath = await promptToSelectFile();

        if (selectedFilePath) {
          // Proceed to open the webview for selection
          await openWebviewForSelection(context, selectedFilePath);
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Command failed: ${error.message}`);
        console.error("Command error:", error);
      }
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate(context) {
  // Any cleanup tasks can be performed here
}

module.exports = {
  activate,
  deactivate,
};
