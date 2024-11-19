// Function to navigate to a specific page
export function navigateToPage(pageId, navigationHistory) {
  const pages = [
    "mainMenu",
    "categoryPage",
    "operationPage",
    "columnPage",
    "columnValuesPage",
    "dataPreviewContainer",
    "createCustomOperationPage",
    "editCustomOperationPage",
    "manageCustomOperationsPage",
    "manageCategoriesPage",
  ];

  // Hide all pages
  pages.forEach((id) => {
    const pageElement = document.getElementById(id);
    if (pageElement) {
      pageElement.style.display = "none";
    }
  });

  // Show the selected page
  const selectedPage = document.getElementById(pageId);
  if (selectedPage) {
    selectedPage.style.display = "block";
  }

  // Update navigation history
  if (navigationHistory[navigationHistory.length - 1] !== pageId) {
    navigationHistory.push(pageId);
  }
}

// Function to go back to the previous page
export function goBack(navigationHistory) {
  if (navigationHistory.length > 0) {
    navigationHistory.pop(); // Remove current page from the history
    const previousPage = navigationHistory[navigationHistory.length - 1]; // Get the previous page

    if (previousPage) {
      navigateToPage(previousPage, navigationHistory); // Go back to the previous page
    } else {
      navigateToPage("mainMenu", navigationHistory); // Fallback to main menu if no previous page
    }
  } else {
    navigateToPage("mainMenu", navigationHistory); // Fallback to main menu if history is empty
  }
}

// Function to reset the navigation history
export function resetNavigation(navigationHistory) {
  navigationHistory.length = 0; // Clear the array in place without creating a new reference
  navigateToPage("mainMenu", navigationHistory); // Navigate back to the main menu after reset
}
