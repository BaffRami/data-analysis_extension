import { selections } from "./Selections.js";
import { showMessage } from "../DisplayFunctions/showMessage.js";
import { navigateToPage } from "../navigation.js";

export function setColumnOptions(columns) {
  const columnList = document.getElementById("columnList");
  columnList.innerHTML = ""; // Clear previous columns

  // Create a list item for each column and attach a click event
  columns.forEach((column) => {
    const option = document.createElement("li");
    option.textContent = column;
    option.addEventListener("click", () => {
      if (option.classList.contains("selected")) {
        // Deselect the column if it's already selected
        option.classList.remove("selected");
        selections.selectedColumns = selections.selectedColumns.filter(
          (col) => col !== column
        );
      } else {
        // Select the column and add it to the list of selected columns
        option.classList.add("selected");
        selections.selectedColumns.push(column);
      }
    });
    columnList.appendChild(option); // Add the column option to the list
  });
}

export function setupColumnsPageEventListeners(
  vscode,
  navigationHistory,
  requestColumnValues
) {
  // Event listener for the "Finish" button on the columns page
  document.getElementById("finishColumns").addEventListener("click", () => {
    // Ensure at least one column is selected if the operation requires columns
    if (
      selections.selectedOperationRequiresColumns &&
      selections.selectedColumns.length === 0
    ) {
      showMessage("Please select at least one column.");
      return;
    }
    if (selections.selectedOperationRequiresColumnValues) {
      // Navigate to the column values selection page if column values are required
      selections.currentColumnIndex = 0;
      selections.selectedValues.length = 0; // Reset selected values

      // Request values for the first selected column
      requestColumnValues(
        selections.selectedColumns[selections.currentColumnIndex],
        vscode
      );
      navigateToPage("columnValuesPage", navigationHistory);
    } else {
      // If no column values are required, navigate to the main menu
      navigateToPage("mainMenu", navigationHistory);
    }
  });
}
