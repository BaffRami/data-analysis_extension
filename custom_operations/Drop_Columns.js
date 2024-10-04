
module.exports = {
  name: "Drop Columns",
  category: "Data Cleaning",
  needsUserInput: true,
  userInputPlaceholders: ["Columns to Drop (multiple columns are separated by commas)"],
  operation: (columns, userInputs) => {
    return `
df = df.drop(['${userInputs[0]}'], axis=1)

    `;
  },
};
