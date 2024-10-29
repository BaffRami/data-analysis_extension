// ColumnSelection.js

import { selections } from "./Selections.js";
import { showMessage } from "../DisplayFunctions/showMessage.js";
import { navigateToPage } from "../navigation.js";

export function setColumnOptions(columns) {
  const columnList = document.getElementById("columnList");
  columnList.innerHTML = ""; // Clear previous columns
  columns.forEach((column) => {
    const option = document.createElement("li");
    option.textContent = column;
    option.addEventListener("click", () => {
      if (option.classList.contains("selected")) {
        option.classList.remove("selected");
        selections.selectedColumns = selections.selectedColumns.filter(
          (col) => col !== column
        );
      } else {
        option.classList.add("selected");
        selections.selectedColumns.push(column);
      }
    });
    columnList.appendChild(option);
  });
}

export function setupColumnsPageEventListeners(
  vscode,
  navigationHistory,
  requestColumnValues
) {
  document.getElementById("finishColumns").addEventListener("click", () => {
    if (
      selections.selectedOperationRequiresColumns &&
      selections.selectedColumns.length === 0
    ) {
      showMessage("Please select at least one column.");
      return;
    }
    if (selections.selectedOperationRequiresColumnValues) {
      // Navigate to the column values selection page
      selections.currentColumnIndex = 0;
      selections.selectedValues.length = 0; // Reset selected values
      requestColumnValues(
        selections.selectedColumns[selections.currentColumnIndex],
        vscode
      );
      navigateToPage("columnValuesPage", navigationHistory);
    } else {
      navigateToPage("mainMenu", navigationHistory);
    }
  });
}
