export function onCategoryInputChange(
  operationCategoryInput,
  categorySuggestionsContainer,
  existingCategories
) {
  const inputValue = operationCategoryInput.value.toLowerCase();
  categorySuggestionsContainer.innerHTML = ""; // Clear previous suggestions

  if (inputValue === "") {
    categorySuggestionsContainer.style.display = "none"; // Hide suggestions if input is empty
    return;
  }

  // Filter categories based on the input value (case-insensitive)
  const filteredCategories = existingCategories.filter((category) =>
    category.toLowerCase().includes(inputValue)
  );

  if (filteredCategories.length === 0) {
    categorySuggestionsContainer.style.display = "none"; // Hide suggestions if no matches are found
    return;
  }

  // Create suggestion items for each matching category
  filteredCategories.forEach((category) => {
    const suggestionItem = document.createElement("div");
    suggestionItem.classList.add("suggestion-item");
    suggestionItem.textContent = category;

    // Set the input value and clear suggestions when a suggestion is clicked
    suggestionItem.addEventListener("click", () => {
      operationCategoryInput.value = category;
      categorySuggestionsContainer.innerHTML = "";
      categorySuggestionsContainer.style.display = "none";
    });

    categorySuggestionsContainer.appendChild(suggestionItem); // Add suggestion to the container
  });

  categorySuggestionsContainer.style.display = "block"; // Show the suggestions container
}

export function onCategoryInputFocus(
  operationCategoryInput,
  onCategoryInputChange,
  existingCategories,
  categorySuggestionsContainer
) {
  // Trigger input change handler to display suggestions if the input is not empty
  if (operationCategoryInput.value !== "") {
    onCategoryInputChange(
      operationCategoryInput,
      categorySuggestionsContainer,
      existingCategories
    );
  }
}

export function onBlur(categorySuggestionsContainer) {
  setTimeout(() => {
    categorySuggestionsContainer.style.display = "none"; // Hide the suggestions container
  }, 200); // Delay to ensure click events on suggestions are registered
}
