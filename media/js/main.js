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

// Variables to store user selections
let selectedCategory = null;
let selectedOperation = null;
let selectedColumns = [];
let selectedOperationRequiresInput = false;
let selectedOperationPlaceholders = [];
let selectedOperationRequiresColumns = false;
let selectedOperationRequiresColumnValues = false;
let existingCategories = [];

let selectedValues = []; // Store selected values in order
let currentColumnIndex = 0;

let navigationHistory = [];
// Array to store queued operations
let operationQueue = [];

// Get references to user input elements
const userInputContainer = document.getElementById("userInputContainer");
const userInputFieldsContainer = document.getElementById(
  "userInputFieldsContainer"
);

// Reset selections function
function resetSelections() {
  // Reset selection variables
  selectedCategory = null;
  selectedOperation = null;
  selectedColumns = [];
  selectedOperationRequiresInput = false;
  selectedOperationPlaceholders = [];
  selectedOperationRequiresColumns = false;
  selectedOperationRequiresColumnValues = false;

  selectedValues = []; // Reset selected values
  currentColumnIndex = 0;

  // Reset UI selections
  // Deselect category
  const categoryList = document.getElementById("categoryList");
  if (categoryList) {
    Array.from(categoryList.children).forEach((el) =>
      el.classList.remove("selected")
    );
  }

  // Clear operations list
  const operationList = document.getElementById("operationList");
  if (operationList) {
    operationList.innerHTML = "";
  }

  // Deselect columns
  const columnList = document.getElementById("columnList");
  if (columnList) {
    Array.from(columnList.children).forEach((el) =>
      el.classList.remove("selected")
    );
  }

  // Hide user input container
  userInputContainer.style.display = "none";
  userInputFieldsContainer.innerHTML = "";
}

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
  .addEventListener("click", queueOperation);

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
  operationQueue = [];
  updateOperationQueueDisplay();
});

// Function to queue an operation
function queueOperation() {
  if (!selectedCategory || !selectedOperation) {
    showMessage("Please ensure you have completed the operation selection.");
    return;
  }
  if (selectedOperationRequiresColumns && selectedColumns.length === 0) {
    showMessage("Please select at least one column for this operation.");
    return;
  }

  let userInputs = [];
  if (selectedOperationRequiresInput) {
    const userInputFields = document.querySelectorAll(".userInputField");
    userInputFields.forEach((input) => {
      userInputs.push(input.value.trim());
    });
  }

  // Add the operation to the queue
  operationQueue.push({
    category: selectedCategory,
    operationName: selectedOperation,
    columns: selectedColumns.slice(),
    userInputs: userInputs,
    values: selectedValues.slice(), // Include selected values
  });

  // Update the operation queue display
  updateOperationQueueDisplay();

  // Reset selections for the next operation
  resetSelections();
  navigateToPage("mainMenu", navigationHistory);
}

// Function to update the displayed operation queue
function updateOperationQueueDisplay() {
  const operationQueueList = document.getElementById("operationQueue");
  operationQueueList.innerHTML = ""; // Clear the list

  operationQueue.forEach((op, index) => {
    let listItem = document.createElement("li");
    listItem.textContent = `${index + 1}. ${op.operationName}`;
    if (op.columns && op.columns.length > 0) {
      listItem.textContent += ` on [${op.columns.join(", ")}]`;
    }
    if (op.userInputs && op.userInputs.length > 0) {
      listItem.textContent += ` with inputs: "${op.userInputs.join('", "')}"`;
    }
    if (op.values && op.values.length > 0) {
      const valuesStr = op.values.map((v) => v.value).join('", "');
      listItem.textContent += ` with values: "${valuesStr}"`;
    }
    operationQueueList.appendChild(listItem);
  });
}

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

// Category selection handling
function setCategoryOptions(categories) {
  existingCategories = categories; // Store for later use
  const categoryList = document.getElementById("categoryList");
  categoryList.innerHTML = ""; // Clear previous categories
  categories.forEach((category) => {
    const option = document.createElement("li");
    option.textContent = category;
    option.addEventListener("click", () => {
      Array.from(categoryList.children).forEach((el) =>
        el.classList.remove("selected")
      );
      option.classList.add("selected");
      selectedCategory = category;
    });
    categoryList.appendChild(option);
  });
}

// Operation selection handling
function setOperationOptions(operations) {
  const operationList = document.getElementById("operationList");
  operationList.innerHTML = ""; // Clear previous operations
  operations.forEach((operation) => {
    const option = document.createElement("li");
    option.textContent = operation.name;
    option.addEventListener("click", () => {
      Array.from(operationList.children).forEach((el) =>
        el.classList.remove("selected")
      );
      option.classList.add("selected");
      selectedOperation = operation.name;
      selectedOperationRequiresInput = operation.needsUserInput || false;
      selectedOperationPlaceholders = operation.userInputPlaceholders || [];
      selectedOperationRequiresColumns = operation.requiresColumns || false;
      selectedOperationRequiresColumnValues =
        operation.requiresColumnValues || false;

      // Show or hide the appropriate buttons
      if (selectedOperationRequiresColumns) {
        document.getElementById("nextFromOperation").style.display =
          "inline-flex";
        document.getElementById("finishOperation").style.display = "none";
      } else {
        document.getElementById("nextFromOperation").style.display = "none";
        document.getElementById("finishOperation").style.display =
          "inline-flex";
      }

      if (selectedOperationRequiresInput) {
        userInputContainer.style.display = "block";
        userInputFieldsContainer.innerHTML = ""; // Clear previous inputs

        selectedOperationPlaceholders.forEach((placeholder, index) => {
          const inputDiv = document.createElement("div");
          inputDiv.className = "user-input-item";

          const label = document.createElement("label");
          label.textContent = placeholder;

          const inputField = document.createElement("input");
          inputField.type = "text";
          inputField.className = "userInputField";
          inputField.dataset.index = index;
          inputField.required = true;

          inputDiv.appendChild(label);
          inputDiv.appendChild(inputField);
          userInputFieldsContainer.appendChild(inputDiv);
        });
      } else {
        userInputContainer.style.display = "none";
      }
    });
    operationList.appendChild(option);
  });
}

// Columns selection handling
function setColumnOptions(columns) {
  const columnList = document.getElementById("columnList");
  columnList.innerHTML = ""; // Clear previous columns
  columns.forEach((column) => {
    const option = document.createElement("li");
    option.textContent = column;
    option.addEventListener("click", () => {
      if (option.classList.contains("selected")) {
        option.classList.remove("selected");
        selectedColumns = selectedColumns.filter((col) => col !== column);
      } else {
        option.classList.add("selected");
        selectedColumns.push(column);
      }
    });
    columnList.appendChild(option);
  });
}

// Function to request column values for a specific column
function requestColumnValues(columnName) {
  vscode.postMessage({
    command: "requestColumnValues",
    columnName: columnName,
  });
}

// Function to display column values
function displayColumnValues(values, columnName) {
  const columnValuesList = document.getElementById("columnValuesList");
  const columnValuesPageTitle = document.querySelector("#columnValuesPage h2");
  columnValuesList.innerHTML = ""; // Clear previous values
  columnValuesPageTitle.textContent = `Select Values for Column "${columnName}"`;

  values.forEach((value) => {
    const listItem = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = value;
    checkbox.dataset.column = columnName; // Store column name
    checkbox.className = "column-value-checkbox";

    const label = document.createElement("label");
    label.textContent = value;

    // Check if the value is already selected (useful when navigating back)
    const existingIndex = selectedValues.findIndex(
      (item) => item.value === value && item.column === columnName
    );
    if (existingIndex !== -1) {
      checkbox.checked = true;
    }

    // Event listener for checkbox change
    checkbox.addEventListener("change", (event) => {
      if (event.target.checked) {
        // Add to selectedValues
        selectedValues.push({
          value: event.target.value,
          column: columnName,
        });
      } else {
        // Remove from selectedValues
        selectedValues = selectedValues.filter(
          (item) =>
            !(item.value === event.target.value && item.column === columnName)
        );
      }
    });

    listItem.appendChild(checkbox);
    listItem.appendChild(label);
    columnValuesList.appendChild(listItem);
  });
}

// Next button on Column Values Page
document.getElementById("nextColumnValue").addEventListener("click", () => {
  // Collect selected values from the checkboxes
  const checkboxes = document.querySelectorAll(".column-value-checkbox");
  const selectedValuesForCurrentColumn = Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => ({
      value: checkbox.value,
      column: checkbox.dataset.column,
    }));

  // Remove any existing values for the current column
  selectedValues = selectedValues.filter(
    (item) => item.column !== selectedColumns[currentColumnIndex]
  );

  // Add the selected values to the 'selectedValues' array
  selectedValues.push(...selectedValuesForCurrentColumn);

  currentColumnIndex++;
  if (currentColumnIndex < selectedColumns.length) {
    // Request values for the next column
    requestColumnValues(selectedColumns[currentColumnIndex]);
  } else {
    // All columns processed, proceed
    navigateToPage("mainMenu", navigationHistory);
  }
});

// Skip button on Column Values Page
document.getElementById("skipColumnValue").addEventListener("click", () => {
  // Proceed without selecting any values for this column
  currentColumnIndex++;
  if (currentColumnIndex < selectedColumns.length) {
    // Request values for the next column
    requestColumnValues(selectedColumns[currentColumnIndex]);
  } else {
    // All columns processed, proceed
    navigateToPage("mainMenu", navigationHistory);
  }
});

// Back button on Column Values Page
document.getElementById("backColumnValue").addEventListener("click", () => {
  const currentColumn = selectedColumns[currentColumnIndex];
  // Remove any selected values for this column
  selectedValues = selectedValues.filter(
    (item) => item.column !== currentColumn
  );

  if (currentColumnIndex > 0) {
    currentColumnIndex--;
    requestColumnValues(selectedColumns[currentColumnIndex]);
  } else {
    // Go back to columns page
    navigateToPage("columnPage", navigationHistory);
  }
});

// Next button from Category Page
document.getElementById("nextFromCategory").addEventListener("click", () => {
  if (!selectedCategory) {
    showMessage("Please select a category.");
    return;
  }
  // Request operations for the selected category
  vscode.postMessage({
    command: "categorySelected",
    category: selectedCategory,
  });
  navigateToPage("operationPage", navigationHistory);
});

// Next button from Operation Page
document.getElementById("nextFromOperation").addEventListener("click", () => {
  if (!selectedOperation) {
    showMessage("Please select an operation.");
    return;
  }
  // Request columns from the extension
  navigateToPage("columnPage", navigationHistory);
});

// Finish button on Operation Page (for operations that don't require columns)
document.getElementById("finishOperation").addEventListener("click", () => {
  if (!selectedOperation) {
    showMessage("Please select an operation.");
    return;
  }
  navigateToPage("mainMenu", navigationHistory);
});

// Finish button on Columns Page
document.getElementById("finishColumns").addEventListener("click", () => {
  if (selectedOperationRequiresColumns && selectedColumns.length === 0) {
    showMessage("Please select at least one column.");
    return;
  }
  if (selectedOperationRequiresColumnValues) {
    // Navigate to the column values selection page
    currentColumnIndex = 0;
    selectedValues = []; // Reset selected values
    requestColumnValues(selectedColumns[currentColumnIndex]);
    navigateToPage("columnValuesPage", navigationHistory);
  } else {
    navigateToPage("mainMenu", navigationHistory);
  }
});

// Event listener for "Create Custom Operation" button
document
  .getElementById("createCustomOperationButton")
  .addEventListener("click", () => {
    navigateToPage("createCustomOperationPage", navigationHistory);
  });

// Event listener for "Manage Custom Operations" button
document
  .getElementById("manageCustomOperationsButton")
  .addEventListener("click", () => {
    navigateToPage("manageCustomOperationsPage", navigationHistory);
    // Request custom operations from the extension
    vscode.postMessage({ command: "requestCustomOperations" });
  });

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
      existingCategories
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
    existingCategories
  );
});

operationCategoryInput.addEventListener("focus", () => {
  onCategoryInputFocus(
    operationCategoryInput,
    onCategoryInputChange,
    existingCategories,
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
    existingCategories
  );
});

editOperationCategoryInput.addEventListener("focus", () => {
  onEditCategoryInputFocus(
    editOperationCategoryInput,
    onEditCategoryInputChange,
    existingCategories,
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
      existingCategories
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

// Notify the extension that the webview is ready
vscode.postMessage({ command: "ready" });
