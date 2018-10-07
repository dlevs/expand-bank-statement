This tool converts CSV files exported from a certain bank into a format that a certain accounting software can understand.

It solves a few issues:
- Formats date so the import doesn't throw an error.
- Adds a "balance" column, required for the import.
- Renames fields so they are correctly mapped without needing to use the import GUI.
- Strips away unnecessary fields for clarity.

## Installation
```bash
npm install
npm link
```

## Usage
```bash
expand-bank-statement --balance 198.20 ./statement.csv
```
