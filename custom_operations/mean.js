
module.exports = {
  name: "Mean",
  category: "Descriptive Statistics",
  needsUserInput: false,
  requiresColumns: true,
  requiresColumnValues: false, 
  userInputPlaceholders: [],
  operationCode: `mean_value = df['&c0'].mean()
print(f"Mean of &c0: {mean_value}")`, // Store the raw operation code
};
