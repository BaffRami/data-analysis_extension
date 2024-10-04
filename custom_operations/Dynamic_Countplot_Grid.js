module.exports = {
  name: "Dynamic Countplot Grid",
  category: "Plotting",
  needsUserInput: true,
  userInputPlaceholders: [
    "Columns to Plot (comma-seperated: e.g, column0,column1 or &c0,&c1)",
    "Plot Titles (comma-seperated)",
    "Number of Rows in Grid",
    "Number of Columns in Grid",
    "Output Directory for Plots",
  ],
  operation: (columns, userInputs) => {
    return `
import matplotlib.pyplot as plt
import seaborn as sns
import os

# User Inputs
columns = ["${columns}"]
titles = ["${userInputs[1]}"]
rows = ${userInputs[2]}
cols = ${userInputs[3]}
output_dir = "${userInputs[4]}"

# Ensure output directory exists
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Subset DataFrame for specified columns
selected_df = df[columns]

# Create subplot grid
fig, axs = plt.subplots(rows, cols, figsize=(5 * cols, 4 * rows))
axs = axs.flatten()  # Flatten to 1D array for easy indexing

for i, column in enumerate(columns):
    if i < len(axs):
        sorted_categories = sorted(df[column].unique())
        sns.countplot(data=selected_df, x=column, ax=axs[i], order=sorted_categories, color="steelblue", stat='percent')
        axs[i].set_xticklabels(sorted_categories, rotation=45)
        axs[i].set_title(titles[i])
    else:
        axs[i].axis('off')  # Hide unused subplots

# Hide any remaining unused subplots
for j in range(i + 1, len(axs)):
    axs[j].axis('off')

plt.tight_layout()
plt.show()

# Save individual plots
for i, column in enumerate(columns):
    sorted_categories = sorted(df[column].unique())
    plt.figure(figsize=(8, 6))
    sns.countplot(data=selected_df, x=column, order=sorted_categories, color="steelblue", stat='percent')
    plt.xticks(rotation=45)
    plt.title(titles[i])
    plt.ylim(0, 100)
    plt.tight_layout()
    plt.savefig(f"{output_dir}/{column}.png", bbox_inches='tight', pad_inches=0.1)
    plt.close()

    `;
  },
};
