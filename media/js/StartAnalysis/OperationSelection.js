// OperationSelection.js

import { selections } from "./Selections.js";
import { showMessage } from "../DisplayFunctions/showMessage.js";
import { navigateToPage } from "../navigation.js";

const userInputContainer = document.getElementById("userInputContainer");
const userInputFieldsContainer = document.getElementById(
  "userInputFieldsContainer"
);

function validateUserInputs() {
  const inputFields = document.querySelectorAll(".userInputField");
  let allFilled = true;

  inputFields.forEach((input) => {
    if (!input.value.trim()) {
      allFilled = false;
      input.classList.add("input-error"); // Optional: add error styling
    } else {
      input.classList.remove("input-error"); // Remove error styling if filled
    }
  });

  if (!allFilled) {
    showMessage("Please fill in all required fields.");
  }

  return allFilled;
}

export function setOperationOptions(operations) {
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
      selections.selectedOperation = operation.name;
      selections.selectedOperationRequiresInput =
        operation.needsUserInput || false;
      selections.selectedOperationPlaceholders =
        operation.userInputPlaceholders || [];
      selections.selectedOperationRequiresColumns =
        operation.requiresColumns || false;
      selections.selectedOperationRequiresColumnValues =
        operation.requiresColumnValues || false;

      // Show or hide the appropriate buttons
      if (selections.selectedOperationRequiresColumns) {
        document.getElementById("nextFromOperation").style.display =
          "inline-flex";
        document.getElementById("finishOperation").style.display = "none";
      } else {
        document.getElementById("nextFromOperation").style.display = "none";
        document.getElementById("finishOperation").style.display =
          "inline-flex";
      }

      if (selections.selectedOperationRequiresInput) {
        userInputContainer.style.display = "block";
        userInputFieldsContainer.innerHTML = ""; // Clear previous inputs

        selections.selectedOperationPlaceholders.forEach(
          (placeholder, index) => {
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
          }
        );
      } else {
        userInputContainer.style.display = "none";
      }
    });
    operationList.appendChild(option);
  });
}

export function setupOperationPageEventListeners(navigationHistory) {
  // Next button from Operation Page
  document.getElementById("nextFromOperation").addEventListener("click", () => {
    if (!selections.selectedOperation) {
      showMessage("Please select an operation.");
      return;
    }
    if (selections.selectedOperationRequiresInput && !validateUserInputs()) {
      return; // Stop if validation fails
    }
    navigateToPage("columnPage", navigationHistory);
  });

  // Finish button on Operation Page (for operations that don't require columns)
  document.getElementById("finishOperation").addEventListener("click", () => {
    if (!selections.selectedOperation) {
      showMessage("Please select an operation.");
      return;
    }
    if (selections.selectedOperationRequiresInput && !validateUserInputs()) {
      return;
    } // Stop if validation fails
    navigateToPage("mainMenu", navigationHistory);
  });
}
