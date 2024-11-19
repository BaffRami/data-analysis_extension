
module.exports = {
  name: "Min Max",
  category: "Descriptive Statistics",
  needsUserInput: false,
  requiresColumns: true,
  requiresColumnValues: false,
  userInputPlaceholders: [],
  operationCode: `min_value = df['&c0'].min()
max_value = df['&c0'].max()
print(f"Minimum of &c0: {min_value}")
print(f"Maximum of &c0: {max_value}")
`, // Store the raw operation code
};
