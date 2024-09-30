// custom_operations/correlation_matrix.js
module.exports = {
  name: "Correlation Matrix",
  category: "Descriptive Statistics",
  operation: (columns) => {
    return `
correlation_matrix = df[${JSON.stringify(columns)}].corr()
print("Correlation Matrix:")
print(correlation_matrix)
  `;
  },
};
