// main.js

const vscode = acquireVsCodeApi();

import { navigateToPage, goBack, resetNavigation } from "./navigation.js";
import { displayDataPreview } from "./DisplayFunctions/previewData.js";
import { showMessage } from "./DisplayFunctions/showMessage.js";
import { displayCategoriesForManagement } from "./DisplayFunctions/categoryManagement.js";
import { displayCustomOperations } from "./DisplayFunctions/displayOperations.js";
import { handleCreateCustomOperation } from "./CreateOperation/createOperationFormSubmission.js";
import { handleEditCustomOperation } from "./EditOperation/editOperationFormSubmission.js";
import {
  CancelEditCustomOperation,
  ResetCustomOperationFields,
} from "./CreateOperation/cancelAndResetForms.js";
import { populateEditOperationForm } from "./EditOperation/populateEditForm.js";
import {
  addUserInput,
  removeUserInput,
  addUserInputEdit,
  removeUserInputEdit,
} from "./CreateOperation/userInput.js";
import {
  onEditCategoryInputChange,
  onEditCategoryInputFocus,
  onBlurEdit,
} from "./EditOperation/autoCompleteEdit.js";
import { handleBackendMessages } from "./messageHandler.js";
import {
  onCategoryInputChange,
  onCategoryInputFocus,
  onBlur,
} from "./CreateOperation/autoComplete.js";

import { selections, resetSelections } from "./StartAnalysis/Selections.js";

import {
  operationQueue,
  queueOperation,
  updateOperationQueueDisplay,
} from "./StartAnalysis/OperationQueue.js";
import {
  setCategoryOptions,
  setupCategoryPageEventListeners,
} from "./StartAnalysis/CategorySelection.js";
import {
  setOperationOptions,
  setupOperationPageEventListeners,
} from "./StartAnalysis/OperationSelection.js";
import {
  setColumnOptions,
  setupColumnsPageEventListeners,
} from "./StartAnalysis/ColumnSelection.js";
import {
  displayColumnValues,
  setupColumnValuesPageEventListeners,
} from "./StartAnalysis/ColumnValuesSelection.js";

// Variables
let navigationHistory = [];

// Event listener for "Start Analysis" button
document.getElementById("startAnalysisButton").addEventListener("click", () => {
  resetSelections(); // Reset previous selections
  navigateToPage("categoryPage", navigationHistory);
  // Request categories from the extension
  vscode.postMessage({ command: "requestCategories" });
});

// Event listener for "Manage Categories" button
document
  .getElementById("manageCategoriesButton")
  .addEventListener("click", () => {
    navigateToPage("manageCategoriesPage", navigationHistory);
    // Request categories from the extension
    vscode.postMessage({ command: "requestCategoriesForManagement" });
  });

// **Event listener for "Create Custom Operation" button**
document
  .getElementById("createCustomOperationButton")
  .addEventListener("click", () => {
    navigateToPage("createCustomOperationPage", navigationHistory);
    // Request categories to populate autocomplete
    vscode.postMessage({ command: "requestCategories" });
  });

// **Event listener for "Manage Custom Operations" button**
document
  .getElementById("manageCustomOperationsButton")
  .addEventListener("click", () => {
    navigateToPage("manageCustomOperationsPage", navigationHistory);
    // Request custom operations from the extension
    vscode.postMessage({ command: "requestCustomOperations" });
  });

// Event listener for "Change File" button
document.getElementById("changeFileButton").addEventListener("click", () => {
  vscode.postMessage({ command: "changeFile" });
});

// Event listener for "Preview Data" button
document.getElementById("previewButton").addEventListener("click", () => {
  vscode.postMessage({ command: "previewData" });
});

// Event listener for "Queue Operation" button
document
  .getElementById("queueOperation")
  .addEventListener("click", () => queueOperation(navigationHistory));

// Event listener for "Perform Operation(s)" button
document.getElementById("performOperations").addEventListener("click", () => {
  if (operationQueue.length === 0) {
    showMessage("No operations queued.");
    return;
  }

  vscode.postMessage({
    command: "performOperations",
    operations: operationQueue,
  });

  // Clear the operation queue after performing
  operationQueue.length = 0;
  updateOperationQueueDisplay();
});

// Event listeners for "Back" buttons
document.querySelectorAll(".backButton").forEach((button) => {
  button.addEventListener("click", () => {
    goBack(navigationHistory);
  });
});

// Event listeners for "Main Menu" buttons
document.querySelectorAll(".mainMenuButton").forEach((button) => {
  button.addEventListener("click", () => {
    resetNavigation(navigationHistory);
    resetSelections();
    navigateToPage("mainMenu", navigationHistory);
  });
});

// Setup event listeners for Category Page
setupCategoryPageEventListeners(vscode, navigationHistory);

// Setup event listeners for Operation Page
setupOperationPageEventListeners(navigationHistory);

// Setup event listeners for Columns Page
setupColumnsPageEventListeners(vscode, navigationHistory, requestColumnValues);

// Setup event listeners for Column Values Page
setupColumnValuesPageEventListeners(
  vscode,
  navigationHistory,
  requestColumnValues
);

// Handle adding and removing user input placeholders
document
  .getElementById("addUserInputButton")
  .addEventListener("click", addUserInput);

document
  .getElementById("removeUserInputButton")
  .addEventListener("click", removeUserInput);

const operationCategoryInput = document.getElementById("operationCategory");
const categorySuggestionsContainer = document.getElementById(
  "categorySuggestions"
);

// Handle the custom operation form submission
document
  .getElementById("customOperationForm")
  .addEventListener("submit", (event) => {
    handleCreateCustomOperation(
      event,
      vscode,
      navigateToPage,
      navigationHistory,
      operationCategoryInput,
      selections.existingCategories
    );
  });

// Event listener for "Reset All Fields" button
document
  .getElementById("resetCustomOperationFormButton")
  .addEventListener("click", () =>
    ResetCustomOperationFields(categorySuggestionsContainer)
  );

// Event listeners for custom autocomplete in Create Operation Form
operationCategoryInput.addEventListener("input", () => {
  onCategoryInputChange(
    operationCategoryInput,
    categorySuggestionsContainer,
    selections.existingCategories
  );
});

operationCategoryInput.addEventListener("focus", () => {
  onCategoryInputFocus(
    operationCategoryInput,
    onCategoryInputChange,
    selections.existingCategories,
    categorySuggestionsContainer
  );
});

operationCategoryInput.addEventListener("blur", () => {
  onBlur(categorySuggestionsContainer);
});

// Edit Custom Operation Form Handlers
const editOperationCategoryInput = document.getElementById(
  "editOperationCategory"
);
const editCategorySuggestionsContainer = document.getElementById(
  "editCategorySuggestions"
);

// Event listeners for custom autocomplete in Edit Operation Form
editOperationCategoryInput.addEventListener("input", () => {
  onEditCategoryInputChange(
    editOperationCategoryInput,
    editCategorySuggestionsContainer,
    selections.existingCategories
  );
});

editOperationCategoryInput.addEventListener("focus", () => {
  onEditCategoryInputFocus(
    editOperationCategoryInput,
    onEditCategoryInputChange,
    selections.existingCategories,
    editCategorySuggestionsContainer
  );
});

editOperationCategoryInput.addEventListener("blur", () => {
  onBlurEdit(editCategorySuggestionsContainer);
});

// Handle adding and removing user input placeholders in Edit Form
document
  .getElementById("editAddUserInputButton")
  .addEventListener("click", addUserInputEdit);

document
  .getElementById("editRemoveUserInputButton")
  .addEventListener("click", removeUserInputEdit);

// Handle the edit operation form submission
document
  .getElementById("editCustomOperationForm")
  .addEventListener("submit", (event) =>
    handleEditCustomOperation(
      event,
      vscode,
      navigateToPage,
      navigationHistory,
      editOperationCategoryInput,
      selections.existingCategories
    )
  );

// Event listener for "Cancel" button in Edit Form
document
  .getElementById("cancelEditOperationButton")
  .addEventListener("click", () =>
    CancelEditCustomOperation(
      editCategorySuggestionsContainer,
      navigateToPage,
      navigationHistory
    )
  );

// Message handling from the extension
window.addEventListener("message", (event) =>
  handleBackendMessages(
    vscode,
    event,
    setColumnOptions,
    setCategoryOptions,
    displayCategoriesForManagement,
    setOperationOptions,
    displayDataPreview,
    displayCustomOperations,
    populateEditOperationForm,
    navigateToPage,
    navigationHistory,
    displayColumnValues
  )
);

// Function to request column values for a specific column
function requestColumnValues(columnName, vscode) {
  vscode.postMessage({
    command: "requestColumnValues",
    columnName: columnName,
  });
}

// Notify the extension that the webview is ready
vscode.postMessage({ command: "ready" });
