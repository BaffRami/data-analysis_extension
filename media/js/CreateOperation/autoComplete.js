// autoComplete.js

export function onCategoryInputChange(
  operationCategoryInput,
  categorySuggestionsContainer,
  existingCategories
) {
  const inputValue = operationCategoryInput.value.toLowerCase();
  categorySuggestionsContainer.innerHTML = ""; // Clear previous suggestions

  if (inputValue === "") {
    categorySuggestionsContainer.style.display = "none";
    return;
  }

  const filteredCategories = existingCategories.filter((category) =>
    category.toLowerCase().includes(inputValue)
  );

  if (filteredCategories.length === 0) {
    categorySuggestionsContainer.style.display = "none";
    return;
  }

  filteredCategories.forEach((category) => {
    const suggestionItem = document.createElement("div");
    suggestionItem.classList.add("suggestion-item");
    suggestionItem.textContent = category;

    suggestionItem.addEventListener("click", () => {
      operationCategoryInput.value = category;
      categorySuggestionsContainer.innerHTML = "";
      categorySuggestionsContainer.style.display = "none";
    });

    categorySuggestionsContainer.appendChild(suggestionItem);
  });

  categorySuggestionsContainer.style.display = "block";
}

export function onCategoryInputFocus(
  operationCategoryInput,
  onCategoryInputChange,
  existingCategories,
  categorySuggestionsContainer
) {
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
    categorySuggestionsContainer.style.display = "none";
  }, 200);
}
