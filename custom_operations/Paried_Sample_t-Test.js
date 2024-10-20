
module.exports = {
  name: "Paried Sample t-Test",
  category: "Tests",
  needsUserInput: true,
  requiresColumns: true,
  userInputPlaceholders: ["group1","value1","group2","value2"],
  operationCode: `from scipy.stats import ttest_rel

&i0 = df[df['&c0']=='&i1']
&i2 = df[df['&c0']=='&i3']

ttest_rel(&i0['&c1'], &i2['&c1'])`, // Store the raw operation code
  operation: (columns, userInputs) => {
    return `
from scipy.stats import ttest_rel

${userInputs[0]} = df[df['${columns[0]}']=='${userInputs[1]}']
${userInputs[2]} = df[df['${columns[0]}']=='${userInputs[3]}']

ttest_rel(${userInputs[0]}['${columns[1]}'], ${userInputs[2]}['${columns[1]}'])
    `;
  },
};
