// custom_operations/filter_by_value.js
module.exports = {
  name: "Filter by Value",
  category: "Filtering",
  needsUserInput: true, // Indicate that this operation requires user input
  userInputPlaceholder: "Add your filter (ex: < 10 , > 25)", // This will be displayed in the UI
  operation: (columns, userInput) => {
    return `
filtered_df = df[df["${columns[0]}"] ${userInput}]
print("Filtered DataFrame:")
print(filtered_df)
  `;
  },
};
