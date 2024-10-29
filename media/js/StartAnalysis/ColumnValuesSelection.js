// ColumnValuesSelection.js

import { selections } from "./Selections.js";
import { navigateToPage } from "../navigation.js";

export function displayColumnValues(values, columnName) {
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
    const existingIndex = selections.selectedValues.findIndex(
      (item) => item.value === value && item.column === columnName
    );
    if (existingIndex !== -1) {
      checkbox.checked = true;
    }

    // Event listener for checkbox change
    checkbox.addEventListener("change", (event) => {
      if (event.target.checked) {
        // Add to selectedValues
        selections.selectedValues.push({
          value: event.target.value,
          column: columnName,
        });
      } else {
        // Remove from selectedValues
        selections.selectedValues = selections.selectedValues.filter(
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

export function setupColumnValuesPageEventListeners(
  vscode,
  navigationHistory,
  requestColumnValues
) {
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
    selections.selectedValues = selections.selectedValues.filter(
      (item) =>
        item.column !==
        selections.selectedColumns[selections.currentColumnIndex]
    );

    // Add the selected values to the 'selectedValues' array
    selections.selectedValues.push(...selectedValuesForCurrentColumn);

    selections.currentColumnIndex++;
    if (selections.currentColumnIndex < selections.selectedColumns.length) {
      // Request values for the next column
      requestColumnValues(
        selections.selectedColumns[selections.currentColumnIndex],
        vscode
      );
    } else {
      // All columns processed, proceed
      navigateToPage("mainMenu", navigationHistory);
    }
  });

  // Skip button on Column Values Page
  document.getElementById("skipColumnValue").addEventListener("click", () => {
    // Proceed without selecting any values for this column
    selections.currentColumnIndex++;
    if (selections.currentColumnIndex < selections.selectedColumns.length) {
      // Request values for the next column
      requestColumnValues(
        selections.selectedColumns[selections.currentColumnIndex],
        vscode
      );
    } else {
      // All columns processed, proceed
      navigateToPage("mainMenu", navigationHistory);
    }
  });

  // Back button on Column Values Page
  document.getElementById("backColumnValue").addEventListener("click", () => {
    const currentColumn =
      selections.selectedColumns[selections.currentColumnIndex];
    // Remove any selected values for this column
    selections.selectedValues = selections.selectedValues.filter(
      (item) => item.column !== currentColumn
    );

    if (selections.currentColumnIndex > 0) {
      selections.currentColumnIndex--;
      requestColumnValues(
        selections.selectedColumns[selections.currentColumnIndex],
        vscode
      );
    } else {
      // Go back to columns page
      navigateToPage("columnPage", navigationHistory);
    }
  });
}
