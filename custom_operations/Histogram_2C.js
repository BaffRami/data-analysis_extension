
module.exports = {
  name: "Histogram 2C",
  category: "Plotting",
  needsUserInput: false,
  requiresColumns: true,
  requiresColumnValues: false,
  userInputPlaceholders: [],
  operationCode: `import matplotlib.pyplot as plt
import seaborn as sns

plt.figure(figsize=(10, 6))
sns.histplot(df['&c0'], kde=True, color='blue', label='&c0', stat='density', alpha=0.5)
sns.histplot(df['&c1'], kde=True, color='orange', label='&c1', stat='density', alpha=0.5)
plt.title('Overlayed Histograms of &c0 and &c1')
plt.xlabel('Value')
plt.ylabel('Density')
plt.legend()
plt.show()
`, // Store the raw operation code
};
