#!/usr/bin/env python3
"""
Create publication-ready tables from IFT/BBSome extraction data
"""

import json
import csv
from datetime import datetime
from collections import defaultdict, Counter

def load_data(filename):
    """Load the extraction data"""
    with open(filename, 'r') as f:
        return json.load(f)

def analyze_interactions(data):
    """Analyze the interaction data and create publication tables"""
    
    # Analysis by complex and confidence
    complex_analysis = defaultdict(lambda: {'total': 0, 'high': 0, 'medium': 0, 'low': 0, 'v4': 0, 'validated': 0})
    
    # Count interactions by bait complex and confidence
    for interaction in data:
        complex = interaction.get('query_complex', 'Unknown')
        confidence = interaction.get('confidence', 'Unknown')
        version = interaction.get('analysis_version', 'v3')
        validated = interaction.get('validated', False)
        
        complex_analysis[complex]['total'] += 1
        
        if confidence == 'High':
            complex_analysis[complex]['high'] += 1
        elif confidence == 'Medium':
            complex_analysis[complex]['medium'] += 1
        elif confidence == 'Low':
            complex_analysis[complex]['low'] += 1
            
        if version == 'v4':
            complex_analysis[complex]['v4'] += 1
            
        if validated:
            complex_analysis[complex]['validated'] += 1
    
    return complex_analysis

def create_complex_summary_table(complex_analysis, output_file):
    """Create a summary table by protein complex"""
    
    with open(output_file, 'w', newline='') as f:
        writer = csv.writer(f)
        
        # Header
        writer.writerow([
            'Protein Complex',
            'Total Interactions',
            'High Confidence',
            'Medium Confidence', 
            'Low Confidence',
            'v4 Analysis',
            'Experimentally Validated',
            'High Conf %',
            'v4 Analysis %'
        ])
        
        # Sort complexes by total interactions
        sorted_complexes = sorted(complex_analysis.items(), 
                                key=lambda x: x[1]['total'], reverse=True)
        
        total_sum = {'total': 0, 'high': 0, 'medium': 0, 'low': 0, 'v4': 0, 'validated': 0}
        
        for complex_name, stats in sorted_complexes:
            high_pct = (stats['high'] / stats['total'] * 100) if stats['total'] > 0 else 0
            v4_pct = (stats['v4'] / stats['total'] * 100) if stats['total'] > 0 else 0
            
            writer.writerow([
                complex_name,
                stats['total'],
                stats['high'],
                stats['medium'],
                stats['low'],
                stats['v4'],
                stats['validated'],
                f"{high_pct:.1f}%",
                f"{v4_pct:.1f}%"
            ])
            
            # Add to totals
            for key in total_sum:
                total_sum[key] += stats[key]
        
        # Add total row
        total_high_pct = (total_sum['high'] / total_sum['total'] * 100) if total_sum['total'] > 0 else 0
        total_v4_pct = (total_sum['v4'] / total_sum['total'] * 100) if total_sum['total'] > 0 else 0
        
        writer.writerow([])  # Empty row
        writer.writerow([
            'TOTAL',
            total_sum['total'],
            total_sum['high'],
            total_sum['medium'],
            total_sum['low'],
            total_sum['v4'],
            total_sum['validated'],
            f"{total_high_pct:.1f}%",
            f"{total_v4_pct:.1f}%"
        ])

def create_high_confidence_v4_table(data, output_file):
    """Create table of high-confidence v4 interactions for publication"""
    
    # Filter for high-confidence v4 interactions
    high_conf_v4 = [
        interaction for interaction in data 
        if interaction.get('confidence') == 'High' and interaction.get('analysis_version') == 'v4'
    ]
    
    # Sort by ipSAE score (descending)
    high_conf_v4.sort(key=lambda x: x.get('ipsae', 0), reverse=True)
    
    with open(output_file, 'w', newline='') as f:
        writer = csv.writer(f)
        
        # Header
        writer.writerow([
            'Bait Gene',
            'Bait Complex',
            'Prey Gene', 
            'Prey UniProt',
            'iPTM',
            'ipSAE Score',
            'ipSAE Confidence',
            'Interface pLDDT',
            'PAE <3Å Contacts',
            'PAE <6Å Contacts',
            'Experimentally Validated',
            'Validation Method'
        ])
        
        for interaction in high_conf_v4:
            exp_val = interaction.get('experimental_validation')
            validation_method = ''
            if exp_val and isinstance(exp_val, dict):
                validation_method = exp_val.get('method', '')
            
            writer.writerow([
                interaction.get('bait_gene', ''),
                interaction.get('bait_complex', ''),
                interaction.get('prey_gene', ''),
                interaction.get('prey_uniprot', ''),
                interaction.get('iptm', ''),
                interaction.get('ipsae', ''),
                interaction.get('ipsae_confidence', ''),
                interaction.get('interface_plddt', ''),
                interaction.get('contacts_pae_lt_3', ''),
                interaction.get('contacts_pae_lt_6', ''),
                'Yes' if interaction.get('validated') else 'No',
                validation_method
            ])

def create_validated_interactions_table(data, output_file):
    """Create table of experimentally validated interactions"""
    
    # Filter for validated interactions
    validated = [
        interaction for interaction in data 
        if interaction.get('validated', False)
    ]
    
    # Sort by complex and confidence
    validated.sort(key=lambda x: (x.get('bait_complex', ''), x.get('confidence', '')))
    
    with open(output_file, 'w', newline='') as f:
        writer = csv.writer(f)
        
        # Header
        writer.writerow([
            'Bait Gene',
            'Bait Complex',
            'Prey Gene',
            'Prey UniProt',
            'Confidence',
            'iPTM',
            'ipSAE Score',
            'Analysis Version',
            'Validation Date',
            'Validation Method',
            'Validation Source',
            'Notes'
        ])
        
        for interaction in validated:
            exp_val = interaction.get('experimental_validation', {})
            if isinstance(exp_val, dict):
                val_date = exp_val.get('date', '')
                val_method = exp_val.get('method', '')
                val_source = exp_val.get('source', '')
                val_notes = exp_val.get('notes', '')
            else:
                val_date = val_method = val_source = val_notes = ''
            
            writer.writerow([
                interaction.get('bait_gene', ''),
                interaction.get('bait_complex', ''),
                interaction.get('prey_gene', ''),
                interaction.get('prey_uniprot', ''),
                interaction.get('confidence', ''),
                interaction.get('iptm', ''),
                interaction.get('ipsae', ''),
                interaction.get('analysis_version', ''),
                val_date,
                val_method,
                val_source,
                val_notes
            ])

def create_protein_coverage_table(data, output_file):
    """Create table showing coverage for each queried protein"""
    
    # Count interactions per protein
    protein_stats = defaultdict(lambda: {
        'total': 0, 'high': 0, 'medium': 0, 'low': 0, 'v4': 0, 'validated': 0, 'complex': ''
    })
    
    for interaction in data:
        query_id = interaction.get('query_uniprot', '')
        query_gene = interaction.get('query_gene', '')
        query_complex = interaction.get('query_complex', '')
        confidence = interaction.get('confidence', '')
        version = interaction.get('analysis_version', 'v3')
        validated = interaction.get('validated', False)
        
        key = f"{query_gene} ({query_id})"
        protein_stats[key]['complex'] = query_complex
        protein_stats[key]['total'] += 1
        
        if confidence == 'High':
            protein_stats[key]['high'] += 1
        elif confidence == 'Medium':
            protein_stats[key]['medium'] += 1
        elif confidence == 'Low':
            protein_stats[key]['low'] += 1
            
        if version == 'v4':
            protein_stats[key]['v4'] += 1
            
        if validated:
            protein_stats[key]['validated'] += 1
    
    with open(output_file, 'w', newline='') as f:
        writer = csv.writer(f)
        
        # Header
        writer.writerow([
            'Protein (UniProt)',
            'Complex',
            'Total Interactions',
            'High Confidence',
            'Medium Confidence',
            'Low Confidence',
            'v4 Analysis',
            'Validated',
            'High Conf %'
        ])
        
        # Sort by complex then by total interactions
        sorted_proteins = sorted(protein_stats.items(), 
                               key=lambda x: (x[1]['complex'], -x[1]['total']))
        
        for protein, stats in sorted_proteins:
            high_pct = (stats['high'] / stats['total'] * 100) if stats['total'] > 0 else 0
            
            writer.writerow([
                protein,
                stats['complex'],
                stats['total'],
                stats['high'],
                stats['medium'],
                stats['low'],
                stats['v4'],
                stats['validated'],
                f"{high_pct:.1f}%"
            ])

def main():
    """Main function to create all publication tables"""
    
    print("Creating publication-ready tables from IFT/BBSome extraction data...")
    
    # Load the data
    data_file = 'ift_bbsome_extraction_20251031_131653.json'
    data = load_data(data_file)
    
    print(f"Loaded {len(data)} interactions")
    
    # Analyze the data
    complex_analysis = analyze_interactions(data)
    
    # Create output files with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # 1. Complex summary table
    complex_summary_file = f"publication_complex_summary_{timestamp}.csv"
    create_complex_summary_table(complex_analysis, complex_summary_file)
    print(f"Created complex summary table: {complex_summary_file}")
    
    # 2. High-confidence v4 interactions
    high_conf_file = f"publication_high_confidence_v4_{timestamp}.csv"
    create_high_confidence_v4_table(data, high_conf_file)
    print(f"Created high-confidence v4 table: {high_conf_file}")
    
    # 3. Validated interactions
    validated_file = f"publication_validated_interactions_{timestamp}.csv"
    create_validated_interactions_table(data, validated_file)
    print(f"Created validated interactions table: {validated_file}")
    
    # 4. Protein coverage table
    coverage_file = f"publication_protein_coverage_{timestamp}.csv"
    create_protein_coverage_table(data, coverage_file)
    print(f"Created protein coverage table: {coverage_file}")
    
    # Print summary statistics
    print(f"\n{'='*60}")
    print("PUBLICATION TABLE SUMMARY")
    print(f"{'='*60}")
    
    total_interactions = len(data)
    high_conf_v4 = len([i for i in data if i.get('confidence') == 'High' and i.get('analysis_version') == 'v4'])
    validated = len([i for i in data if i.get('validated')])
    unique_proteins = len(set(i.get('query_uniprot') for i in data))
    
    print(f"Total interactions: {total_interactions}")
    print(f"High-confidence v4 interactions: {high_conf_v4}")
    print(f"Experimentally validated: {validated}")
    print(f"Unique proteins queried: {unique_proteins}")
    
    print(f"\nFiles created:")
    print(f"1. {complex_summary_file} - Summary by protein complex")
    print(f"2. {high_conf_file} - High-confidence v4 interactions")
    print(f"3. {validated_file} - Experimentally validated interactions")
    print(f"4. {coverage_file} - Coverage per protein")
    
    print(f"{'='*60}")

if __name__ == "__main__":
    main()