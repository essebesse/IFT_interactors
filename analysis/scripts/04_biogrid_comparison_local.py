#!/usr/bin/env python3
"""
BioGRID Database Comparison (Local File Version)

Compares IFT/BBSome predictions against BioGRID experimental interactions
Uses local BioGRID MITAB file (version 5.0.251)

Outputs:
- analysis/results/biogrid_comparison_summary.txt
- analysis/results/biogrid_validated_interactions.csv
- analysis/results/biogrid_novel_predictions.csv
- analysis/results/biogrid_validation_by_confidence.csv

Requirements:
  pip install pandas

Usage:
  python analysis/scripts/04_biogrid_comparison_local.py
"""

import os
import pandas as pd
from collections import defaultdict

# File paths
BIOGRID_FILE = "BIOGRID-ALL-5.0.251.mitab.txt"
OUR_INTERACTIONS_CSV = "analysis/results/supplementary_table_S1_all_interactions.csv"
RESULTS_DIR = "analysis/results"

def parse_mitab_id(id_string):
    """Extract UniProt ID from MITAB ID field"""
    # MITAB format can have: uniprot/swiss-prot:P12345 or uniprotkb:P12345
    # Alt IDs are pipe-separated: biogrid:112315|entrez gene/locuslink:MAP2K4|uniprot/swiss-prot:P45985
    if not isinstance(id_string, str):
        return None

    # Split by pipe to get all IDs
    id_parts = id_string.split('|')

    for part in id_parts:
        # Look for uniprot/swiss-prot: or uniprotkb:
        if 'uniprot/swiss-prot:' in part:
            uniprot = part.split('uniprot/swiss-prot:')[1].split('|')[0].split('(')[0].strip()
            return uniprot
        elif 'uniprotkb:' in part:
            uniprot = part.split('uniprotkb:')[1].split('|')[0].split('(')[0].strip()
            return uniprot

    return None

def load_biogrid_human_interactions():
    """Load BioGRID data and extract human protein interactions"""
    print("\n=== LOADING BIOGRID DATA ===\n")
    print(f"Reading: {BIOGRID_FILE}")

    # Read MITAB file (tab-separated)
    # Columns: ID_A, ID_B, AltIDs_A, AltIDs_B, Aliases_A, Aliases_B, ...
    df = pd.read_csv(BIOGRID_FILE, sep='\t', low_memory=False)

    print(f"Total BioGRID interactions: {len(df):,}")

    # Filter for human-human interactions (taxid:9606)
    # Column indices (0-based): taxid interactor A is column 9, taxid interactor B is column 10
    human_df = df[
        (df.iloc[:, 9].astype(str).str.contains('taxid:9606')) &
        (df.iloc[:, 10].astype(str).str.contains('taxid:9606'))
    ].copy()

    print(f"Human-human interactions: {len(human_df):,}")

    # Extract UniProt IDs from ID columns (columns 0 and 1) and Alt IDs (columns 2 and 3)
    interactions = defaultdict(int)

    for idx, row in human_df.iterrows():
        # UniProt IDs are usually in Alt IDs columns (2 and 3)
        uniprot_a = parse_mitab_id(str(row.iloc[2]))
        uniprot_b = parse_mitab_id(str(row.iloc[3]))

        # Also try main IDs if Alt IDs didn't work
        if not uniprot_a:
            uniprot_a = parse_mitab_id(str(row.iloc[0]))
        if not uniprot_b:
            uniprot_b = parse_mitab_id(str(row.iloc[1]))

        if uniprot_a and uniprot_b:
            # Create sorted tuple for undirected comparison
            pair = tuple(sorted([uniprot_a, uniprot_b]))
            interactions[pair] += 1

    print(f"Unique human protein pairs with UniProt IDs: {len(interactions):,}")

    return interactions

def load_our_interactions():
    """Load our predicted interactions from CSV"""
    print("\n=== LOADING OUR PREDICTIONS ===\n")

    df = pd.read_csv(OUR_INTERACTIONS_CSV)

    # Rename columns
    df = df.rename(columns={
        'Bait_Gene': 'bait_gene',
        'Bait_UniProt': 'bait_uniprot',
        'Prey_Gene': 'prey_gene',
        'Prey_UniProt': 'prey_uniprot',
        'ipSAE': 'ipsae',
        'Confidence': 'ipsae_confidence'
    })

    print(f"Our predictions: {len(df):,}")
    return df

def compare_with_biogrid(our_df, biogrid_interactions):
    """Compare our predictions with BioGRID"""
    print("\n=== COMPARING WITH BIOGRID ===\n")

    validated = []
    novel = []

    for idx, row in our_df.iterrows():
        bait_uniprot = row['bait_uniprot']
        prey_uniprot = row['prey_uniprot']

        # Create sorted pair for comparison
        pair = tuple(sorted([bait_uniprot, prey_uniprot]))

        if pair in biogrid_interactions:
            detect_count = biogrid_interactions[pair]
            validated.append({
                'bait_gene': row['bait_gene'],
                'bait_uniprot': bait_uniprot,
                'prey_gene': row['prey_gene'],
                'prey_uniprot': prey_uniprot,
                'ipsae': row['ipsae'],
                'confidence': row['ipsae_confidence'],
                'biogrid_detect_count': detect_count
            })
        else:
            novel.append({
                'bait_gene': row['bait_gene'],
                'bait_uniprot': bait_uniprot,
                'prey_gene': row['prey_gene'],
                'prey_uniprot': prey_uniprot,
                'ipsae': row['ipsae'],
                'confidence': row['ipsae_confidence']
            })

    validated_df = pd.DataFrame(validated)
    novel_df = pd.DataFrame(novel)

    print(f"Validated by BioGRID: {len(validated_df)} ({len(validated_df)/len(our_df)*100:.1f}%)")
    print(f"Novel predictions: {len(novel_df)} ({len(novel_df)/len(our_df)*100:.1f}%)")

    return validated_df, novel_df

def analyze_by_confidence(our_df, validated_df):
    """Analyze validation rates by confidence level"""
    print("\n=== VALIDATION BY CONFIDENCE LEVEL ===\n")

    results = []

    for conf in ['High', 'Medium', 'Low']:
        total = len(our_df[our_df['ipsae_confidence'] == conf])
        if len(validated_df) > 0:
            validated = len(validated_df[validated_df['confidence'] == conf])
        else:
            validated = 0

        if total > 0:
            pct = (validated / total) * 100
        else:
            pct = 0

        results.append({
            'confidence': conf,
            'total_predictions': total,
            'biogrid_validated': validated,
            'validation_rate_pct': round(pct, 1)
        })

        print(f"{conf}: {validated}/{total} validated ({pct:.1f}%)")

    return pd.DataFrame(results)

def main():
    print("="*70)
    print("BIOGRID COMPARISON ANALYSIS (Local File)")
    print("BioGRID Version: 5.0.251")
    print("="*70)

    # Ensure results directory exists
    os.makedirs(RESULTS_DIR, exist_ok=True)

    # Load data
    biogrid_interactions = load_biogrid_human_interactions()
    our_df = load_our_interactions()

    # Compare
    validated_df, novel_df = compare_with_biogrid(our_df, biogrid_interactions)

    # Analyze by confidence
    confidence_stats = analyze_by_confidence(our_df, validated_df)

    # Save results
    print("\n=== SAVING RESULTS ===\n")

    # Validated interactions
    validated_path = os.path.join(RESULTS_DIR, 'biogrid_validated_interactions.csv')
    validated_df.to_csv(validated_path, index=False)
    print(f"✓ Saved validated interactions: {validated_path}")

    # Novel predictions
    novel_path = os.path.join(RESULTS_DIR, 'biogrid_novel_predictions.csv')
    novel_df.to_csv(novel_path, index=False)
    print(f"✓ Saved novel predictions: {novel_path}")

    # Confidence breakdown
    conf_path = os.path.join(RESULTS_DIR, 'biogrid_validation_by_confidence.csv')
    confidence_stats.to_csv(conf_path, index=False)
    print(f"✓ Saved confidence breakdown: {conf_path}")

    # Summary text file
    summary_path = os.path.join(RESULTS_DIR, 'biogrid_comparison_summary.txt')
    with open(summary_path, 'w') as f:
        f.write("BioGRID Comparison Summary\n")
        f.write("="*70 + "\n\n")
        f.write(f"BioGRID Version: 5.0.251\n")
        f.write(f"Date: {pd.Timestamp.now().strftime('%Y-%m-%d')}\n\n")

        f.write("Overall Statistics:\n")
        f.write(f"  Total predictions: {len(our_df)}\n")
        f.write(f"  BioGRID validated: {len(validated_df)} ({len(validated_df)/len(our_df)*100:.1f}%)\n")
        f.write(f"  Novel predictions: {len(novel_df)} ({len(novel_df)/len(our_df)*100:.1f}%)\n\n")

        f.write("Validation by Confidence Level:\n")
        for _, row in confidence_stats.iterrows():
            f.write(f"  {row['confidence']}: {row['biogrid_validated']}/{row['total_predictions']} ")
            f.write(f"({row['validation_rate_pct']:.1f}%)\n")

        f.write("\nTop 10 Validated Interactions (by ipSAE):\n")
        top_validated = validated_df.nlargest(10, 'ipsae')
        for _, row in top_validated.iterrows():
            f.write(f"  {row['bait_gene']} - {row['prey_gene']}: ")
            f.write(f"ipSAE={row['ipsae']:.3f}, BioGRID detections={row['biogrid_detect_count']}\n")

    print(f"✓ Saved summary: {summary_path}")

    print("\n" + "="*70)
    print("✅ BioGRID comparison complete!")
    print("="*70)

    # Print summary
    print(f"\nOVERALL: {len(validated_df)}/{len(our_df)} predictions validated by BioGRID ({len(validated_df)/len(our_df)*100:.1f}%)")
    print(f"\nBy confidence:")
    for _, row in confidence_stats.iterrows():
        print(f"  {row['confidence']}: {row['validation_rate_pct']:.1f}% validated")

if __name__ == "__main__":
    main()
