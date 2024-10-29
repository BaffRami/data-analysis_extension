
module.exports = {
  name: "Histogram",
  category: "Plotting",
  needsUserInput: false,
  requiresColumns: true,
  requiresColumnValues: false,
  userInputPlaceholders: [],
  operationCode: `import matplotlib.pyplot as plt
import seaborn as sns

plt.figure(figsize=(10, 6))
sns.histplot(df['&c0'], kde=True)
plt.title('Histogram of &c0')
plt.xlabel('&c0')
plt.ylabel('Frequency')
plt.show()
`, // Store the raw operation code
};
