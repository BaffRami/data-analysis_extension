# Data Analysis Extension

Welcome to the **Data Analysis Extension** for Visual Studio Code! This extension is designed to streamline your data analysis workflow by integrating data operations directly into your Jupyter notebooks within VSCode.

## Table of Contents

1.  [Introduction](#introduction)
2.  [Prerequisites](#prerequisites)
3.  [Installation](#installation)
4.  [Getting Started](#getting-started)
5.  [Main Features](#main-features)

    - [1\. Start Analysis](#1-start-analysis)
    - [2\. Create Custom Operation](#2-create-custom-operation)
    - [3\. Manage Custom Operations](#3-manage-custom-operations)
    - [4\. Manage Categories](#4-manage-categories)
    - [5\. Change File](#5-change-file)
    - [6\. Preview Data](#6-preview-data)
    - [7\. Queue Operation](#7-queue-operation)
    - [8\. Perform Operations](#8-perform-operations)

6.  [Custom Operations](#custom-operations)

    - [Creating a Custom Operation](#creating-a-custom-operation)
    - [Editing a Custom Operation](#editing-a-custom-operation)

7.  [Data Preview](#data-preview)
8.  [Troubleshooting](#troubleshooting)
9.  [Feedback and Support](#feedback-and-support)

## Introduction

The **Data Analysis Extension** is a powerful tool designed to streamline your data analysis workflow within Visual Studio Code. It allows you to:

- Load data files (CSV, Excel, JSON) into your Jupyter notebooks.
- Perform custom data operations using pandas code snippets.
- Create and manage custom operations and categories.
- Preview your data directly within the extension.
- Queue multiple operations and execute them in your notebook.

## Prerequisites

Before using the extension, ensure you have the following installed:

- **Visual Studio Code**: Version 1.50 or higher.
- **Python Extension for VSCode**: For Jupyter notebook support.
- **Jupyter Notebook**: Installed in your Python environment.
- **Python Interpreter**: Python 3.x installed and configured in VSCode.
- **Pandas Library**: Installed in your Python environment (pip install pandas).
- **Optional Dependencies for File Types**:

  - **Reading Excel Files**: Install openpyxl for .xlsx files (pip install openpyxl).
  - **Reading Older Excel Files**: Install xlrd for .xls files (pip install xlrd).

## Installation

1.  **Clone or Download the Extension**:

    - bashCopy codegit clone https://github.com/your-username/data-analysis-extension.git
    - **Or Download the ZIP File**:

      - Download the repository as a ZIP file and extract it to your desired location.

2.  **Open the Extension in VSCode**:

    - Open Visual Studio Code.
    - Click on **File > Open Folder** and select the folder containing the extension files.

3.  **Install Dependencies**:

    - Open a terminal in VSCode.
    - Navigate to the extension directory if not already there.
    - bashCopy codenpm install
    - bashCopy codepip install pandas openpyxl xlrd

4.  **Launch the Extension**:

    - Press F5 to launch the extension in a new Extension Development Host window.

## Getting Started

1.  **Open a Jupyter Notebook**:

    - Ensure you have a Jupyter notebook open in VSCode where the extension will insert code cells.
    - If you don't have one, create a new notebook:

      - Click on **File > New File**.
      - Select **Jupyter Notebook**.

2.  **Activate the Extension**:

    - Press Ctrl+Shift+P (Cmd+Shift+P on macOS) to open the command palette.
    - Type **"Data Analysis: Select File"** and press Enter.
    - Alternatively, you can find the command under **View > Command Palette**.

3.  **Select a Data File**:

    - A file dialog will appear.
    - Navigate to and select the data file you wish to analyze (.csv, .xlsx, or .json).
    - The extension supports CSV, Excel, and JSON files.

4.  **Load the Data**:

    - Upon selecting the file, the extension will automatically insert code into your Jupyter notebook to load the data into a pandas DataFrame named df.

## Main Features

### 1\. Start Analysis

- **Purpose**: Begin the data analysis process by selecting a category and operation.
- **How to Use**:

  - Click on the **"Start Analysis"** button in the extension's main menu.
  - Select a category from the list.
  - Click **"Next"** to proceed to the operation selection.
  - Choose an operation and follow the prompts.
  - Queue the operation or perform it immediately.

### 2\. Create Custom Operation

- **Purpose**: Define your own data operations using pandas code.
- **How to Use**:

  - Click on **"Create Custom Operation"**.
  - Fill out the form with the operation name, category, and code.
  - Specify if the operation requires user input, column selection, or column values.
  - Save the operation for future use.

### 3\. Manage Custom Operations

- **Purpose**: Edit or delete existing custom operations.
- **How to Use**:

  - Click on **"Manage Custom Operations"**.
  - View the list of custom operations.
  - Click **"Edit"** to modify an operation or **"Delete"** to remove it.

### 4\. Manage Categories

- **Purpose**: Delete categories and all operations under them.
- **How to Use**:

  - Click on **"Manage Categories"**.
  - View the list of categories.
  - Click **"Delete"** next to a category to remove it.

### 5\. Change File

- **Purpose**: Switch to a different data file for analysis.
- **How to Use**:

  - Click on the **"Change File"** button (folder icon).
  - Select a new data file from your system.
  - The new file will be loaded into your notebook.

### 6\. Preview Data

- **Purpose**: View a preview of your data within the extension.
- **How to Use**:

  - Click on the **"Preview Data"** button (eye icon).
  - A table will display the contents of your data file.

### 7\. Queue Operation

- **Purpose**: Add operations to a queue to perform multiple actions sequentially.
- **How to Use**:

  - After selecting an operation, click **"Queue Operation"** (plus icon).
  - The operation will be added to the queue displayed on the right.
  - Repeat to add more operations.

### 8\. Perform Operations

- **Purpose**: Execute all queued operations in your notebook.
- **How to Use**:

  - Click on **"Perform Operations"** (play icon).
  - The extension will insert code cells for each operation in the queue.
  - The queue will be cleared after execution.

## Custom Operations

Custom operations allow you to define reusable code snippets that perform specific data transformations or analyses.

### Creating a Custom Operation

1.  **Access the Form**:

    - Click on **"Create Custom Operation"** from the main menu.

2.  **Fill Out the Details**:

    - **Operation Name**: Enter a unique name for your operation.
    - **Operation Category**: Specify a category or choose from existing ones.
    - **Requires User Input**:

      - Check this if your operation needs additional inputs.
      - Add placeholders for each input (e.g., "Threshold Value").

    - **Requires Column Selection**:

      - Check this if your operation needs specific columns.

    - **Requires Column Values**:

      - Check this if your operation needs specific values from a column.

    - **Operation Code**:

      - Write the pandas code that performs the operation.
      - Use placeholders for dynamic values:

        - **&c0, &c1, etc.** for selected columns.
        - **&i0, &i1, etc.** for user inputs.
        - **&v0, &v1, etc.** for selected column values.

3.  **Save the Operation**:

    - Click **"Save Custom Operation"**.
    - The operation will be available under its category when starting an analysis.

**Example**:

- **Operation Name**: Remove Outliers
- **Operation Category**: Data Cleaning
- **Requires User Input**: Yes

  - Placeholder: "Z-score Threshold"

- **Requires Column Selection**: Yes
- pythonCopy codefrom scipy import statsimport numpy as npdf = df\[(np.abs(stats.zscore(df\['&c0'\])) < &i0)\]

### Editing a Custom Operation

1.  **Access the Management Page**:

    - Click on **"Manage Custom Operations"**.

2.  **Edit Operation**:

    - Find the operation you want to edit and click **"Edit"**.
    - Modify the details as needed.
    - Save your changes.

## Data Preview

- **Purpose**: Quickly view the contents of your data file.
- **How to Use**:

  - Click on the **"Preview Data"** button.
  - The extension will display the data in a tabular format.
  - Scroll through to inspect your data.

## Troubleshooting

- **Cannot Read Excel Files (.xlsx or .xls)**:

  - **Issue**: You receive an error stating that openpyxl or xlrd is missing.
  - **Solution**:

    - Install the required library:

      - bashCopy codepip install openpyxl
      - bashCopy codepip install xlrd

    - Restart your Jupyter notebook kernel after installing.

- **No Jupyter Notebook Open**:

  - Ensure you have a Jupyter notebook open before using the extension.
  - The extension inserts code into the active notebook.

- **Unsupported File Format**:

  - The extension supports .csv, .xlsx, and .json files.
  - If you receive an error, check your file format.

- **Operation Not Executing**:

  - Verify that you have selected the necessary columns and provided required inputs.
  - Check the pandas code in your custom operation for errors.
  - Ensure that placeholders are correctly used (&c0, &i0, &v0, etc.).

- **Extension Not Responding**:

  - Reload VSCode or disable and re-enable the extension.
  - Check the developer console for error messages (Help > Toggle Developer Tools).

## Feedback and Support

We value your feedback! If you encounter any issues or have suggestions:

- **Report Issues**: Visit the [GitHub repository](https://github.com/your-repo/data-analysis-extension) to open an issue.
- **Feature Requests**: Share your ideas for new features or improvements.
- **Contact**: Reach out via email at [support@example.com](mailto:support@example.com).

Thank you for using the **Data Analysis Extension**! We hope it enhances your data analysis workflow in Visual Studio Code.
