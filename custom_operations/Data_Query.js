
module.exports = {
  name: "Data Query",
  category: "Data Cleaning",
  needsUserInput: true,
  userInputPlaceholders: ["Query (use &ci for column[i])"],
  operation: (columns, userInputs) => {
    return `
df = df.query("${userInputs[0]}")
    `;
  },
};
