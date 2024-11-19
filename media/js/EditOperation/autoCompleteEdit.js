export function onEditCategoryInputChange(
  editOperationCategoryInput,
  editCategorySuggestionsContainer,
  existingCategories
) {
  // Get the current input value and convert it to lowercase for case-insensitive matching
  const inputValue = editOperationCategoryInput.value.toLowerCase();
  editCategorySuggestionsContainer.innerHTML = ""; // Clear previous suggestions

  // If the input is empty, hide the suggestions container and exit
  if (inputValue === "") {
    editCategorySuggestionsContainer.style.display = "none";
    return;
  }

  // Filter existing categories to only those that include the input value
  const filteredCategories = existingCategories.filter((category) =>
    category.toLowerCase().includes(inputValue)
  );

  // If no categories match the input, hide the suggestions container and exit
  if (filteredCategories.length === 0) {
    editCategorySuggestionsContainer.style.display = "none";
    return;
  }

  // Generate a suggestion item for each filtered category
  filteredCategories.forEach((category) => {
    const suggestionItem = document.createElement("div");
    suggestionItem.classList.add("suggestion-item");
    suggestionItem.textContent = category;

    // Add a click event listener to populate the input with the selected category
    suggestionItem.addEventListener("click", () => {
      editOperationCategoryInput.value = category;
      editCategorySuggestionsContainer.innerHTML = "";
      editCategorySuggestionsContainer.style.display = "none";
    });

    // Append the suggestion item to the suggestions container
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
  // Trigger the input change handler if the input field is not empty
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
