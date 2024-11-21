// createOperationFormSubmission.js

import { showMessage } from "../DisplayFunctions/showMessage.js";

// Function to handle the create custom operation form submission
export function handleCreateCustomOperation(
  event,
  vscode,
  navigateToPage,
  navigationHistory,
  operationCategoryInput,
  existingCategories
) {
  event.preventDefault();

  // Get form values
  const operationName = document.getElementById("operationName").value;
  let operationCategory = operationCategoryInput.value.trim();
  const needsUserInput = document.getElementById("needsUserInput").checked;
  const operationCode = document.getElementById("operationCode").value;
  const requiresColumns = document.getElementById("requiresColumns").checked;
  const requiresColumnValues = document.getElementById(
    "requiresColumnValues"
  ).checked;

  // Collect multiple user input placeholders
  let userInputPlaceholders = [];
  if (needsUserInput) {
    const userInputFields = document.querySelectorAll(".userInputPlaceholder");
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
    command: "createCustomOperation",
    data: {
      name: operationName,
      category: operationCategory,
      needsUserInput: needsUserInput,
      userInputPlaceholders: userInputPlaceholders,
      operationCode: operationCode,
      requiresColumns: requiresColumns,
      requiresColumnValues: requiresColumnValues,
    },
  });

  // Reset the form and UI
  resetCreateOperationForm();

  // Navigate back to main menu
  navigateToPage("mainMenu", navigationHistory);
}

// Helper function to reset the create operation form
function resetCreateOperationForm() {
  document.getElementById("customOperationForm").reset();
  document.getElementById("userInputsContainer").style.display = "none";
  document.getElementById("userInputsList").innerHTML = "";
  document.getElementById("columnPlaceholderNote").style.display = "none";
  document.getElementById("columnValuePlaceholderNote").style.display = "none";
}
