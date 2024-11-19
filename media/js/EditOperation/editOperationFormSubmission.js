import { showMessage } from "../DisplayFunctions/showMessage.js";

// Function to handle the edit custom operation form submission
export function handleEditCustomOperation(
  event,
  vscode,
  navigateToPage,
  navigationHistory,
  editOperationCategoryInput,
  existingCategories
) {
  event.preventDefault();

  // Get form values
  const operationName = document.getElementById("editOperationName").value;
  let operationCategory = editOperationCategoryInput.value.trim();
  const needsUserInput = document.getElementById("editNeedsUserInput").checked;
  const operationCode = document.getElementById("editOperationCode").value;
  const requiresColumns = document.getElementById(
    "editRequiresColumns"
  ).checked;
  const requiresColumnValues = document.getElementById(
    "editRequiresColumnValues"
  ).checked;
  const fileName = document.getElementById("editOperationFileName").value;

  // Collect multiple user input placeholders
  let userInputPlaceholders = [];
  if (needsUserInput) {
    const userInputFields = document.querySelectorAll(
      ".editUserInputPlaceholder"
    );
    userInputFields.forEach((input) => {
      userInputPlaceholders.push(input.value.trim());
    });
  }

  // Perform case-insensitive category matching
  const matchedCategory = existingCategories.find(
    (cat) => cat.toLowerCase() === operationCategory.toLowerCase()
  );
  if (matchedCategory) {
    operationCategory = matchedCategory; // Use the existing category with original casing
  }

  // Validate operation code for column placeholders
  const columnPlaceholderRegex = /&c\d+/;
  const columnValuePlaceholderRegex = /&v\d+/;

  if (!requiresColumns && columnPlaceholderRegex.test(operationCode)) {
    showMessage(
      "You cannot use &c0, &c1, etc., in the operation code when 'Requires Column Selection' is unchecked."
    );
    return;
  }
  if (requiresColumns && !columnPlaceholderRegex.test(operationCode)) {
    showMessage(
      "Operation code must contain at least one &c0, &c1, etc., when 'Requires Column Selection' is checked."
    );
    return;
  }

  // Validate operation code for column value placeholders
  if (
    !requiresColumnValues &&
    columnValuePlaceholderRegex.test(operationCode)
  ) {
    showMessage(
      "You cannot use &v0, &v1, etc., in the operation code when 'Requires Column Values' is unchecked."
    );
    return;
  }
  if (
    requiresColumnValues &&
    !columnValuePlaceholderRegex.test(operationCode)
  ) {
    showMessage(
      "Operation code must contain at least one &v0, &v1, etc., when 'Requires Column Values' is checked."
    );
    return;
  }

  // Send the data to the extension backend
  vscode.postMessage({
    command: "updateCustomOperation",
    data: {
      name: operationName,
      category: operationCategory,
      needsUserInput: needsUserInput,
      userInputPlaceholders: userInputPlaceholders,
      operationCode: operationCode,
      requiresColumns: requiresColumns,
      requiresColumnValues: requiresColumnValues,
      fileName: fileName,
    },
  });

  // Reset the form and UI
  resetEditOperationForm();

  // Navigate back to Manage Custom Operations page
  navigateToPage("manageCustomOperationsPage", navigationHistory);

  // Refresh the custom operations list
  vscode.postMessage({ command: "requestCustomOperations" });
}

// Function to reset the form after submission
function resetEditOperationForm() {
  document.getElementById("editCustomOperationForm").reset();
  document.getElementById("editUserInputsContainer").style.display = "none";
  document.getElementById("editUserInputsList").innerHTML = "";
  document.getElementById("editColumnPlaceholderNote").style.display = "none";
  document.getElementById("editColumnValuePlaceholderNote").style.display =
    "none";
}
