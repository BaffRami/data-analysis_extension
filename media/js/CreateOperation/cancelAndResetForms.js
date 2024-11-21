export function CancelEditCustomOperation(
  editCategorySuggestionsContainer,
  navigateToPage,
  navigationHistory
) {
  document.getElementById("editCustomOperationForm").reset();
  // Hide and clear the user inputs container
  document.getElementById("editUserInputsContainer").style.display = "none";
  document.getElementById("editUserInputsList").innerHTML = "";
  // Hide column placeholder notes
  document.getElementById("editColumnPlaceholderNote").style.display = "none";
  document.getElementById("editColumnValuePlaceholderNote").style.display =
    "none";
  // Hide category suggestions
  editCategorySuggestionsContainer.style.display = "none";

  // Navigate back to Manage Custom Operations page
  navigateToPage("manageCustomOperationsPage", navigationHistory);
}

export function ResetCustomOperationFields(categorySuggestionsContainer) {
  // Reset the form
  document.getElementById("customOperationForm").reset();
  // Hide and clear the user inputs container
  document.getElementById("userInputsContainer").style.display = "none";
  document.getElementById("userInputsList").innerHTML = "";
  // Hide column placeholder notes
  document.getElementById("columnPlaceholderNote").style.display = "none";
  document.getElementById("columnValuePlaceholderNote").style.display = "none";
  // Hide category suggestions
  categorySuggestionsContainer.style.display = "none";
}
