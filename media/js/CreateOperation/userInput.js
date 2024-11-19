export function addUserInput() {
  const userInputsList = document.getElementById("userInputsList");
  const inputCount = userInputsList.children.length;

  const inputDiv = document.createElement("div");
  inputDiv.className = "user-input-item";

  const label = document.createElement("label");
  label.textContent = `User Input Placeholder ${inputCount + 1}:`;

  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.className = "userInputPlaceholder";
  inputField.required = true;

  // Append label and input field to the input container
  inputDiv.appendChild(label);
  inputDiv.appendChild(inputField);
  userInputsList.appendChild(inputDiv);
}

export function removeUserInput() {
  const userInputsList = document.getElementById("userInputsList");
  if (userInputsList.children.length > 0) {
    userInputsList.removeChild(userInputsList.lastChild);
  }
}

export function addUserInputEdit() {
  const userInputsList = document.getElementById("editUserInputsList");
  const inputCount = userInputsList.children.length;

  const inputDiv = document.createElement("div");
  inputDiv.className = "user-input-item";

  const label = document.createElement("label");
  label.textContent = `User Input Placeholder ${inputCount + 1}:`;

  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.className = "editUserInputPlaceholder";
  inputField.required = true;

  // Append label and input field to the input container
  inputDiv.appendChild(label);
  inputDiv.appendChild(inputField);
  userInputsList.appendChild(inputDiv);
}

export function removeUserInputEdit() {
  const userInputsList = document.getElementById("editUserInputsList");
  if (userInputsList.children.length > 0) {
    userInputsList.removeChild(userInputsList.lastChild);
  }
}
