
module.exports = {
  name: "Scatter Plot",
  category: "Plotting",
  needsUserInput: false,
  requiresColumns: true,
  userInputPlaceholders: [],
  operationCode: `import matplotlib.pyplot as plt

plt.figure(figsize=(10, 6))
plt.scatter(df["&c0"], df["&c1"])
plt.title("Scatter Plot of &c0 vs &c1")
plt.xlabel("&c0")
plt.ylabel("&c1")
plt.show()`, // Store the raw operation code
  operation: (columns, userInputs) => {
    return `
import matplotlib.pyplot as plt

plt.figure(figsize=(10, 6))
plt.scatter(df["${columns[0]}"], df["${columns[1]}"])
plt.title("Scatter Plot of ${columns[0]} vs ${columns[1]}")
plt.xlabel("${columns[0]}")
plt.ylabel("${columns[1]}")
plt.show()
    `;
  },
};
