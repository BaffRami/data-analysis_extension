
module.exports = {
  name: "Mode",
  category: "Descriptive Statistics",
  needsUserInput: false,
  requiresColumns: true,
  requiresColumnValues: false,
  userInputPlaceholders: [],
  operationCode: `mode_value = df['&c0'].mode().iloc[0]
print(f"Mode of &c0: {mode_value}")
`, // Store the raw operation code
};
