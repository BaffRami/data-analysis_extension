// checkboxes.js

function toggleDisplay(checkboxId, containerId, listId = null) {
  document.getElementById(checkboxId).addEventListener("change", function () {
    const container = document.getElementById(containerId);
    container.style.display = this.checked ? "block" : "none";

    // If there's a list to clear, clear it when unchecked
    if (!this.checked && listId) {
      document.getElementById(listId).innerHTML = "";
    }
  });
}

// For column placeholder notes
toggleDisplay("requiresColumns", "columnPlaceholderNote");
toggleDisplay("editRequiresColumns", "editColumnPlaceholderNote");

// For column value placeholder notes
toggleDisplay("requiresColumnValues", "columnValuePlaceholderNote");
toggleDisplay("editRequiresColumnValues", "editColumnValuePlaceholderNote");

// For user inputs containers
toggleDisplay("needsUserInput", "userInputsContainer", "userInputsList");
toggleDisplay(
  "editNeedsUserInput",
  "editUserInputsContainer",
  "editUserInputsList"
);
