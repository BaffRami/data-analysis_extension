const vscode = require("vscode");

// Function to add code to a Jupyter notebook cell
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

module.exports = {
  addCodeCell,
};
