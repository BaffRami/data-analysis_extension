
module.exports = {
  name: "Independent Two Sample t-Test",
  category: "Tests",
  needsUserInput: true,
  requiresColumns: true,
  requiresColumnValues: true, 
  userInputPlaceholders: ["group1","group2"],
  operationCode: `from scipy.stats import ttest_ind

&i0 = df[df['&c0']=='&v0']
&i1 = df[df['&c0']=='&v1']

ttest_ind(&i0['&c1'], &i1['&c1'])`, // Store the raw operation code
  operation: (columns, userInputs, values) => {
    return `
from scipy.stats import ttest_ind

${userInputs[0]} = df[df['${columns[0]}']=='${values[0].value}']
${userInputs[1]} = df[df['${columns[0]}']=='${values[1].value}']

ttest_ind(${userInputs[0]}['${columns[1]}'], ${userInputs[1]}['${columns[1]}'])
    `;
  },
};
