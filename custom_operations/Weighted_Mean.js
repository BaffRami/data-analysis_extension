
module.exports = {
  name: "Weighted Mean",
  category: "Descriptive Statistics",
  needsUserInput: false,
  requiresColumns: true,
  requiresColumnValues: false,
  userInputPlaceholders: [],
  operationCode: `weighted_sum = (df['&c0'] * df['&c1']).sum()
total_weights = df['&c1'].sum()

if total_weights == 0:
    print("Error: Total weight is zero, cannot calculate weighted mean.")
else:
    weighted_mean = weighted_sum / total_weights
    print(f"Weighted Mean of &c0 with weights from &c1: {weighted_mean}")
`, // Store the raw operation code
};
