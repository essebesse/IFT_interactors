#!/usr/bin/env python3
"""
Inspect Excel/CSV files to understand their structure before writing parsers.

Usage:
    python3 inspect_excel.py <file_path> [sheet_name]

Examples:
    python3 inspect_excel.py experimental_data/raw/boldt_2016_supp_data_1.xlsx
    python3 inspect_excel.py experimental_data/raw/boldt_2016_supp_data_1.xlsx "Sheet1"
"""

import sys
import pandas as pd
from pathlib import Path

def inspect_excel(file_path, sheet_name=None):
    """Inspect Excel or CSV file structure."""

    file_path = Path(file_path)

    if not file_path.exists():
        print(f"❌ File not found: {file_path}")
        return

    print(f"\n{'='*80}")
    print(f"📄 Inspecting: {file_path.name}")
    print(f"{'='*80}\n")

    # Determine file type
    ext = file_path.suffix.lower()

    try:
        if ext in ['.xlsx', '.xls']:
            # Excel file - list all sheets
            xls = pd.ExcelFile(file_path)
            print(f"📊 Excel file with {len(xls.sheet_names)} sheet(s):")
            for i, sheet in enumerate(xls.sheet_names, 1):
                print(f"   {i}. {sheet}")
            print()

            if sheet_name:
                # Inspect specific sheet
                sheets_to_inspect = [sheet_name]
            else:
                # Inspect all sheets (or first 3 if many)
                sheets_to_inspect = xls.sheet_names[:3]

            for sheet in sheets_to_inspect:
                print(f"\n{'─'*80}")
                print(f"📑 Sheet: {sheet}")
                print(f"{'─'*80}\n")

                df = pd.read_excel(file_path, sheet_name=sheet)
                inspect_dataframe(df)

        elif ext == '.csv':
            # CSV file
            df = pd.read_csv(file_path, nrows=1000)  # Sample first 1000 rows
            inspect_dataframe(df)

        elif ext == '.tsv' or ext == '.txt':
            # TSV file
            df = pd.read_csv(file_path, sep='\t', nrows=1000)
            inspect_dataframe(df)

        else:
            print(f"❌ Unsupported file type: {ext}")
            return

    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return

    print(f"\n{'='*80}")
    print("✅ Inspection complete")
    print(f"{'='*80}\n")


def inspect_dataframe(df):
    """Inspect a pandas DataFrame."""

    # Basic info
    print(f"📊 Dimensions: {df.shape[0]} rows × {df.shape[1]} columns\n")

    # Column names
    print("📋 Columns:")
    for i, col in enumerate(df.columns, 1):
        dtype = df[col].dtype
        non_null = df[col].notna().sum()
        null_count = df[col].isna().sum()
        print(f"   {i:2d}. {col:40s} | Type: {str(dtype):10s} | Non-null: {non_null:6d} | Null: {null_count:6d}")
    print()

    # First few rows
    print("👀 First 5 rows:")
    print(df.head().to_string())
    print()

    # Data types summary
    print("📈 Data type summary:")
    print(df.dtypes.value_counts())
    print()

    # Missing data summary
    missing = df.isna().sum()
    if missing.sum() > 0:
        print("⚠️  Missing data:")
        for col, count in missing[missing > 0].items():
            percent = count / len(df) * 100
            print(f"   {col}: {count} ({percent:.1f}%)")
        print()

    # Sample unique values for key columns
    potential_key_columns = []
    for col in df.columns:
        col_lower = col.lower()
        if any(keyword in col_lower for keyword in ['bait', 'prey', 'protein', 'gene', 'uniprot', 'accession']):
            potential_key_columns.append(col)

    if potential_key_columns:
        print("🔑 Key columns (first 10 unique values):")
        for col in potential_key_columns[:5]:  # Limit to first 5 key columns
            unique_values = df[col].dropna().unique()[:10]
            print(f"\n   {col}:")
            for val in unique_values:
                print(f"      - {val}")
        print()

    # Numeric columns summary
    numeric_cols = df.select_dtypes(include=['number']).columns
    if len(numeric_cols) > 0:
        print("📊 Numeric columns statistics:")
        print(df[numeric_cols].describe().to_string())
        print()


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    file_path = sys.argv[1]
    sheet_name = sys.argv[2] if len(sys.argv) > 2 else None

    inspect_excel(file_path, sheet_name)


if __name__ == '__main__':
    main()
