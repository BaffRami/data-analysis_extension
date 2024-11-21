
module.exports = {
  name: "Bar Chart 1C",
  category: "Plotting",
  needsUserInput: false,
  requiresColumns: true,
  requiresColumnValues: false, 
  userInputPlaceholders: [],
  operationCode: `import matplotlib.pyplot as plt
import seaborn as sns

plt.figure(figsize=(10, 6))
sns.countplot(x='&c0', data=df)
plt.title('Bar Chart of &c0')
plt.xlabel('&c0')
plt.ylabel('Count')
plt.show()`, // Store the raw operation code
};
