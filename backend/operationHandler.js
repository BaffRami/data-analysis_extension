const vscode = require("vscode");
const { addCodeCell } = require("./notebookUtils");

// Function to handle an operation
async function handleOperation(columns, operation, userInputs, values) {
  try {
    // Process user inputs to replace &cX placeholders with actual column names
    const processedUserInputs = userInputs.map((input) => {
      return input.replace(/&c(\d+)/g, (match, p1) => {
        const index = parseInt(p1, 10);
        return columns[index] || match;
      });
    });

    // Prepare operation code
    let operationCode = operation.operationCode;

    // Replace column placeholders
    if (operation.requiresColumns) {
      operationCode = operationCode.replace(/&c(\d+)/g, (match, p1) => {
        const index = parseInt(p1, 10);
        return columns[index] || match;
      });
    }

    // Replace user input placeholders
    if (operation.needsUserInput) {
      operationCode = operationCode.replace(/&i(\d+)/g, (match, p1) => {
        const index = parseInt(p1, 10);
        return processedUserInputs[index] || match;
      });
    }

    // Replace value placeholders
    if (operation.requiresColumnValues) {
      operationCode = operationCode.replace(/&v(\d+)/g, (match, p1) => {
        const index = parseInt(p1, 10);
        const valueObj = values[index];
        if (valueObj) {
          const value = valueObj.value;
          return value;
        } else {
          return match; // Leave placeholder if no value
        }
      });
    }

    // Since we've already processed operationCode, we can use it directly
    const pandasCode = operationCode;

    // Add the generated code to the Jupyter notebook
    await addCodeCell(pandasCode);
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to handle operation: ${error.message}`
    );
    console.error("Operation handling error:", error);
  }
}

module.exports = {
  handleOperation,
};
