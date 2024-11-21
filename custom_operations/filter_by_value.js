
module.exports = {
  name: "Filter by Value",
  category: "Filtering",
  needsUserInput: true,
  requiresColumns: true,
  requiresColumnValues: false, 
  userInputPlaceholders: ["Add Filter","Add Threshhold"],
  operationCode: `filtered_df = df[df["&c0"] &i0 &i1]`, // Store the raw operation code
};
