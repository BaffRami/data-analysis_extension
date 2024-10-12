module.exports = {
  name: "Pivot Table",
  category: "Data Transformation",
  needsUserInput: true,
  requiresColumns: true,
  userInputPlaceholders:
    "Group by column, Pivot column, Values column, Aggregation (e.g., Product, Year, Sales, sum)",
  operation: (columns, userInput) => {
    return `
pivot_table = df.pivot_table(index='${columns[0]}', columns='${columns[1]}', values='${columns[2]}', aggfunc='${userInputs[0]}')
print("Pivot Table:")
print(pivot_table)
      `;
  },
};
