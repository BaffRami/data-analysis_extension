
module.exports = {
  name: "Data Query",
  category: "Data Cleaning",
  needsUserInput: false,
  requiresColumns: true,
  requiresColumnValues: true, 
  userInputPlaceholders: [],
  operationCode: `df = df.query('&c0 == "&v0"')`, // Store the raw operation code
};
