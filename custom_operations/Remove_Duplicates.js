
module.exports = {
  name: "Remove Duplicates",
  category: "Data Cleaning",
  needsUserInput: false,
  requiresColumns: false,
  requiresColumnValues: false, 
  userInputPlaceholders: [],
  operationCode: `df.drop_duplicates()`, // Store the raw operation code
};
