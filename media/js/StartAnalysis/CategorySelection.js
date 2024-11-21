import { selections } from "./Selections.js";
import { showMessage } from "../DisplayFunctions/showMessage.js";
import { navigateToPage } from "../navigation.js";

export function setCategoryOptions(categories) {
  // Clear and store the provided categories for later use
  selections.existingCategories.length = 0;
  selections.existingCategories.push(...categories); // Store for later use
  const categoryList = document.getElementById("categoryList");
  categoryList.innerHTML = ""; // Clear previous categories

  // Create a list item for each category and attach a click event
  categories.forEach((category) => {
    const option = document.createElement("li");
    option.textContent = category;
    option.addEventListener("click", () => {
      // Clear previous selections and mark the clicked category as selected
      Array.from(categoryList.children).forEach((el) =>
        el.classList.remove("selected")
      );
      option.classList.add("selected");
      selections.selectedCategory = category; // Update the selected category in selections
    });
    categoryList.appendChild(option); // Add the category option to the list
  });
}

export function setupCategoryPageEventListeners(vscode, navigationHistory) {
  // Event listener for the "Next" button to navigate to the operation page
  document.getElementById("nextFromCategory").addEventListener("click", () => {
    if (!selections.selectedCategory) {
      showMessage("Please select a category."); // Show message if no category is selected
      return;
    }
    // Request operations for the selected category
    vscode.postMessage({
      command: "categorySelected",
      category: selections.selectedCategory,
    });

    // Navigate to the operation page
    navigateToPage("operationPage", navigationHistory);
  });
}
