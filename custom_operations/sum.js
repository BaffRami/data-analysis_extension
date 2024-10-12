module.exports = {
  name: "Sum",
  category: "Descriptive Statistics",
  needsUserInput: true,
  requiresColumns: false,
  userInputPlaceholders: [
    'Columns to Sum (e.g, "&c0","&c1" etc...)',
    "axis = ? (0 or 1)",
  ],
  operation: (columns, userInputs) => {
    return `
columns_to_sum = [${userInputs[0]}]  # 
df[columns_to_sum] = df[columns_to_sum].apply(pd.to_numeric, errors='coerce')
sum = df[columns_to_sum].sum(axis=${userInputs[1]})
print(sum)

    `;
  },
};
