
module.exports = {
  name: "Remove Duplicates",
  category: "Data Cleaning",
  needsUserInput: false,
  userInputPlaceholders: [],
  operation: (columns, userInputs) => {
    return `
df = df.drop_duplicates()

    `;
  },
};
