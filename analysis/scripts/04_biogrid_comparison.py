#!/usr/bin/env python3
"""
BioGRID Database Comparison

Compares IFT/BBSome predictions against BioGRID experimental interactions

Outputs:
- analysis/results/biogrid_comparison.csv
- analysis/results/biogrid_validated_interactions.csv
- analysis/results/biogrid_novel_predictions.csv
- figures/data/venn_diagram_biogrid.json

Requirements:
  pip install pandas psycopg2-binary python-dotenv requests

Usage:
  export POSTGRES_URL="postgresql://..."
  python analysis/scripts/04_biogrid_comparison.py

BioGRID Data:
  Downloads latest human interactions from BioGRID REST API
  Alternative: manually download from https://downloads.thebiogrid.org/BioGRID/Release-Archive/
"""

import os
import json
import pandas as pd
import psycopg2
from urllib.parse import urlparse
import requests
from collections import defaultdict

BIOGRID_API_URL = "https://webservice.thebiogrid.org/interactions/"
BIOGRID_VERSION = "4.4.235"  # Update with latest version
BIOGRID_FILE_URL = f"https://downloads.thebiogrid.org/Download/BioGRID/Release-Archive/BIOGRID-{BIOGRID_VERSION}/BIOGRID-ORGANISM-Homo_sapiens-{BIOGRID_VERSION}.tab3.txt"

def connect_to_database():
    """Connect to PostgreSQL database"""
    database_url = os.environ.get('POSTGRES_URL')
    if not database_url:
        raise ValueError("POSTGRES_URL environment variable not set")

    url = urlparse(database_url)

    conn = psycopg2.connect(
        host=url.hostname,
        port=url.port,
        user=url.username,
        password=url.password,
        database=url.path[1:],
        sslmode='require'
    )
    return conn

def load_our_interactions():
    """Load our predicted interactions from CSV file"""
    print("\n=== LOADING OUR PREDICTIONS ===\n")

    # Read from CSV file instead of database
    csv_path = 'analysis/results/supplementary_table_S1_all_interactions.csv'
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Please run script 01 first to generate {csv_path}")

    df = pd.read_csv(csv_path)

    # Rename columns to match expected format
    df = df.rename(columns={
        'Bait_Gene': 'bait_gene',
        'Bait_UniProt': 'bait_uniprot',
        'Prey_Gene': 'prey_gene',
        'Prey_UniProt': 'prey_uniprot',
        'ipSAE': 'ipsae',
        'Confidence': 'ipsae_confidence',
        'iPTM': 'iptm',
        'PAE_Contacts_<3A': 'contacts_pae_lt_3'
    })

    print(f"Loaded {len(df)} predictions from our database")
    return df

def download_biogrid_data(output_dir='data/external'):
    """Download BioGRID human interactions"""
    print("\n=== DOWNLOADING BIOGRID DATA ===\n")

    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, f'BIOGRID-Human-{BIOGRID_VERSION}.tab3.txt')

    # Check if already downloaded
    if os.path.exists(output_file):
        print(f"BioGRID file already exists: {output_file}")
        return output_file

    print(f"Downloading BioGRID from: {BIOGRID_FILE_URL}")
    print("This may take a few minutes...")

    try:
        response = requests.get(BIOGRID_FILE_URL, stream=True)
        response.raise_for_status()

        with open(output_file, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        print(f"Downloaded to: {output_file}")
        return output_file

    except requests.exceptions.RequestException as e:
        print(f"Error downloading BioGRID: {e}")
        print("\nManual download instructions:")
        print(f"1. Visit: https://downloads.thebiogrid.org/BioGRID/Release-Archive/")
        print(f"2. Download: BIOGRID-ORGANISM-Homo_sapiens-{BIOGRID_VERSION}.tab3.txt")
        print(f"3. Place in: {output_dir}/")
        raise

def load_biogrid_data(biogrid_file):
    """Load and parse BioGRID interactions"""
    print(f"\n=== LOADING BIOGRID DATA ===\n")

    # Read BioGRID file (tab-separated)
    df = pd.read_csv(biogrid_file, sep='\t', low_memory=False)

    print(f"Loaded {len(df)} BioGRID interactions")

    # Filter for physical interactions only
    physical_systems = [
        'Two-hybrid',
        'Affinity Capture-MS',
        'Affinity Capture-Western',
        'Co-IP',
        'Co-immunoprecipitation',
        'Reconstituted Complex',
        'Co-fractionation',
        'FRET',
        'PCA',
        'Biochemical Activity'
    ]

    df_physical = df[df['Experimental System'].isin(physical_systems)]
    print(f"Filtered to {len(df_physical)} physical interactions")

    return df_physical

def create_gene_mapping(biogrid_df):
    """Create mapping between official symbols and BioGRID gene names"""
    print("\n=== CREATING GENE NAME MAPPINGS ===\n")

    # BioGRID uses official gene symbols
    # Create a mapping: {gene_symbol: [uniprot_ids]}
    gene_to_uniprot = defaultdict(set)

    # Add from BioGRID data
    for _, row in biogrid_df.iterrows():
        gene_a = row['Official Symbol Interactor A']
        gene_b = row['Official Symbol Interactor B']

        # BioGRID doesn't directly provide UniProt IDs in standard download
        # We'll match by gene symbols
        gene_to_uniprot[gene_a].add(gene_a)
        gene_to_uniprot[gene_b].add(gene_b)

    print(f"Created mappings for {len(gene_to_uniprot)} genes")
    return dict(gene_to_uniprot)

def compare_with_biogrid(our_df, biogrid_df):
    """Compare our predictions with BioGRID experimental data"""
    print("\n=== COMPARING WITH BIOGRID ===\n")

    # Create set of BioGRID interactions (gene symbol pairs, bidirectional)
    biogrid_pairs = set()
    biogrid_details = {}  # Store experimental method info

    for _, row in biogrid_df.iterrows():
        gene_a = row['Official Symbol Interactor A']
        gene_b = row['Official Symbol Interactor B']

        # Add both directions (interaction is symmetric)
        pair_1 = tuple(sorted([gene_a, gene_b]))
        biogrid_pairs.add(pair_1)

        # Store experimental method
        if pair_1 not in biogrid_details:
            biogrid_details[pair_1] = {
                'methods': set(),
                'pmids': set()
            }
        biogrid_details[pair_1]['methods'].add(row['Experimental System'])
        biogrid_details[pair_1]['pmids'].add(row['Pubmed ID'])

    print(f"BioGRID: {len(biogrid_pairs)} unique protein pairs")

    # Compare our predictions
    validated = []
    novel = []

    for _, row in our_df.iterrows():
        bait_gene = row['bait_gene']
        prey_gene = row['prey_gene']

        if not bait_gene or not prey_gene:
            continue

        # Check if this pair is in BioGRID (order-independent)
        pair = tuple(sorted([bait_gene, prey_gene]))

        if pair in biogrid_pairs:
            # Validated!
            validated.append({
                'interaction_id': row['id'],
                'bait_gene': bait_gene,
                'prey_gene': prey_gene,
                'ipsae': row['ipsae'],
                'confidence': row['ipsae_confidence'],
                'biogrid_methods': ', '.join(biogrid_details[pair]['methods']),
                'biogrid_pmids': ', '.join(str(p) for p in biogrid_details[pair]['pmids'])
            })
        else:
            # Novel prediction (not in BioGRID experimental)
            novel.append({
                'interaction_id': row['id'],
                'bait_gene': bait_gene,
                'prey_gene': prey_gene,
                'ipsae': row['ipsae'],
                'confidence': row['ipsae_confidence']
            })

    validated_df = pd.DataFrame(validated)
    novel_df = pd.DataFrame(novel)

    print(f"\nResults:")
    print(f"  Validated (in BioGRID): {len(validated)} ({len(validated)/len(our_df)*100:.1f}%)")
    print(f"  Novel (not in BioGRID): {len(novel)} ({len(novel)/len(our_df)*100:.1f}%)")

    # Breakdown by confidence
    if len(validated) > 0:
        print(f"\nValidated by confidence:")
        for conf in ['High', 'Medium', 'Low']:
            count = len(validated_df[validated_df['confidence'] == conf])
            total = len(our_df[our_df['ipsae_confidence'] == conf])
            if total > 0:
                print(f"  {conf}: {count}/{total} ({count/total*100:.1f}%)")

    return validated_df, novel_df

def generate_summary_stats(our_df, validated_df, novel_df):
    """Generate summary statistics for publication"""
    print("\n=== SUMMARY STATISTICS ===\n")

    summary = {
        'total_predictions': len(our_df),
        'validated_in_biogrid': len(validated_df),
        'novel_predictions': len(novel_df),
        'validation_rate': len(validated_df) / len(our_df) if len(our_df) > 0 else 0,
        'by_confidence': {}
    }

    for conf in ['High', 'Medium', 'Low']:
        total = len(our_df[our_df['ipsae_confidence'] == conf])
        validated = len(validated_df[validated_df['confidence'] == conf]) if len(validated_df) > 0 else 0

        summary['by_confidence'][conf] = {
            'total': total,
            'validated': validated,
            'validation_rate': validated / total if total > 0 else 0
        }

    # Print summary
    print(f"Total predictions: {summary['total_predictions']}")
    print(f"Validated in BioGRID: {summary['validated_in_biogrid']} ({summary['validation_rate']*100:.1f}%)")
    print(f"Novel predictions: {summary['novel_predictions']}")
    print(f"\nBy confidence level:")
    for conf, stats in summary['by_confidence'].items():
        print(f"  {conf}: {stats['validated']}/{stats['total']} ({stats['validation_rate']*100:.1f}%)")

    return summary

def export_venn_diagram_data(our_df, validated_df):
    """Export data for Venn diagram visualization"""
    print("\n=== GENERATING VENN DIAGRAM DATA ===\n")

    venn_data = {
        'our_predictions_total': len(our_df),
        'validated_in_biogrid': len(validated_df),
        'novel_predictions': len(our_df) - len(validated_df),
        'high_confidence_validated': len(validated_df[validated_df['confidence'] == 'High']) if len(validated_df) > 0 else 0,
        'high_confidence_novel': len(our_df[(our_df['ipsae_confidence'] == 'High')]) - len(validated_df[validated_df['confidence'] == 'High']) if len(validated_df) > 0 else len(our_df[(our_df['ipsae_confidence'] == 'High')])
    }

    return venn_data

def main():
    """Main execution"""
    print("Starting BioGRID comparison analysis...")

    # Create output directories
    os.makedirs('analysis/results', exist_ok=True)
    os.makedirs('figures/data', exist_ok=True)
    os.makedirs('data/external', exist_ok=True)

    # 1. Load our predictions
    our_df = load_our_interactions()

    # 2. Download BioGRID data
    biogrid_file = download_biogrid_data()

    # 3. Load BioGRID data
    biogrid_df = load_biogrid_data(biogrid_file)

    # 4. Compare with BioGRID
    validated_df, novel_df = compare_with_biogrid(our_df, biogrid_df)

    # 5. Generate summary statistics
    summary = generate_summary_stats(our_df, validated_df, novel_df)

    # 6. Export validated interactions
    if len(validated_df) > 0:
        validated_path = 'analysis/results/biogrid_validated_interactions.csv'
        validated_df.to_csv(validated_path, index=False)
        print(f"\nSaved validated interactions to {validated_path}")

    # 7. Export novel predictions
    if len(novel_df) > 0:
        novel_path = 'analysis/results/biogrid_novel_predictions.csv'
        novel_df.to_csv(novel_path, index=False)
        print(f"Saved novel predictions to {novel_path}")

    # 8. Export summary
    summary_path = 'analysis/results/biogrid_comparison.json'
    with open(summary_path, 'w') as f:
        json.dump(summary, f, indent=2)
    print(f"Saved summary to {summary_path}")

    # 9. Export Venn diagram data
    venn_data = export_venn_diagram_data(our_df, validated_df)
    venn_path = 'figures/data/venn_diagram_biogrid.json'
    with open(venn_path, 'w') as f:
        json.dump(venn_data, f, indent=2)
    print(f"Saved Venn diagram data to {venn_path}")

    print(f"\n✅ BioGRID comparison complete!\n")
    print("Output files:")
    print(f"  - {summary_path}")
    print(f"  - {validated_path if len(validated_df) > 0 else 'N/A'}")
    print(f"  - {novel_path if len(novel_df) > 0 else 'N/A'}")
    print(f"  - {venn_path}")

if __name__ == '__main__':
    main()
