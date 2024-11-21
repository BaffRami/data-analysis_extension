
module.exports = {
  name: "Fisher's Exact Test",
  category: "Tests",
  needsUserInput: false,
  requiresColumns: true,
  requiresColumnValues: false, 
  userInputPlaceholders: [],
  operationCode: `from scipy.stats import fisher_exact
import pandas as pd

contingency_table = pd.crosstab(df['&c0'], df['&c1'])

if contingency_table.shape != (2, 2):
    print("Error: Fisher's Exact Test is only applicable for 2x2 contingency tables.")
else:

    odds_ratio, p_value = fisher_exact(contingency_table)

    print("Fisher's Exact Test Results:")
    print(f"Odds Ratio: {odds_ratio}")
    print(f"P-value: {p_value}")`, // Store the raw operation code
};
