#!/usr/bin/env python3
"""
STRING Database Comparison

Compares IFT/BBSome predictions against STRING protein interaction database

Outputs:
- analysis/results/string_comparison.csv
- analysis/results/string_validated_interactions.csv
- analysis/results/string_evidence_breakdown.csv
- figures/data/string_score_correlation.csv

Requirements:
  pip install pandas psycopg2-binary python-dotenv requests

Usage:
  export POSTGRES_URL="postgresql://..."
  python analysis/scripts/05_string_comparison.py

STRING Data:
  Downloads human protein links from STRING database
  URL: https://stringdb-downloads.org/download/protein.links.v12.0/9606.protein.links.v12.0.txt.gz
"""

import os
import json
import gzip
import pandas as pd
import psycopg2
from urllib.parse import urlparse
import requests
from collections import defaultdict

STRING_VERSION = "12.0"
STRING_URL = f"https://stringdb-downloads.org/download/protein.links.v{STRING_VERSION}/9606.protein.links.v{STRING_VERSION}.txt.gz"
STRING_INFO_URL = f"https://stringdb-downloads.org/download/protein.info.v{STRING_VERSION}/9606.protein.info.v{STRING_VERSION}.txt.gz"

# STRING combined score thresholds
STRING_HIGH_CONFIDENCE = 700  # High confidence
STRING_MEDIUM_CONFIDENCE = 400  # Medium confidence

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
    """Load our predicted interactions from database"""
    print("\n=== LOADING OUR PREDICTIONS ===\n")

    conn = connect_to_database()

    query = """
    SELECT
        i.id,
        bait.uniprot_id as bait_uniprot,
        bait.gene_name as bait_gene,
        prey.uniprot_id as prey_uniprot,
        prey.gene_name as prey_gene,
        i.ipsae,
        i.ipsae_confidence,
        i.iptm,
        i.contacts_pae_lt_3
    FROM interactions i
    JOIN proteins bait ON i.bait_protein_id = bait.id
    JOIN proteins prey ON i.prey_protein_id = prey.id
    ORDER BY i.ipsae DESC
    """

    df = pd.read_sql_query(query, conn)
    conn.close()

    print(f"Loaded {len(df)} predictions from our database")
    return df

def download_string_data(output_dir='data/external'):
    """Download STRING protein links and info"""
    print("\n=== DOWNLOADING STRING DATA ===\n")

    os.makedirs(output_dir, exist_ok=True)

    # Download protein links
    links_file = os.path.join(output_dir, f'9606.protein.links.v{STRING_VERSION}.txt.gz')
    if not os.path.exists(links_file):
        print(f"Downloading STRING links from: {STRING_URL}")
        response = requests.get(STRING_URL, stream=True)
        response.raise_for_status()
        with open(links_file, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Downloaded to: {links_file}")
    else:
        print(f"STRING links file already exists: {links_file}")

    # Download protein info (for gene name mapping)
    info_file = os.path.join(output_dir, f'9606.protein.info.v{STRING_VERSION}.txt.gz')
    if not os.path.exists(info_file):
        print(f"Downloading STRING info from: {STRING_INFO_URL}")
        response = requests.get(STRING_INFO_URL, stream=True)
        response.raise_for_status()
        with open(info_file, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Downloaded to: {info_file}")
    else:
        print(f"STRING info file already exists: {info_file}")

    return links_file, info_file

def load_string_protein_info(info_file):
    """Load STRING protein info for gene name mapping"""
    print("\n=== LOADING STRING PROTEIN INFO ===\n")

    # Read gzipped file
    with gzip.open(info_file, 'rt') as f:
        df = pd.read_csv(f, sep='\t')

    print(f"Loaded info for {len(df)} proteins")

    # Create mapping: gene name -> STRING protein ID
    gene_to_string = {}
    for _, row in df.iterrows():
        gene_name = row['preferred_name']
        string_id = row['protein_external_id']
        gene_to_string[gene_name] = string_id

    print(f"Created mappings for {len(gene_to_string)} genes")
    return gene_to_string

def load_string_links(links_file, gene_to_string):
    """Load STRING protein links"""
    print("\n=== LOADING STRING LINKS ===\n")

    # Read gzipped file
    with gzip.open(links_file, 'rt') as f:
        df = pd.read_csv(f, sep=' ')

    print(f"Loaded {len(df)} STRING interactions")

    # Filter for medium confidence or higher
    df_filtered = df[df['combined_score'] >= STRING_MEDIUM_CONFIDENCE]
    print(f"Filtered to {len(df_filtered)} medium+ confidence interactions (score >= {STRING_MEDIUM_CONFIDENCE})")

    # Convert STRING IDs to gene names
    string_to_gene = {v: k for k, v in gene_to_string.items()}

    # Add gene names
    df_filtered['gene_a'] = df_filtered['protein1'].apply(lambda x: string_to_gene.get(x, None))
    df_filtered['gene_b'] = df_filtered['protein2'].apply(lambda x: string_to_gene.get(x, None))

    # Remove rows without gene name mapping
    df_filtered = df_filtered.dropna(subset=['gene_a', 'gene_b'])

    print(f"After gene name mapping: {len(df_filtered)} interactions")

    return df_filtered

def compare_with_string(our_df, string_df):
    """Compare our predictions with STRING database"""
    print("\n=== COMPARING WITH STRING ===\n")

    # Create set of STRING interactions (gene symbol pairs, bidirectional)
    string_pairs = {}  # pair -> score

    for _, row in string_df.iterrows():
        gene_a = row['gene_a']
        gene_b = row['gene_b']
        score = row['combined_score']

        # Store as sorted tuple (order-independent)
        pair = tuple(sorted([gene_a, gene_b]))
        string_pairs[pair] = max(string_pairs.get(pair, 0), score)  # Keep highest score

    print(f"STRING: {len(string_pairs)} unique protein pairs")

    # Compare our predictions
    in_string = []
    not_in_string = []

    for _, row in our_df.iterrows():
        bait_gene = row['bait_gene']
        prey_gene = row['prey_gene']

        if not bait_gene or not prey_gene:
            continue

        # Check if this pair is in STRING (order-independent)
        pair = tuple(sorted([bait_gene, prey_gene]))

        if pair in string_pairs:
            # Found in STRING
            string_score = string_pairs[pair]
            string_conf = 'High' if string_score >= STRING_HIGH_CONFIDENCE else 'Medium'

            in_string.append({
                'interaction_id': row['id'],
                'bait_gene': bait_gene,
                'prey_gene': prey_gene,
                'ipsae': row['ipsae'],
                'our_confidence': row['ipsae_confidence'],
                'string_score': string_score,
                'string_confidence': string_conf
            })
        else:
            # Not in STRING
            not_in_string.append({
                'interaction_id': row['id'],
                'bait_gene': bait_gene,
                'prey_gene': prey_gene,
                'ipsae': row['ipsae'],
                'our_confidence': row['ipsae_confidence']
            })

    in_string_df = pd.DataFrame(in_string)
    not_in_string_df = pd.DataFrame(not_in_string)

    print(f"\nResults:")
    print(f"  In STRING: {len(in_string)} ({len(in_string)/len(our_df)*100:.1f}%)")
    print(f"  Not in STRING: {len(not_in_string)} ({len(not_in_string)/len(our_df)*100:.1f}%)")

    # Breakdown by confidence
    if len(in_string) > 0:
        print(f"\nIn STRING by our confidence:")
        for conf in ['High', 'Medium', 'Low']:
            count = len(in_string_df[in_string_df['our_confidence'] == conf])
            total = len(our_df[our_df['ipsae_confidence'] == conf])
            if total > 0:
                print(f"  {conf}: {count}/{total} ({count/total*100:.1f}%)")

    return in_string_df, not_in_string_df

def analyze_score_correlation(in_string_df):
    """Analyze correlation between ipSAE and STRING scores"""
    print("\n=== ANALYZING SCORE CORRELATION ===\n")

    if len(in_string_df) == 0:
        print("No overlapping interactions to analyze")
        return None

    # Calculate correlation
    correlation = in_string_df['ipsae'].corr(in_string_df['string_score'])
    print(f"Pearson correlation (ipSAE vs STRING score): {correlation:.3f}")

    # Export for plotting
    correlation_data = in_string_df[['ipsae', 'string_score', 'our_confidence', 'string_confidence']].copy()

    return correlation_data

def generate_summary_stats(our_df, in_string_df, not_in_string_df):
    """Generate summary statistics"""
    print("\n=== SUMMARY STATISTICS ===\n")

    summary = {
        'total_predictions': len(our_df),
        'in_string': len(in_string_df),
        'not_in_string': len(not_in_string_df),
        'coverage_rate': len(in_string_df) / len(our_df) if len(our_df) > 0 else 0,
        'by_confidence': {}
    }

    for conf in ['High', 'Medium', 'Low']:
        total = len(our_df[our_df['ipsae_confidence'] == conf])
        in_string = len(in_string_df[in_string_df['our_confidence'] == conf]) if len(in_string_df) > 0 else 0

        summary['by_confidence'][conf] = {
            'total': total,
            'in_string': in_string,
            'coverage_rate': in_string / total if total > 0 else 0
        }

    # Print summary
    print(f"Total predictions: {summary['total_predictions']}")
    print(f"In STRING: {summary['in_string']} ({summary['coverage_rate']*100:.1f}%)")
    print(f"Novel (not in STRING): {summary['not_in_string']}")
    print(f"\nBy confidence level:")
    for conf, stats in summary['by_confidence'].items():
        print(f"  {conf}: {stats['in_string']}/{stats['total']} ({stats['coverage_rate']*100:.1f}%)")

    return summary

def main():
    """Main execution"""
    print("Starting STRING comparison analysis...")

    # Create output directories
    os.makedirs('analysis/results', exist_ok=True)
    os.makedirs('figures/data', exist_ok=True)
    os.makedirs('data/external', exist_ok=True)

    # 1. Load our predictions
    our_df = load_our_interactions()

    # 2. Download STRING data
    links_file, info_file = download_string_data()

    # 3. Load STRING protein info
    gene_to_string = load_string_protein_info(info_file)

    # 4. Load STRING links
    string_df = load_string_links(links_file, gene_to_string)

    # 5. Compare with STRING
    in_string_df, not_in_string_df = compare_with_string(our_df, string_df)

    # 6. Analyze score correlation
    if len(in_string_df) > 0:
        correlation_data = analyze_score_correlation(in_string_df)

        # Export correlation data
        corr_path = 'figures/data/string_score_correlation.csv'
        correlation_data.to_csv(corr_path, index=False)
        print(f"\nSaved correlation data to {corr_path}")

    # 7. Generate summary statistics
    summary = generate_summary_stats(our_df, in_string_df, not_in_string_df)

    # 8. Export results
    if len(in_string_df) > 0:
        validated_path = 'analysis/results/string_validated_interactions.csv'
        in_string_df.to_csv(validated_path, index=False)
        print(f"\nSaved STRING-validated interactions to {validated_path}")

    summary_path = 'analysis/results/string_comparison.json'
    with open(summary_path, 'w') as f:
        json.dump(summary, f, indent=2)
    print(f"Saved summary to {summary_path}")

    print(f"\n✅ STRING comparison complete!\n")
    print("Output files:")
    print(f"  - {summary_path}")
    if len(in_string_df) > 0:
        print(f"  - {validated_path}")
        print(f"  - {corr_path}")

if __name__ == '__main__':
    main()
