
module.exports = {
  name: "Line Plot 2C",
  category: "Plotting",
  needsUserInput: false,
  requiresColumns: true,
  requiresColumnValues: false,
  userInputPlaceholders: [],
  operationCode: `import matplotlib.pyplot as plt

plt.figure(figsize=(10, 6))
plt.plot(df['&c0'], df['&c1'], marker='o')
plt.title('Line Plot of &c1 over &c0')
plt.xlabel('&c0')
plt.ylabel('&c1')
plt.show()
`, // Store the raw operation code
};
