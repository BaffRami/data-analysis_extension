// CategorySelection.js

import { selections } from "./Selections.js";
import { showMessage } from "../DisplayFunctions/showMessage.js";
import { navigateToPage } from "../navigation.js";

export function setCategoryOptions(categories) {
  selections.existingCategories.length = 0;
  selections.existingCategories.push(...categories); // Store for later use
  const categoryList = document.getElementById("categoryList");
  categoryList.innerHTML = ""; // Clear previous categories
  categories.forEach((category) => {
    const option = document.createElement("li");
    option.textContent = category;
    option.addEventListener("click", () => {
      Array.from(categoryList.children).forEach((el) =>
        el.classList.remove("selected")
      );
      option.classList.add("selected");
      selections.selectedCategory = category;
    });
    categoryList.appendChild(option);
  });
}

export function setupCategoryPageEventListeners(vscode, navigationHistory) {
  document.getElementById("nextFromCategory").addEventListener("click", () => {
    if (!selections.selectedCategory) {
      showMessage("Please select a category.");
      return;
    }
    // Request operations for the selected category
    vscode.postMessage({
      command: "categorySelected",
      category: selections.selectedCategory,
    });
    navigateToPage("operationPage", navigationHistory);
  });
}
