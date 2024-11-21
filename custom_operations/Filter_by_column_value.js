
module.exports = {
  name: "Filter by column value",
  category: "Filtering",
  needsUserInput: true,
  requiresColumns: true,
  requiresColumnValues: true, 
  userInputPlaceholders: ["Add Filter (<, >, ==, etc..)"],
  operationCode: `filtered_df = df[df['&c0'] &i0 '&v0']`, // Store the raw operation code
};
