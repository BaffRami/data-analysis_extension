// function to preview data
export function displayDataPreview(data, navigateToPage, navigationHistory) {
  const dataPreviewTable = document.getElementById("dataPreviewTable");
  dataPreviewTable.innerHTML = ""; // Clear previous preview data

  // Populate the table with new data
  data.forEach((row, index) => {
    const rowElement = document.createElement("tr"); // Create a new table row
    row.forEach((cell) => {
      // Use <th> for the header row, <td> for data rows
      const cellElement = document.createElement(index === 0 ? "th" : "td");
      cellElement.textContent = cell; // Set the cell's text content
      rowElement.appendChild(cellElement); // Append the cell to the current row
    });

    // Append the row to the table
    dataPreviewTable.appendChild(rowElement);
  });
  navigateToPage("dataPreviewContainer", navigationHistory); // Navigate to the data preview page
}
