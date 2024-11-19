
module.exports = {
  name: "Convert to datetime",
  category: "Data Cleaning",
  needsUserInput: false,
  requiresColumns: true,
  requiresColumnValues: false,
  userInputPlaceholders: [],
  operationCode: `df['&c0'] = pd.to_datetime(df['&c0'])
`, // Store the raw operation code
};
