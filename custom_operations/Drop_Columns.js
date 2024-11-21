
module.exports = {
  name: "Drop Column",
  category: "Data Cleaning",
  needsUserInput: false,
  requiresColumns: true,
  requiresColumnValues: false, 
  userInputPlaceholders: [],
  operationCode: `df.drop(['&c0'], axis=1)`, // Store the raw operation code
};
