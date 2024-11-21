
module.exports = {
  name: "Paried Sample t-Test",
  category: "Tests",
  needsUserInput: true,
  requiresColumns: true,
  requiresColumnValues: true, 
  userInputPlaceholders: ["group1","group2"],
  operationCode: `from scipy.stats import ttest_rel

&i0 = df[df['&c0']=='&v0']
&i1 = df[df['&c0']=='&v1']

ttest_rel(&i0['&c1'], &i1['&c1'])`, // Store the raw operation code
};
