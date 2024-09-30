module.exports = {
  name: "Sum", // The name that will appear in the operations list
  category: "Descriptive Statistics", // The category under which this operation falls
  operation: (columns) => {
    if (columns.length !== 1) {
      throw new Error(
        "Sum operation can only be applied to a single column at a time."
      );
    }

    const column = columns[0].replace(/[^a-zA-Z0-9]/g, "_"); // Replace spaces/special characters with underscores

    return `
sum_${column} = df["${columns[0]}"].sum()
print("Sum of ${columns[0]}: ", sum_${column})
  `;
  },
};
