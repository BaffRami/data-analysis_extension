
module.exports = {
  name: "Standard Deviation",
  category: "Descriptive Statistics",
  needsUserInput: false,
  requiresColumns: true,
  requiresColumnValues: false,
  userInputPlaceholders: [],
  operationCode: `std_dev = df['&c0'].std()
print(f"Standard Deviation of &c0: {std_dev}")
`, // Store the raw operation code
};
