export const selections = {
  selectedCategory: null,
  selectedOperation: null,
  selectedColumns: [],
  selectedOperationRequiresInput: false,
  selectedOperationPlaceholders: [],
  selectedOperationRequiresColumns: false,
  selectedOperationRequiresColumnValues: false,
  existingCategories: [],
  selectedValues: [],
  currentColumnIndex: 0,
};

export function resetSelections() {
  // Reset selection variables
  selections.selectedCategory = null;
  selections.selectedOperation = null;
  selections.selectedColumns = [];
  selections.selectedOperationRequiresInput = false;
  selections.selectedOperationPlaceholders = [];
  selections.selectedOperationRequiresColumns = false;
  selections.selectedOperationRequiresColumnValues = false;

  selections.selectedValues = []; // Reset selected values
  selections.currentColumnIndex = 0;

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
  const userInputContainer = document.getElementById("userInputContainer");
  const userInputFieldsContainer = document.getElementById(
    "userInputFieldsContainer"
  );
  userInputContainer.style.display = "none";
  userInputFieldsContainer.innerHTML = "";
}
