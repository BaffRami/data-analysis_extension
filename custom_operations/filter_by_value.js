// custom_operations/filter_by_value.js
module.exports = {
  name: "Filter by Value",
  category: "Filtering",
  needsUserInput: true,
  requiresColumns: true, // Indicate that this operation requires user inputs
  userInputPlaceholders: ["Add your filter (ex: < 10 , > 25)"], // This will be displayed in the UI
  operation: (columns, userInputs) => {
    return `
filtered_df = df[df["${columns[0]}"] ${userInputs[0]}]
print("Filtered DataFrame:")
print(filtered_df)
  `;
  },
};
