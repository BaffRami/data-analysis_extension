// autoCompleteEdit.js

export function onEditCategoryInputChange(
  editOperationCategoryInput,
  editCategorySuggestionsContainer,
  existingCategories
) {
  const inputValue = editOperationCategoryInput.value.toLowerCase();
  editCategorySuggestionsContainer.innerHTML = ""; // Clear previous suggestions

  if (inputValue === "") {
    editCategorySuggestionsContainer.style.display = "none";
    return;
  }

  const filteredCategories = existingCategories.filter((category) =>
    category.toLowerCase().includes(inputValue)
  );

  if (filteredCategories.length === 0) {
    editCategorySuggestionsContainer.style.display = "none";
    return;
  }

  filteredCategories.forEach((category) => {
    const suggestionItem = document.createElement("div");
    suggestionItem.classList.add("suggestion-item");
    suggestionItem.textContent = category;

    suggestionItem.addEventListener("click", () => {
      editOperationCategoryInput.value = category;
      editCategorySuggestionsContainer.innerHTML = "";
      editCategorySuggestionsContainer.style.display = "none";
    });

    editCategorySuggestionsContainer.appendChild(suggestionItem);
  });

  editCategorySuggestionsContainer.style.display = "block";
}

export function onEditCategoryInputFocus(
  editOperationCategoryInput,
  onEditCategoryInputChange,
  existingCategories,
  editCategorySuggestionsContainer
) {
  if (editOperationCategoryInput.value !== "") {
    onEditCategoryInputChange(
      editOperationCategoryInput,
      editCategorySuggestionsContainer,
      existingCategories
    );
  }
}

export function onBlurEdit(editCategorySuggestionsContainer) {
  setTimeout(() => {
    editCategorySuggestionsContainer.style.display = "none";
  }, 200);
}
