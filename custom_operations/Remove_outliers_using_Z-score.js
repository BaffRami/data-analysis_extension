
module.exports = {
  name: "Remove outliers using Z-score",
  category: "Data Cleaning",
  needsUserInput: true,
  requiresColumns: true,
  requiresColumnValues: false, 
  userInputPlaceholders: ["Please Input Threshhold"],
  operationCode: `from scipy import stats
import numpy as np

df = df[(np.abs(stats.zscore(df['&c0'])) < &i0)]`, // Store the raw operation code
};
