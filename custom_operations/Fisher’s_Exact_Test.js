
module.exports = {
  name: "Fisher’s Exact Test",
  category: "Tests",
  needsUserInput: true,
  requiresColumns: false,
  userInputPlaceholders: ["row1 values: (use x, y)","row2 values: (use x, y)"],
  operationCode: `import scipy.stats as stats

data = [[&i0],
         [&i1]]

print(stats.fisher_exact(data))`, // Store the raw operation code
  operation: (columns, userInputs) => {
    return `
import scipy.stats as stats

data = [[${userInputs[0]}],
         [${userInputs[1]}]]

print(stats.fisher_exact(data))
    `;
  },
};
