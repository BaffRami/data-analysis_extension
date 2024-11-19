// Function to populate the Edit Operation Form with existing data
export function populateEditOperationForm(
  operation,
  navigateToPage,
  navigationHistory
) {
  document.getElementById("editOperationName").value = operation.name;
  document.getElementById("editOperationCategory").value = operation.category;
  document.getElementById("editNeedsUserInput").checked =
    operation.needsUserInput;
  document.getElementById("editOperationCode").value =
    operation.rawOperationCode;
  document.getElementById("editRequiresColumns").checked =
    operation.requiresColumns;
  document.getElementById("editRequiresColumnValues").checked =
    operation.requiresColumnValues;
  document.getElementById("editOperationFileName").value = operation.fileName;

  // Handle user input placeholders
  const userInputsContainer = document.getElementById(
    "editUserInputsContainer"
  );
  const userInputsList = document.getElementById("editUserInputsList");

  if (operation.needsUserInput) {
    userInputsContainer.style.display = "block";
    userInputsList.innerHTML = ""; // Clear any existing inputs

    operation.userInputPlaceholders.forEach((placeholder, index) => {
      const inputDiv = document.createElement("div");
      inputDiv.className = "user-input-item";

      const label = document.createElement("label");
      label.textContent = `User Input Placeholder ${index + 1}:`;

      const inputField = document.createElement("input");
      inputField.type = "text";
      inputField.className = "editUserInputPlaceholder";
      inputField.required = true;
      inputField.value = placeholder;

      inputDiv.appendChild(label);
      inputDiv.appendChild(inputField);
      userInputsList.appendChild(inputDiv);
    });
  } else {
    userInputsContainer.style.display = "none";
    userInputsList.innerHTML = "";
  }

  // Show or hide the column placeholder note
  const columnPlaceholderNote = document.getElementById(
    "editColumnPlaceholderNote"
  );
  if (operation.requiresColumns) {
    columnPlaceholderNote.style.display = "block";
  } else {
    columnPlaceholderNote.style.display = "none";
  }

  // Show or hide the column value placeholder note
  const columnValuePlaceholderNote = document.getElementById(
    "editColumnValuePlaceholderNote"
  );
  if (operation.requiresColumnValues) {
    columnValuePlaceholderNote.style.display = "block";
  } else {
    columnValuePlaceholderNote.style.display = "none";
  }

  // Navigate to the Edit Custom Operation Page
  navigateToPage("editCustomOperationPage", navigationHistory);
}
