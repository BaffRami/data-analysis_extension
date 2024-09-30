// custom_operations/scatter_plot.js
module.exports = {
  name: "Scatter Plot",
  category: "Plotting",
  operation: (columns) => {
    if (columns.length < 2) {
      throw new Error("Scatter Plot requires exactly two columns.");
    }
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
