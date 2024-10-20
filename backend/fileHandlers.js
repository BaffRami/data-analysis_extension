// fileHandlers.js

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const xlsx = require("xlsx");

// Function to get file headers
function getFileHeaders(filePath) {
  return new Promise((resolve, reject) => {
    const fileExtension = path.extname(filePath).toLowerCase();

    try {
      if (fileExtension === ".csv") {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("headers", (headers) => resolve(headers))
          .on("error", (error) => reject(error));
      } else if (fileExtension === ".xlsx") {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        const headers = jsonData[0];
        resolve(headers);
      } else if (fileExtension === ".json") {
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const headers = Object.keys(jsonData[0]);
        resolve(headers);
      } else {
        throw new Error("Unsupported file format");
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Function to fetch unique values from a column
function getUniqueValuesFromColumn(columnName, filePath) {
  return new Promise((resolve, reject) => {
    const fileExtension = path.extname(filePath).toLowerCase();
    const valuesSet = new Set();

    try {
      if (fileExtension === ".csv") {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (row) => {
            valuesSet.add(row[columnName]);
          })
          .on("end", () => resolve(Array.from(valuesSet)))
          .on("error", (error) => reject(error));
      } else if (fileExtension === ".xlsx") {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);
        jsonData.forEach((row) => {
          valuesSet.add(row[columnName]);
        });
        resolve(Array.from(valuesSet));
      } else if (fileExtension === ".json") {
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        jsonData.forEach((row) => {
          valuesSet.add(row[columnName]);
        });
        resolve(Array.from(valuesSet));
      } else {
        throw new Error("Unsupported file format");
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Function to fetch the entire dataset for preview
function getPreviewData(filePath) {
  return new Promise((resolve, reject) => {
    const fileExtension = path.extname(filePath).toLowerCase();
    const data = [];

    try {
      if (fileExtension === ".csv") {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (row) => {
            data.push(Object.values(row)); // Capture all rows
          })
          .on("end", () => resolve(data))
          .on("error", (error) => reject(error));
      } else if (fileExtension === ".xlsx") {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        resolve(jsonData); // Return all rows including the header
      } else if (fileExtension === ".json") {
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const keys = Object.keys(jsonData[0]);
        const preview = jsonData.map((row) => keys.map((key) => row[key]));
        resolve([keys, ...preview]); // Return all rows
      } else {
        throw new Error("Unsupported file format");
      }
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  getFileHeaders,
  getUniqueValuesFromColumn,
  getPreviewData,
};
