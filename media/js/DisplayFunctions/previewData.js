// previewData.js

// function to preview data
export function displayDataPreview(data, navigateToPage, navigationHistory) {
  const dataPreviewTable = document.getElementById("dataPreviewTable");
  dataPreviewTable.innerHTML = ""; // Clear previous preview data
  data.forEach((row, index) => {
    const rowElement = document.createElement("tr");
    row.forEach((cell) => {
      const cellElement = document.createElement(index === 0 ? "th" : "td");
      cellElement.textContent = cell;
      rowElement.appendChild(cellElement);
    });
    dataPreviewTable.appendChild(rowElement);
  });
  navigateToPage("dataPreviewContainer", navigationHistory); // Show the preview page
}
