import { navigateToPage } from "../navigation.js";
import { showMessage } from "../DisplayFunctions/showMessage.js";
import { selections, resetSelections } from "./Selections.js";

// operationQueue array to store queued operations
export let operationQueue = [];

// Function to queue an operation
export function queueOperation(navigationHistory) {
  if (!selections.selectedCategory || !selections.selectedOperation) {
    showMessage("Please ensure you have completed the operation selection.");
    return;
  }
  if (
    selections.selectedOperationRequiresColumns &&
    selections.selectedColumns.length === 0
  ) {
    showMessage("Please select at least one column for this operation.");
    return;
  }

  let userInputs = [];
  if (selections.selectedOperationRequiresInput) {
    const userInputFields = document.querySelectorAll(".userInputField");
    userInputFields.forEach((input) => {
      userInputs.push(input.value.trim());
    });
  }

  // Add the operation to the queue
  operationQueue.push({
    category: selections.selectedCategory,
    operationName: selections.selectedOperation,
    columns: selections.selectedColumns.slice(),
    userInputs: userInputs,
    values: selections.selectedValues.slice(), // Include selected values
  });

  // Update the operation queue display
  updateOperationQueueDisplay();

  // Reset selections for the next operation
  resetSelections();
  navigateToPage("mainMenu", navigationHistory);
}

// Function to update the displayed operation queue
export function updateOperationQueueDisplay() {
  const operationQueueList = document.getElementById("operationQueue");
  operationQueueList.innerHTML = ""; // Clear the list

  operationQueue.forEach((op, index) => {
    // Create list item
    let listItem = document.createElement("li");
    listItem.className = "queue-item";
    listItem.setAttribute("data-index", index); // Store the index

    // Create operation description
    let opDescription = document.createElement("span");
    opDescription.textContent = `${index + 1}. ${op.operationName}`;
    if (op.columns && op.columns.length > 0) {
      opDescription.textContent += ` on [${op.columns.join(", ")}]`;
    }
    if (op.userInputs && op.userInputs.length > 0) {
      opDescription.textContent += ` with inputs: "${op.userInputs.join(
        '", "'
      )}"`;
    }
    if (op.values && op.values.length > 0) {
      const valuesStr = op.values.map((v) => v.value).join('", "');
      opDescription.textContent += ` with values: "${valuesStr}"`;
    }

    // Create buttons container
    let buttonsContainer = document.createElement("div");
    buttonsContainer.className = "queue-item-buttons";

    // Create Move Up button
    let moveUpButton = document.createElement("button");
    moveUpButton.className = "queue-item-button move-up";
    moveUpButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    moveUpButton.title = "Move Up";
    moveUpButton.addEventListener("click", () => moveOperationUp(index));

    // Create Move Down button
    let moveDownButton = document.createElement("button");
    moveDownButton.className = "queue-item-button move-down";
    moveDownButton.innerHTML = '<i class="fas fa-arrow-down"></i>';
    moveDownButton.title = "Move Down";
    moveDownButton.addEventListener("click", () => moveOperationDown(index));

    // Create Remove button
    let removeButton = document.createElement("button");
    removeButton.className = "queue-item-button remove-operation";
    removeButton.innerHTML = '<i class="fas fa-trash"></i>';
    removeButton.title = "Remove Operation";
    removeButton.addEventListener("click", () => removeOperation(index));

    // Append buttons to container
    buttonsContainer.appendChild(moveUpButton);
    buttonsContainer.appendChild(moveDownButton);
    buttonsContainer.appendChild(removeButton);

    // Append description and buttons to list item
    listItem.appendChild(opDescription);
    listItem.appendChild(buttonsContainer);

    // Append list item to queue
    operationQueueList.appendChild(listItem);
  });
}

// Function to remove an operation from the queue
export function removeOperation(index) {
  operationQueue.splice(index, 1);
  updateOperationQueueDisplay();
}

// Function to move an operation up in the queue
export function moveOperationUp(index) {
  if (index > 0) {
    [operationQueue[index - 1], operationQueue[index]] = [
      operationQueue[index],
      operationQueue[index - 1],
    ];
    updateOperationQueueDisplay();
  }
}

// Function to move an operation down in the queue
export function moveOperationDown(index) {
  if (index < operationQueue.length - 1) {
    [operationQueue[index], operationQueue[index + 1]] = [
      operationQueue[index + 1],
      operationQueue[index],
    ];
    updateOperationQueueDisplay();
  }
}
