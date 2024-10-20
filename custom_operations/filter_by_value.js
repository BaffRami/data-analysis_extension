
module.exports = {
  name: "Filter by Value",
  category: "Filtering",
  needsUserInput: true,
  requiresColumns: true,
  requiresColumnValues: false, 
  userInputPlaceholders: ["Add your filter (ex: < 10 , > 25)"],
  operationCode: `filtered_df = df[df["&c0"] &i0]`, // Store the raw operation code
  operation: (columns, userInputs, values) => {
    return `
filtered_df = df[df["${columns[0]}"] ${userInputs[0]}]
    `;
  },
};
