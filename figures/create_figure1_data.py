#!/usr/bin/env python3
"""
Generate data files for Figure 1 panels

Creates:
- Panel A: Confidence distribution data (CSV)
- Panel B: Interface metrics table (CSV)
- Panel C: Network layout data for schematic (JSON)

Usage:
  export POSTGRES_URL="postgresql://..."
  python figures/create_figure1_data.py
"""

import os
import json
import pandas as pd
import psycopg2
from urllib.parse import urlparse

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

def generate_panel_a_data():
    """Generate confidence distribution data for Panel A"""
    print("\n=== Panel A: Confidence Distribution ===\n")

    conn = connect_to_database()

    query = """
    SELECT
        ipsae_confidence,
        COUNT(*) as count
    FROM interactions
    WHERE ipsae_confidence IS NOT NULL
    GROUP BY ipsae_confidence
    ORDER BY
        CASE ipsae_confidence
            WHEN 'High' THEN 1
            WHEN 'Medium' THEN 2
            WHEN 'Low' THEN 3
        END
    """

    df = pd.read_sql_query(query, conn)
    conn.close()

    # Calculate percentages
    total = df['count'].sum()
    df['percentage'] = (df['count'] / total * 100).round(1)

    # Add colors for plotting
    color_map = {'High': '#28a745', 'Medium': '#fd7e14', 'Low': '#dc3545'}
    df['color'] = df['ipsae_confidence'].map(color_map)

    output_path = 'figures/data/panel_a_confidence_distribution.csv'
    df.to_csv(output_path, index=False)
    print(f"Saved to: {output_path}")
    print(df)

    return df

def generate_panel_b_data():
    """Generate interface metrics table for Panel B"""
    print("\n=== Panel B: Interface Quality Metrics ===\n")

    conn = connect_to_database()

    query = """
    SELECT
        ipsae_confidence,
        COUNT(*) as n,
        ROUND(AVG(ipsae)::numeric, 3) as avg_ipsae,
        ROUND(AVG(interface_plddt)::numeric, 1) as avg_interface_plddt,
        ROUND(AVG(contacts_pae_lt_3)::numeric, 1) as avg_contacts_pae_lt_3,
        ROUND(AVG(contacts_pae_lt_6)::numeric, 1) as avg_contacts_pae_lt_6
    FROM interactions
    WHERE ipsae_confidence IS NOT NULL
    GROUP BY ipsae_confidence
    ORDER BY
        CASE ipsae_confidence
            WHEN 'High' THEN 1
            WHEN 'Medium' THEN 2
            WHEN 'Low' THEN 3
        END
    """

    df = pd.read_sql_query(query, conn)
    conn.close()

    output_path = 'figures/data/panel_b_interface_metrics.csv'
    df.to_csv(output_path, index=False)
    print(f"Saved to: {output_path}")
    print(df.to_string(index=False))

    return df

def generate_panel_c_data():
    """Generate intra-complex interactions for schematic (Panel C)"""
    print("\n=== Panel C: Intra-Complex Interactions ===\n")

    conn = connect_to_database()

    # Define known complex members
    ift_b1_core = ['IFT88', 'IFT81', 'IFT80', 'IFT74', 'IFT57', 'IFT52', 'IFT46',
                   'IFT56', 'IFT27', 'IFT25', 'IFT22', 'IFT20', 'TTC30A', 'TTC30B']
    ift_b2_peripheral = ['IFT172', 'IFT80', 'IFT38', 'CLUAP1', 'IFT54', 'TRAF3IP1']
    ift_a = ['IFT144', 'WDR19', 'IFT140', 'IFT122', 'IFT121', 'WDR35',
             'IFT139', 'TTC21B', 'IFT43']
    bbsome = ['BBS1', 'BBS2', 'BBS3', 'ARL6', 'BBS4', 'BBS5', 'BBS7',
              'BBS8', 'BBS9', 'BBIP1', 'BBS18', 'LZTFL1', 'BBS17']
    tulp3_complex = ['TULP3', 'IFT122', 'GLIS2']

    all_complex_genes = set(ift_b1_core + ift_b2_peripheral + ift_a + bbsome + tulp3_complex)

    # Query for intra-complex interactions
    query = """
    SELECT
        bait.gene_name as bait_gene,
        prey.gene_name as prey_gene,
        i.ipsae,
        i.ipsae_confidence,
        i.contacts_pae_lt_3,
        i.contacts_pae_lt_6,
        i.interface_plddt
    FROM interactions i
    JOIN proteins bait ON i.bait_protein_id = bait.id
    JOIN proteins prey ON i.prey_protein_id = prey.id
    WHERE bait.gene_name IS NOT NULL
      AND prey.gene_name IS NOT NULL
    ORDER BY i.ipsae DESC
    """

    df = pd.read_sql_query(query, conn)
    conn.close()

    # Filter for intra-complex interactions
    intra_complex = []

    for _, row in df.iterrows():
        bait = row['bait_gene']
        prey = row['prey_gene']

        if bait not in all_complex_genes or prey not in all_complex_genes:
            continue

        # Determine which complex
        complex_type = None
        if bait in ift_b1_core and prey in ift_b1_core:
            complex_type = 'IFT-B1'
        elif bait in ift_b2_peripheral and prey in ift_b2_peripheral:
            complex_type = 'IFT-B2'
        elif bait in ift_a and prey in ift_a:
            complex_type = 'IFT-A'
        elif bait in bbsome and prey in bbsome:
            complex_type = 'BBSome'
        elif bait in tulp3_complex and prey in tulp3_complex:
            complex_type = 'TULP3'

        if complex_type:
            intra_complex.append({
                'complex': complex_type,
                'bait': bait,
                'prey': prey,
                'ipsae': row['ipsae'],
                'confidence': row['ipsae_confidence'],
                'contacts_pae_lt_3': row['contacts_pae_lt_3'],
                'contacts_pae_lt_6': row['contacts_pae_lt_6'],
                'interface_plddt': row['interface_plddt']
            })

    intra_df = pd.DataFrame(intra_complex)

    # Save CSV
    output_csv = 'figures/data/panel_c_intra_complex_interactions.csv'
    intra_df.to_csv(output_csv, index=False)
    print(f"Saved to: {output_csv}")

    # Save JSON for easy visualization
    output_json = 'figures/data/panel_c_intra_complex_interactions.json'
    with open(output_json, 'w') as f:
        json.dump(intra_complex, f, indent=2)
    print(f"Saved to: {output_json}")

    # Print summary
    print(f"\nTotal intra-complex interactions: {len(intra_complex)}")
    print("\nBy complex:")
    for complex_name in intra_df['complex'].unique():
        count = len(intra_df[intra_df['complex'] == complex_name])
        print(f"  {complex_name}: {count}")

    # Highlight top interactions
    print("\nTop 10 highest ipSAE intra-complex interactions:")
    top10 = intra_df.nlargest(10, 'ipsae')[['bait', 'prey', 'ipsae', 'confidence', 'complex']]
    print(top10.to_string(index=False))

    return intra_df

def generate_panel_d_info():
    """Generate information about IFT46-IFT56 structure for Panel D"""
    print("\n=== Panel D: IFT46-IFT56 Structure Info ===\n")

    conn = connect_to_database()

    query = """
    SELECT
        i.id,
        bait.gene_name as bait,
        bait.uniprot_id as bait_uniprot,
        prey.gene_name as prey,
        prey.uniprot_id as prey_uniprot,
        i.ipsae,
        i.iptm,
        i.interface_plddt,
        i.contacts_pae_lt_3,
        i.contacts_pae_lt_6
    FROM interactions i
    JOIN proteins bait ON i.bait_protein_id = bait.id
    JOIN proteins prey ON i.prey_protein_id = prey.id
    WHERE (bait.gene_name = 'IFT56' AND prey.gene_name = 'IFT46')
       OR (bait.gene_name = 'IFT46' AND prey.gene_name = 'IFT56')
    ORDER BY i.ipsae DESC
    LIMIT 1
    """

    df = pd.read_sql_query(query, conn)
    conn.close()

    if len(df) > 0:
        info = df.iloc[0].to_dict()

        # Add file paths
        info['cif_path'] = '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/A0AVF1_IFT56/AF3/a0avf1_and_q9nqc8/a0avf1_and_q9nqc8_model.cif'
        info['pae_path'] = '/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD/A0AVF1_IFT56/AF3/a0avf1_and_q9nqc8/a0avf1_and_q9nqc8_confidences.json'
        info['web_url'] = f"https://ift-interactors.vercel.app/?interaction={info['id']}"

        output_path = 'figures/data/panel_d_ift46_ift56_info.json'
        with open(output_path, 'w') as f:
            json.dump(info, f, indent=2, default=str)

        print(f"Saved to: {output_path}")
        print("\nIFT46-IFT56 Details:")
        print(f"  Interaction ID: {info['id']}")
        print(f"  Bait: {info['bait']} ({info['bait_uniprot']})")
        print(f"  Prey: {info['prey']} ({info['prey_uniprot']})")
        print(f"  ipSAE: {info['ipsae']}")
        print(f"  iPTM: {info['iptm']}")
        print(f"  Interface pLDDT: {info['interface_plddt']}")
        print(f"  PAE contacts <3Å: {info['contacts_pae_lt_3']}")
        print(f"  PAE contacts <6Å: {info['contacts_pae_lt_6']}")
        print(f"\n  Structure file: {info['cif_path']}")
        print(f"  PAE data: {info['pae_path']}")
        print(f"  Web viewer: {info['web_url']}")
    else:
        print("IFT46-IFT56 interaction not found in database")

def main():
    """Main execution"""
    print("Generating Figure 1 data files...")

    # Create output directory
    os.makedirs('figures/data', exist_ok=True)

    try:
        # Generate all panels
        generate_panel_a_data()
        generate_panel_b_data()
        generate_panel_c_data()
        generate_panel_d_info()

        print("\n" + "="*60)
        print("✅ All Figure 1 data files generated!")
        print("="*60)
        print("\nOutput files:")
        print("  - figures/data/panel_a_confidence_distribution.csv")
        print("  - figures/data/panel_b_interface_metrics.csv")
        print("  - figures/data/panel_c_intra_complex_interactions.csv")
        print("  - figures/data/panel_c_intra_complex_interactions.json")
        print("  - figures/data/panel_d_ift46_ift56_info.json")
        print("\nNext steps:")
        print("  1. Use panel_a data to create bar/pie chart")
        print("  2. Format panel_b table for publication")
        print("  3. Use panel_c data to draw complex schematic")
        print("  4. Visualize IFT46-IFT56 structure using CIF file")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
