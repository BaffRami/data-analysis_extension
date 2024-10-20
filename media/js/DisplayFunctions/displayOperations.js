// displayOperations.js

export function displayCustomOperations(customOperations, vscode) {
  const customOperationsList = document.getElementById("customOperationsList");
  customOperationsList.innerHTML = ""; // Clear previous entries

  customOperations.forEach((operation) => {
    const listItem = document.createElement("li");
    listItem.className = "custom-operation-item";
    listItem.innerHTML = `
      <div class="operation-details">
        <span class="operation-name">${operation.name}</span>
        <span class="operation-category">(${operation.category})</span>
      </div>
      <div class="operation-buttons">
        <button class="edit-operation-button" data-filename="${operation.fileName}">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="delete-operation-button" data-filename="${operation.fileName}">
          <i class="fas fa-trash-alt"></i> Delete
        </button>
      </div>
    `;

    customOperationsList.appendChild(listItem);
  });

  // Add event listeners for delete buttons
  const deleteButtons = customOperationsList.querySelectorAll(
    ".delete-operation-button"
  );
  deleteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const fileName = event.currentTarget.dataset.filename;
      // Send a message to the extension to confirm deletion
      vscode.postMessage({
        command: "confirmDeleteCustomOperation",
        fileName: fileName,
      });
    });
  });

  // Add event listeners for edit buttons
  const editButtons = customOperationsList.querySelectorAll(
    ".edit-operation-button"
  );
  editButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const fileName = event.currentTarget.dataset.filename;
      // Send a message to the extension to request operation details
      vscode.postMessage({
        command: "requestOperationDetails",
        fileName: fileName,
      });
    });
  });
}
