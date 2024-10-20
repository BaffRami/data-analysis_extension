// categoryManagement.js

export function displayCategoriesForManagement(categories, vscode) {
  const categoriesList = document.getElementById("categoriesList");
  categoriesList.innerHTML = ""; // Clear previous entries

  categories.forEach((category) => {
    const listItem = document.createElement("li");
    listItem.className = "category-item";
    listItem.innerHTML = `
      <span><strong>${category}</strong></span>
      <button class="delete-category-button" data-category="${category}">
        <i class="fas fa-trash-alt"></i> Delete
      </button>
    `;

    categoriesList.appendChild(listItem);
  });

  // Add event listeners for delete buttons
  const deleteButtons = categoriesList.querySelectorAll(
    ".delete-category-button"
  );
  deleteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const categoryName = event.currentTarget.dataset.category;
      // Send a message to the extension to confirm deletion
      vscode.postMessage({
        command: "confirmDeleteCategory",
        category: categoryName,
      });
    });
  });
}
