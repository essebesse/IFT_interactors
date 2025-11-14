#!/usr/bin/env python3
"""
CIF Path Collection Script for IFT Interactors Database
========================================================

Connects to the Neon database, queries all interactions, and finds corresponding
CIF files in the AlphaPulldown directory structure.

Output: cif_mapping.json with mappings for all interactions

Usage:
    export POSTGRES_URL="postgresql://..."
    python3 scripts/collect_cif_paths.py

Requirements:
    pip install psycopg2-binary
"""

import os
import sys
import json
import psycopg2
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import urlparse
from datetime import datetime

# Base directory for AlphaPulldown predictions
AF3_BASE_DIR = Path("/emcc/au14762/elo_lab/AlphaPulldown/AF3_APD")


def connect_to_database() -> psycopg2.extensions.connection:
    """Connect to Neon PostgreSQL database using POSTGRES_URL environment variable."""
    postgres_url = os.environ.get('POSTGRES_URL')

    if not postgres_url:
        print("ERROR: POSTGRES_URL environment variable not set")
        print("Usage: export POSTGRES_URL='postgresql://...'")
        sys.exit(1)

    try:
        # Parse URL to remove channel_binding if present (not supported by psycopg2)
        if '?' in postgres_url:
            base_url, params = postgres_url.split('?', 1)
            # Remove channel_binding parameter
            params_dict = dict(p.split('=') for p in params.split('&') if '=' in p)
            params_dict.pop('channel_binding', None)

            if params_dict:
                params_str = '&'.join(f"{k}={v}" for k, v in params_dict.items())
                postgres_url = f"{base_url}?{params_str}"
            else:
                postgres_url = base_url

        conn = psycopg2.connect(postgres_url)
        print(f"✓ Connected to database successfully")
        return conn

    except Exception as e:
        print(f"ERROR: Failed to connect to database: {e}")
        sys.exit(1)


def get_all_interactions(conn) -> List[Dict]:
    """Query all interactions from database."""
    cursor = conn.cursor()

    query = """
        SELECT
            i.id,
            b.uniprot_id as bait_uniprot,
            b.gene_name as bait_gene,
            p.uniprot_id as prey_uniprot,
            p.gene_name as prey_gene,
            i.source_path
        FROM interactions i
        JOIN proteins b ON i.bait_protein_id = b.id
        JOIN proteins p ON i.prey_protein_id = p.id
        ORDER BY i.id;
    """

    try:
        cursor.execute(query)
        rows = cursor.fetchall()

        interactions = []
        for row in rows:
            interactions.append({
                'id': row[0],
                'bait_uniprot': row[1],
                'bait_gene': row[2],
                'prey_uniprot': row[3],
                'prey_gene': row[4],
                'source_path': row[5]
            })

        print(f"✓ Found {len(interactions)} interactions in database")
        return interactions

    except Exception as e:
        print(f"ERROR: Failed to query interactions: {e}")
        sys.exit(1)

    finally:
        cursor.close()


def extract_directory_from_source_path(source_path: Optional[str]) -> Optional[str]:
    """
    Extract interaction directory name from source_path.

    Example source_path formats:
    - /emcc/.../AF3_APD/Q8NEZ3_IFT144/AF3/q8nez3_and_q9hbg6/...
    - q8nez3_and_q9hbg6/seed-1_sample-0/...

    Returns: q8nez3_and_q9hbg6
    """
    if not source_path:
        return None

    # Split by forward slash
    parts = source_path.split('/')

    # Look for pattern: lowercase_and_lowercase (interaction directory)
    for part in parts:
        if '_and_' in part and part.islower():
            # Remove any trailing path components
            return part.split('/')[0]

    return None


def find_cif_file(bait_uniprot: str, bait_gene: Optional[str],
                  prey_uniprot: str, directory_name: Optional[str]) -> Optional[Dict[str, str]]:
    """
    Find CIF file in AlphaPulldown directory structure.

    Search pattern:
    1. {BAIT_UNIPROT}_{BAIT_GENE}/AF3/{directory_name}/{directory_name}_model.cif
    2. {BAIT_UNIPROT}/AF3/{directory_name}/{directory_name}_model.cif

    Returns dict with cif_path, confidences_path, and bait_directory
    """

    if not directory_name:
        return None

    # Try different bait directory patterns
    bait_patterns = []

    if bait_gene:
        # Pattern 1: Q8NEZ3_IFT144
        bait_patterns.append(f"{bait_uniprot}_{bait_gene}")
        # Pattern 2: Q8NEZ3_WDR19 (if gene name differs)
        bait_patterns.append(f"{bait_uniprot}_{bait_gene.upper()}")

    # Pattern 3: Just UniProt ID
    bait_patterns.append(bait_uniprot)

    for bait_dir in bait_patterns:
        bait_path = AF3_BASE_DIR / bait_dir / "AF3" / directory_name

        if bait_path.exists():
            # Look for model.cif file
            cif_files = list(bait_path.glob(f"{directory_name}_model.cif"))

            if not cif_files:
                # Try alternative pattern: *_model.cif
                cif_files = list(bait_path.glob("*_model.cif"))

            if cif_files:
                cif_path = cif_files[0]

                # Also find confidences.json file
                confidences_files = list(bait_path.glob(f"{directory_name}_confidences.json"))

                if not confidences_files:
                    confidences_files = list(bait_path.glob("*_confidences.json"))

                confidences_path = confidences_files[0] if confidences_files else None

                return {
                    'cif_path': str(cif_path),
                    'confidences_path': str(confidences_path) if confidences_path else None,
                    'bait_directory': bait_dir,
                    'interaction_directory': directory_name
                }

    return None


def main():
    """Main execution function."""
    print("="*80)
    print("CIF PATH COLLECTION SCRIPT")
    print("="*80)
    print()

    # Check if base directory exists
    if not AF3_BASE_DIR.exists():
        print(f"ERROR: AlphaPulldown base directory not found: {AF3_BASE_DIR}")
        sys.exit(1)

    print(f"Base directory: {AF3_BASE_DIR}")
    print()

    # Connect to database
    conn = connect_to_database()

    # Get all interactions
    interactions = get_all_interactions(conn)

    # Close database connection
    conn.close()

    print()
    print("Searching for CIF files...")
    print()

    # Process each interaction
    mapping = {}
    found_count = 0
    missing_count = 0

    for idx, inter in enumerate(interactions, 1):
        interaction_id = inter['id']
        bait_uniprot = inter['bait_uniprot']
        bait_gene = inter['bait_gene']
        prey_uniprot = inter['prey_uniprot']
        source_path = inter['source_path']

        # Extract directory name from source_path
        directory_name = extract_directory_from_source_path(source_path)

        if not directory_name:
            # Try to construct from UniProt IDs
            directory_name = f"{bait_uniprot.lower()}_and_{prey_uniprot.lower()}"

        # Find CIF file
        result = find_cif_file(bait_uniprot, bait_gene, prey_uniprot, directory_name)

        if result:
            mapping[interaction_id] = result
            found_count += 1

            if idx % 50 == 0:
                print(f"  Processed {idx}/{len(interactions)} - Found: {found_count}, Missing: {missing_count}")
        else:
            missing_count += 1
            mapping[interaction_id] = {
                'cif_path': None,
                'confidences_path': None,
                'bait_directory': None,
                'interaction_directory': directory_name,
                'error': 'CIF file not found'
            }

    print()
    print(f"✓ Processing complete!")
    print(f"  Total interactions: {len(interactions)}")
    print(f"  Found CIF files: {found_count} ({found_count/len(interactions)*100:.1f}%)")
    print(f"  Missing CIF files: {missing_count} ({missing_count/len(interactions)*100:.1f}%)")
    print()

    # Save mapping to JSON file
    output_file = Path(__file__).parent.parent / "cif_mapping.json"

    output_data = {
        'generated_at': datetime.now().isoformat(),
        'total_interactions': len(interactions),
        'found_count': found_count,
        'missing_count': missing_count,
        'mappings': mapping
    }

    with open(output_file, 'w') as f:
        json.dump(output_data, f, indent=2)

    print(f"✓ Saved mapping to: {output_file}")
    print()

    # Show some examples
    if found_count > 0:
        print("Sample mappings:")
        sample_count = 0
        for inter_id, data in mapping.items():
            if data['cif_path'] and sample_count < 3:
                print(f"  ID {inter_id}:")
                print(f"    CIF: {data['cif_path']}")
                print(f"    Confidences: {data['confidences_path']}")
                print()
                sample_count += 1

    # Show missing examples
    if missing_count > 0:
        print("Sample missing files:")
        sample_count = 0
        for inter_id, data in mapping.items():
            if not data['cif_path'] and sample_count < 3:
                print(f"  ID {inter_id}: {data['interaction_directory']}")
                sample_count += 1
        print()

    print("="*80)
    print("COMPLETE")
    print("="*80)


if __name__ == "__main__":
    main()
