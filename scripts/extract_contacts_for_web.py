#!/usr/bin/env python3
"""
PAE Contact Extraction for Web Viewer
======================================

Extracts interface contact data from AlphaFold3 predictions for web visualization.
Reuses analysis logic from interface_analysis.py but outputs web-friendly JSON format.

Output: JSON files with contact data for Mol* structure viewer

Usage:
    # Process single interaction
    python3 scripts/extract_contacts_for_web.py --directory q8nez3_and_q9hbg6

    # Batch process all from cif_mapping.json
    python3 scripts/extract_contacts_for_web.py --batch

    # Specify output directory
    python3 scripts/extract_contacts_for_web.py --batch --output public/contacts_data

Requirements:
    - interface_analysis.py in parent directory
    - cif_mapping.json (from collect_cif_paths.py)
"""

import sys
import json
import argparse
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

# Add SCRIPTS directory to path to import interface_analysis
# __file__ is in: .../SCRIPTS/Global_Analysis/IFT_Interactors_paper/scripts/
# We need: .../SCRIPTS/
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

try:
    from interface_analysis import CIFParser, AF3InterfaceAnalyzerV8
except ImportError:
    print("ERROR: Could not import interface_analysis.py")
    print("Make sure interface_analysis.py is in: /emcc/au14762/elo_lab/SCRIPTS/")
    sys.exit(1)


class WebContactExtractor:
    """Extracts PAE contact data in web-friendly JSON format."""

    # PAE thresholds (same as interface_analysis.py)
    PAE_THRESHOLDS = {
        'very_high': 3.0,
        'high': 5.0,
        'medium': 8.0,
        'low': 12.0
    }

    # Color mapping for web viewer
    CONFIDENCE_COLORS = {
        'very_high': '#228b22',  # Forest green
        'high': '#00ff00',       # Green
        'medium': '#ffff00',     # Yellow
        'low': '#ff4500'         # Orange/Red
    }

    def __init__(self, output_dir: str = "public/contacts_data"):
        """Initialize extractor."""
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def extract_from_files(self, cif_path: str, confidences_path: str) -> Optional[Dict]:
        """
        Extract contact data from CIF and confidences JSON files.

        Returns dict with:
        - chains: List of chain IDs
        - contacts: List of interface contacts with confidence levels
        - summary: Contact counts by confidence
        """
        try:
            cif_file = Path(cif_path)
            conf_file = Path(confidences_path)

            if not cif_file.exists():
                print(f"  ERROR: CIF file not found: {cif_path}")
                return None

            if not conf_file.exists():
                print(f"  ERROR: Confidences file not found: {confidences_path}")
                return None

            # Load confidences JSON
            with open(conf_file, 'r') as f:
                conf_data = json.load(f)

            # Parse CIF file
            cif_parser = CIFParser(str(cif_file))
            if not cif_parser.parse_atoms():
                print(f"  ERROR: Failed to parse CIF file")
                return None

            # Get chain boundaries from token_chain_ids
            token_chains = conf_data.get('token_chain_ids', [])
            if not token_chains:
                print(f"  ERROR: No token_chain_ids in confidences file")
                return None

            chain_boundaries = {}
            for i, chain in enumerate(token_chains):
                if chain not in chain_boundaries:
                    chain_boundaries[chain] = []
                chain_boundaries[chain].append(i)

            if len(chain_boundaries) < 2:
                print(f"  ERROR: Less than 2 chains found")
                return None

            # Get PAE matrix
            pae_matrix = conf_data.get('pae', [])
            if not pae_matrix:
                print(f"  ERROR: No PAE matrix in confidences file")
                return None

            # Get sequences from CIF
            sequences = cif_parser.get_sequences()

            # Analyze contacts
            contacts = self._analyze_contacts(
                chain_boundaries, pae_matrix, cif_parser, sequences
            )

            # Build result
            result = {
                'chains': list(chain_boundaries.keys()),
                'chain_lengths': {chain: len(indices) for chain, indices in chain_boundaries.items()},
                'contacts': contacts,
                'summary': self._calculate_summary(contacts),
                'spatial_validation_enabled': True
            }

            return result

        except Exception as e:
            print(f"  ERROR: {e}")
            import traceback
            traceback.print_exc()
            return None

    def _analyze_contacts(self, chain_boundaries: Dict, pae_matrix: List,
                         cif_parser: CIFParser, sequences: Dict) -> List[Dict]:
        """Analyze interface contacts with spatial validation."""
        SPATIAL_CUTOFF = 5.0  # Angstroms

        chains = list(chain_boundaries.keys())
        contacts = []

        for i, chain1 in enumerate(chains):
            for j, chain2 in enumerate(chains[i+1:], i+1):
                chain1_indices = chain_boundaries[chain1]
                chain2_indices = chain_boundaries[chain2]

                for idx1 in chain1_indices:
                    for idx2 in chain2_indices:
                        pae_value = pae_matrix[idx1][idx2]

                        # Check PAE threshold
                        contact_quality = None
                        for threshold_name, threshold_value in self.PAE_THRESHOLDS.items():
                            if pae_value < threshold_value:
                                contact_quality = threshold_name
                                break

                        if contact_quality:
                            # Spatial validation
                            res1_in_chain = idx1 - min(chain1_indices) + 1
                            res2_in_chain = idx2 - min(chain2_indices) + 1

                            min_distance = cif_parser.calculate_min_distance(
                                chain1, res1_in_chain, chain2, res2_in_chain
                            )

                            if min_distance <= SPATIAL_CUTOFF:
                                # Get amino acids
                                aa1 = 'X'
                                aa2 = 'X'

                                res1_seq_idx = idx1 - min(chain1_indices)
                                res2_seq_idx = idx2 - min(chain2_indices)

                                if chain1 in sequences and res1_seq_idx < len(sequences[chain1]):
                                    aa1 = sequences[chain1][res1_seq_idx]
                                if chain2 in sequences and res2_seq_idx < len(sequences[chain2]):
                                    aa2 = sequences[chain2][res2_seq_idx]

                                contact = {
                                    'chain1': chain1,
                                    'resi1': res1_in_chain,
                                    'aa1': aa1,
                                    'chain2': chain2,
                                    'resi2': res2_in_chain,
                                    'aa2': aa2,
                                    'pae': round(float(pae_value), 2),
                                    'distance': round(float(min_distance), 2),
                                    'confidence': contact_quality,
                                    'color': self.CONFIDENCE_COLORS[contact_quality]
                                }

                                contacts.append(contact)

        return contacts

    def _calculate_summary(self, contacts: List[Dict]) -> Dict:
        """Calculate summary statistics."""
        summary = {
            'total_contacts': len(contacts),
            'very_high_count': 0,
            'high_count': 0,
            'medium_count': 0,
            'low_count': 0
        }

        for contact in contacts:
            conf = contact['confidence']
            summary[f"{conf}_count"] += 1

        return summary

    def save_to_file(self, interaction_id: int, data: Dict) -> Path:
        """Save contact data to JSON file."""
        output_file = self.output_dir / f"{interaction_id}.json"

        output_data = {
            'interaction_id': interaction_id,
            'generated_at': datetime.now().isoformat(),
            'data': data
        }

        with open(output_file, 'w') as f:
            json.dump(output_data, f, indent=2)

        return output_file

    def process_batch(self, mapping_file: str = "cif_mapping.json") -> Dict:
        """Process all interactions from cif_mapping.json."""
        mapping_path = Path(__file__).parent.parent / mapping_file

        if not mapping_path.exists():
            print(f"ERROR: Mapping file not found: {mapping_path}")
            print("Run collect_cif_paths.py first!")
            sys.exit(1)

        with open(mapping_path, 'r') as f:
            mapping_data = json.load(f)

        mappings = mapping_data.get('mappings', {})
        total = len(mappings)
        processed = 0
        successful = 0
        failed = 0

        print(f"Processing {total} interactions...")
        print()

        for interaction_id, file_data in mappings.items():
            processed += 1
            cif_path = file_data.get('cif_path')
            conf_path = file_data.get('confidences_path')

            if not cif_path or not conf_path:
                failed += 1
                if processed % 50 == 0:
                    print(f"  [{processed}/{total}] Skipped (missing files)")
                continue

            print(f"  [{processed}/{total}] Processing interaction {interaction_id}...")

            result = self.extract_from_files(cif_path, conf_path)

            if result:
                output_file = self.save_to_file(int(interaction_id), result)
                successful += 1
                print(f"    ✓ Saved to {output_file.name}")
                print(f"    Contacts: {result['summary']['total_contacts']} " +
                      f"(VH:{result['summary']['very_high_count']}, " +
                      f"H:{result['summary']['high_count']}, " +
                      f"M:{result['summary']['medium_count']}, " +
                      f"L:{result['summary']['low_count']})")
            else:
                failed += 1

            if processed % 10 == 0:
                print()

        return {
            'total': total,
            'processed': processed,
            'successful': successful,
            'failed': failed
        }


def main():
    """Main execution."""
    parser = argparse.ArgumentParser(
        description='Extract PAE contact data for web viewer',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument('--batch', action='store_true',
                       help='Process all interactions from cif_mapping.json')
    parser.add_argument('--directory', type=str,
                       help='Process single interaction directory')
    parser.add_argument('--cif', type=str,
                       help='CIF file path (required with --directory)')
    parser.add_argument('--confidences', type=str,
                       help='Confidences JSON path (required with --directory)')
    parser.add_argument('--interaction-id', type=int,
                       help='Interaction ID (required with --directory)')
    parser.add_argument('--output', type=str, default='public/contacts_data',
                       help='Output directory (default: public/contacts_data)')

    args = parser.parse_args()

    print("="*80)
    print("PAE CONTACT EXTRACTION FOR WEB")
    print("="*80)
    print()

    extractor = WebContactExtractor(output_dir=args.output)

    if args.batch:
        # Batch processing
        print(f"Output directory: {extractor.output_dir}")
        print()

        stats = extractor.process_batch()

        print()
        print("="*80)
        print("BATCH PROCESSING COMPLETE")
        print("="*80)
        print(f"Total interactions: {stats['total']}")
        print(f"Processed: {stats['processed']}")
        print(f"Successful: {stats['successful']} ({stats['successful']/stats['total']*100:.1f}%)")
        print(f"Failed: {stats['failed']} ({stats['failed']/stats['total']*100:.1f}%)")
        print()
        print(f"Output files saved to: {extractor.output_dir}")

    elif args.directory:
        # Single directory processing
        if not args.cif or not args.confidences or args.interaction_id is None:
            print("ERROR: --cif, --confidences, and --interaction-id required with --directory")
            sys.exit(1)

        print(f"Processing directory: {args.directory}")
        print(f"CIF file: {args.cif}")
        print(f"Confidences file: {args.confidences}")
        print()

        result = extractor.extract_from_files(args.cif, args.confidences)

        if result:
            output_file = extractor.save_to_file(args.interaction_id, result)
            print()
            print(f"✓ Success!")
            print(f"  Output: {output_file}")
            print(f"  Contacts: {result['summary']['total_contacts']}")
            print(f"  Very High: {result['summary']['very_high_count']}")
            print(f"  High: {result['summary']['high_count']}")
            print(f"  Medium: {result['summary']['medium_count']}")
            print(f"  Low: {result['summary']['low_count']}")
        else:
            print("✗ Failed to extract contact data")
            sys.exit(1)

    else:
        print("ERROR: Use --batch or --directory")
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
