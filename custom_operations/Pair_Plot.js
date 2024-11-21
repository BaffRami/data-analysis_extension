
module.exports = {
  name: "Pair Plot 3C",
  category: "Plotting",
  needsUserInput: false,
  requiresColumns: true,
  requiresColumnValues: false, 
  userInputPlaceholders: [],
  operationCode: `import seaborn as sns

sns.pairplot(df[['&c0', '&c1', '&c2']])
plt.suptitle('Pair Plot of Selected Columns', y=1.02)
plt.show()`, // Store the raw operation code
};
