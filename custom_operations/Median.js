
module.exports = {
  name: "Median",
  category: "Descriptive Statistics",
  needsUserInput: false,
  requiresColumns: true,
  requiresColumnValues: false,
  userInputPlaceholders: [],
  operationCode: `median_value = df['&c0'].median()
print(f"Median of &c0: {median_value}")
`, // Store the raw operation code
};
