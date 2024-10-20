// messageHandler.js

export function handleBackendMessages(
  vscode,
  event,
  setColumnOptions,
  setCategoryOptions,
  displayCategoriesForManagement,
  setOperationOptions,
  displayDataPreview,
  displayCustomOperations,
  populateEditOperationForm,
  navigateToPage,
  navigationHistory,
  displayColumnValues
) {
  const message = event.data;

  switch (message.command) {
    case "setColumns":
      setColumnOptions(message.columns);
      break;

    case "setCategories":
      setCategoryOptions(message.categories);
      break;

    case "setCategoriesForManagement":
      displayCategoriesForManagement(message.categories, vscode);
      break;

    case "setOperations":
      setOperationOptions(message.operations);
      break;

    case "showDataPreview":
      displayDataPreview(message.data, navigateToPage, navigationHistory);
      break;

    case "setCustomOperations":
      displayCustomOperations(message.customOperations, vscode);
      break;

    case "setOperationDetails":
      populateEditOperationForm(
        message.operation,
        navigateToPage,
        navigationHistory
      );
      break;

    case "setColumnValues":
      displayColumnValues(message.values, message.columnName);
      navigateToPage("columnValuesPage", navigationHistory);
      break;

    case "categoryDeleted":
      // If the current page is managing categories, refresh the list
      if (
        navigationHistory[navigationHistory.length - 1] ===
        "manageCategoriesPage"
      ) {
        vscode.postMessage({ command: "requestCategoriesForManagement" });
      }
      break;

    case "deleteCategorySuccess":
    case "deleteCategoryFailure":
    case "deleteOperationSuccess":
    case "deleteOperationFailure":
      // For handling success/failure, send message to backend to display messages
      vscode.postMessage({
        command: "showMessage",
        type: message.command.includes("Success") ? "info" : "error",
        message: message.message,
      });
      break;

    default:
      console.error(`Unknown command received: ${message.command}`);
      break;
  }
}
