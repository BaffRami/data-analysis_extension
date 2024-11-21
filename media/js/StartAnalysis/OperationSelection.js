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
      input.classList.add("input-error"); // Add error styling for empty fields (later)
    } else {
      input.classList.remove("input-error"); // Remove error styling if filled (later)
    }
  });

  if (!allFilled) {
    showMessage("Please fill in all required fields."); // Notify the user
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
      // Clear previous selection styling and select the clicked operation
      Array.from(operationList.children).forEach((el) =>
        el.classList.remove("selected")
      );
      option.classList.add("selected");

      // Update the selections object with the selected operation's properties
      selections.selectedOperation = operation.name;
      selections.selectedOperationRequiresInput =
        operation.needsUserInput || false;
      selections.selectedOperationPlaceholders =
        operation.userInputPlaceholders || [];
      selections.selectedOperationRequiresColumns =
        operation.requiresColumns || false;
      selections.selectedOperationRequiresColumnValues =
        operation.requiresColumnValues || false;

      // Toggle button visibility based on whether columns are required
      if (selections.selectedOperationRequiresColumns) {
        document.getElementById("nextFromOperation").style.display =
          "inline-flex";
        document.getElementById("finishOperation").style.display = "none";
      } else {
        document.getElementById("nextFromOperation").style.display = "none";
        document.getElementById("finishOperation").style.display =
          "inline-flex";
      }

      // Show or hide user input fields based on whether the operation requires inputs
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
    operationList.appendChild(option); // Add the option to the operation list
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
