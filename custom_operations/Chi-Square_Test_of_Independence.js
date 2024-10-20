
module.exports = {
  name: "Chi-Square Test of Independence",
  category: "Tests",
  needsUserInput: true,
  requiresColumns: false,
  userInputPlaceholders: ["data row1 (use x, y, z, etc...)","data row2 (use x, y, z, etc...)"],
  operationCode: `import scipy.stats as stats

data = [[&i0],
        [&i1]]

stats.chi2_contingency(data)`, // Store the raw operation code
  operation: (columns, userInputs) => {
    return `
import scipy.stats as stats

data = [[${userInputs[0]}],
        [${userInputs[1]}]]

stats.chi2_contingency(data)
    `;
  },
};
