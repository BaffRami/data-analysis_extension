
module.exports = {
  name: "Box Plot",
  category: "Plotting",
  needsUserInput: false,
  requiresColumns: true,
  requiresColumnValues: false, 
  userInputPlaceholders: [],
  operationCode: `import matplotlib.pyplot as plt
import seaborn as sns

plt.figure(figsize=(10, 6))
sns.boxplot(x='&c0', y='&c1', data=df)
plt.title('Box Plot of &c1 by &c0')
plt.xlabel('&c0')
plt.ylabel('&c1')
plt.show()`, // Store the raw operation code
};
