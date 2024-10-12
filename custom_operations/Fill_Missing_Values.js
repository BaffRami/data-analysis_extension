module.exports = {
  name: "Fill Missing Values",
  category: "Data Cleaning",
  needsUserInput: true,
  userInputPlaceholders: ["Value :"],
  requiresColumns: true,
  operation: (columns, userInputs) => {
    return `
df['${columns[0]}'] = df['${columns[0]}'].fillna("${userInputs[0]}")

    `;
  },
};
