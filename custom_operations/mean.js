// custom_operations/mean.js
module.exports = {
  name: "Mean",
  category: "Descriptive Statistics",
  operation: (columns) => {
    return `
mean_${columns[0].replace(/\s/g, "_")} = df["${columns[0]}"].mean()
print("Mean of ${columns[0]}: ", mean_${columns[0].replace(/\s/g, "_")})
  `;
  },
};
