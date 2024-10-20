// customOperations.js

const fs = require("fs");
const path = require("path");

let customOperationsByCategory = {}; // This will hold the loaded operations

function loadCustomOperations(extensionPath) {
  customOperationsByCategory = {}; // Reset the object
  const customOperationsDir = path.join(extensionPath, "custom_operations");

  if (fs.existsSync(customOperationsDir)) {
    const files = fs.readdirSync(customOperationsDir);

    files.forEach((file) => {
      const operationPath = path.join(customOperationsDir, file);

      if (fs.statSync(operationPath).isFile() && file.endsWith(".js")) {
        try {
          delete require.cache[require.resolve(operationPath)]; // Clear cache
          const operation = require(operationPath);

          // Add the file name to the operation object
          operation.fileName = file;

          // Use the category as-is to preserve original casing
          const category = operation.category;

          if (!customOperationsByCategory[category]) {
            customOperationsByCategory[category] = [];
          }
          customOperationsByCategory[category].push(operation);
        } catch (error) {
          console.error(`Failed to load operation ${file}:`, error);
        }
      }
    });
  }
}

function getCustomOperationsByCategory() {
  return customOperationsByCategory;
}

// Function to find an operation by name
function findOperationByName(name) {
  for (const category in customOperationsByCategory) {
    const operation = customOperationsByCategory[category].find(
      (op) => op.name === name
    );
    if (operation) {
      return operation;
    }
  }
  return null;
}

// Function to get the list of custom operations
function getCustomOperationsList() {
  let customOperations = [];
  for (const category in customOperationsByCategory) {
    customOperationsByCategory[category].forEach((op) => {
      customOperations.push({
        name: op.name,
        category: op.category,
        fileName: op.fileName || `${op.name.replace(/\s+/g, "_")}.js`,
      });
    });
  }
  return customOperations;
}

// Function to create a custom operation file
function createCustomOperationFile(operationData, extensionPath) {
  const customOperationsDir = path.join(extensionPath, "custom_operations");

  // Ensure the directory exists
  if (!fs.existsSync(customOperationsDir)) {
    fs.mkdirSync(customOperationsDir);
  }

  // Generate a valid filename
  const fileName = `${operationData.name.replace(/\s+/g, "_")}.js`;
  const filePath = path.join(customOperationsDir, fileName);

  // Create the content of the JS file
  const fileContent = `
module.exports = {
  name: "${operationData.name}",
  category: "${operationData.category}",
  needsUserInput: ${operationData.needsUserInput},
  requiresColumns: ${operationData.requiresColumns},
  requiresColumnValues: ${operationData.requiresColumnValues},
  userInputPlaceholders: ${JSON.stringify(operationData.userInputPlaceholders)},
  operationCode: \`${
    operationData.operationCode
  }\`, // Store the raw operation code
};
`;

  // Write the file
  fs.writeFileSync(filePath, fileContent, "utf8");
}

// Function to get operation details for editing
function getOperationDetails(fileName, extensionPath) {
  const customOperationsDir = path.join(extensionPath, "custom_operations");
  const filePath = path.join(customOperationsDir, fileName);

  if (fs.existsSync(filePath)) {
    try {
      const operationModule = require(filePath);
      const fileContent = fs.readFileSync(filePath, "utf8");

      // Extract the raw operation code
      const operationCodeMatch = fileContent.match(
        /operationCode:\s*`([^`]*)`/s
      );
      const rawOperationCode = operationCodeMatch
        ? operationCodeMatch[1].trim()
        : "";

      return {
        name: operationModule.name,
        category: operationModule.category,
        needsUserInput: operationModule.needsUserInput,
        userInputPlaceholders: operationModule.userInputPlaceholders || [],
        requiresColumns: operationModule.requiresColumns,
        requiresColumnValues: operationModule.requiresColumnValues || false,
        rawOperationCode: rawOperationCode,
        fileName: fileName, // Include the file name for reference
      };
    } catch (error) {
      console.error(`Failed to load operation ${fileName}:`, error);
      throw new Error(`Failed to load operation ${fileName}.`);
    }
  } else {
    throw new Error(`Operation file "${fileName}" not found.`);
  }
}

// Function to update an existing custom operation file
function updateCustomOperationFile(operationData, extensionPath) {
  const customOperationsDir = path.join(extensionPath, "custom_operations");
  const filePath = path.join(customOperationsDir, operationData.fileName);

  if (fs.existsSync(filePath)) {
    try {
      // Create the content of the JS file
      const fileContent = `
module.exports = {
  name: "${operationData.name}",
  category: "${operationData.category}",
  needsUserInput: ${operationData.needsUserInput},
  requiresColumns: ${operationData.requiresColumns},
  requiresColumnValues: ${operationData.requiresColumnValues}, 
  userInputPlaceholders: ${JSON.stringify(operationData.userInputPlaceholders)},
  operationCode: \`${
    operationData.operationCode
  }\`, // Store the raw operation code
};
`;

      // Write the updated content to the file
      fs.writeFileSync(filePath, fileContent, "utf8");
    } catch (error) {
      console.error("Update operation error:", error);
      throw error;
    }
  } else {
    throw new Error(`Operation file "${operationData.fileName}" not found.`);
  }
}

// Function to delete a custom operation file
function deleteCustomOperationFile(fileName, extensionPath) {
  const customOperationsDir = path.join(extensionPath, "custom_operations");
  const filePath = path.join(customOperationsDir, fileName);

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("Delete operation error:", error);
      throw error;
    }
  } else {
    throw new Error(`Operation file "${fileName}" not found.`);
  }
}

// Function to delete all operations under a category
function deleteCategory(categoryName, extensionPath) {
  const customOperationsDir = path.join(extensionPath, "custom_operations");

  if (customOperationsByCategory[categoryName]) {
    const operations = customOperationsByCategory[categoryName];
    for (const operation of operations) {
      const fileName = operation.fileName;
      const filePath = path.join(customOperationsDir, fileName);

      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error(
            `Failed to delete operation "${operation.name}":`,
            error
          );
        }
      }
    }
  } else {
    throw new Error(`Category "${categoryName}" not found.`);
  }
}

module.exports = {
  loadCustomOperations,
  getCustomOperationsByCategory,
  findOperationByName,
  getCustomOperationsList,
  createCustomOperationFile,
  getOperationDetails,
  updateCustomOperationFile,
  deleteCustomOperationFile,
  deleteCategory,
};
