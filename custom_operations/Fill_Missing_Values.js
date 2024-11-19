
module.exports = {
  name: "Fill Missing Values with mean",
  category: "Data Cleaning",
  needsUserInput: false,
  requiresColumns: true,
  requiresColumnValues: false, 
  userInputPlaceholders: [],
  operationCode: `df['&c0'].fillna(df['&c0'].mean(), inplace=True)`, // Store the raw operation code
};
