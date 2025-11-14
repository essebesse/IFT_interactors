#!/usr/bin/env python3
"""
Convert Sang et al., 2011 Table S1 from Excel to CSV format
"""
import pandas as pd
import sys

input_file = "experimental_data/raw/Sang_Cell_2011/1-s2.0-S0092867411004776-mmc1.xls"
output_file = "experimental_data/raw/Sang_Cell_2011/sang_2011_table_s1.csv"

print(f"Converting {input_file} to CSV...")

df = pd.read_excel(input_file, sheet_name='Table S1', header=1)
df.columns = df.columns.str.strip()

df_filtered = df[df['Bait'] != 'GFP']

print(f"Total interactions (excluding GFP control): {len(df_filtered)}")
print(f"Unique baits: {df_filtered['Bait'].nunique()}")

df_filtered.to_csv(output_file, index=False)

print(f"Saved to {output_file}")
