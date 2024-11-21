module.exports = {
  name: "Data Query",
  category: "Data Cleaning",
  needsUserInput: false,
  requiresColumns: true,
  requiresColumnValues: false,
  userInputPlaceholders: [],
  operationCode: `df.query('&c0 == &c1')`, // Store the raw operation code
};
