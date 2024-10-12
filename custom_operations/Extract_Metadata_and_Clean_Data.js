module.exports = {
  name: "Extract Metadata and Clean Data",
  category: "Data Cleaning",
  needsUserInput: false,
  userInputPlaceholders: [],
  requiresColumns: true,
  operation: (columns, userInputs) => {
    return `
question_map = {}
for col in df.columns:
    question_map[col] = df[col][0]
question_map

df = df.drop([0,1])
    `;
  },
};
