#!/usr/bin/env python3
"""
IFT Protein Extraction Script - Updated with Working API
Extracts all IFT proteins and their interactors from ciliaaf3predictions database
"""

import urllib.request
import urllib.parse
import urllib.error
import json
import time
from typing import List, Dict, Set
from datetime import datetime
import csv

class IFTExtractor:
    def __init__(self, base_url="https://ciliaaf3predictions.vercel.app"):
        self.base_url = base_url
        self.all_interactions = []
        self.processed_proteins = set()
        self.failed_proteins = set()
        
    def get_human_ift_proteins(self) -> Dict[str, Dict]:
        """Returns dictionary of human IFT proteins with their metadata"""
        return {
            # IFT-A Complex
            'Q8NEZ3': {'gene': 'IFT144', 'aliases': ['WDR19', 'KIAA1638', 'SRTD5', 'NPHP13'], 'complex': 'IFT-A'},
            'Q96RY7': {'gene': 'IFT140', 'aliases': ['KIAA0590', 'SRTD9', 'WDTC2'], 'complex': 'IFT-A'},
            'Q7Z4L5': {'gene': 'IFT139', 'aliases': ['TTC21B', 'THM1', 'NPHP12', 'JBTS11'], 'complex': 'IFT-A'},
            'Q9HBG6': {'gene': 'IFT122', 'aliases': ['WDR10', 'WDR140', 'SPG', 'CED1'], 'complex': 'IFT-A'},
            'Q9NZJ4': {'gene': 'IFT121', 'aliases': ['WDR35', 'NPHP19', 'SRTD7'], 'complex': 'IFT-A'},
            'Q96FT9': {'gene': 'IFT43', 'aliases': ['C14orf179'], 'complex': 'IFT-A'},
            
            # IFT-B1 Complex (Core)
            'Q13099': {'gene': 'IFT88', 'aliases': ['TG737', 'TTC10', 'Polaris', 'DAF19'], 'complex': 'IFT-B1'},
            'Q8WYA0': {'gene': 'IFT81', 'aliases': ['CDV1', 'CDV-1R'], 'complex': 'IFT-B1'},
            'Q96LB3': {'gene': 'IFT74', 'aliases': ['CCDC2', 'CMG1', 'BBS22'], 'complex': 'IFT-B1'},
            'Q9P0F2': {'gene': 'IFT70A', 'aliases': ['TTC30A', 'FLJ14423'], 'complex': 'IFT-B1'},
            'Q8IWP0': {'gene': 'IFT70B', 'aliases': ['TTC30B'], 'complex': 'IFT-B1'},
            'Q9Y366': {'gene': 'IFT52', 'aliases': ['NGD2', 'CGI-53', 'C20orf9'], 'complex': 'IFT-B1'},
            'Q9NQC8': {'gene': 'IFT46', 'aliases': ['C11orf2', 'C11orf60'], 'complex': 'IFT-B1'},
            'Q9BW83': {'gene': 'IFT27', 'aliases': ['RABL4', 'RAYL'], 'complex': 'IFT-B1'},
            'Q9Y547': {'gene': 'IFT25', 'aliases': ['HSPB11', 'C1orf41', 'PP25'], 'complex': 'IFT-B1'},
            'Q9H7X7': {'gene': 'IFT22', 'aliases': ['RABL5', 'RABL', 'FLJ21827'], 'complex': 'IFT-B1'},
            'A0AVF1': {'gene': 'TTC26/IFT56', 'aliases': ['DYF13'], 'complex': 'IFT-B1'},
            
            # IFT-B2 Complex (Peripheral)
            'Q9UG01': {'gene': 'IFT172', 'aliases': ['SLB', 'KIAA1179', 'NPHP17', 'BBS20'], 'complex': 'IFT-B2'},
            'Q9P2H3': {'gene': 'IFT80', 'aliases': ['WDR56', 'KIAA1374'], 'complex': 'IFT-B2'},
            'Q9NWB7': {'gene': 'IFT57', 'aliases': ['ESRRBL1', 'HIPPI', 'FLJ10607'], 'complex': 'IFT-B2'},
            'Q8TDR0': {'gene': 'IFT54', 'aliases': ['TRAF3IP1', 'MIP-T3', 'MIPT3', 'DDA1'], 'complex': 'IFT-B2'},
            'Q6NVG7': {'gene': 'IFT38', 'aliases': ['CLUAP1', 'FAP22', 'KIAA0406', 'qilin'], 'complex': 'IFT-B2'},
            'Q8IY31': {'gene': 'IFT20', 'aliases': ['C3orf30'], 'complex': 'IFT-B2'},
            
            # Additional IFT-associated
            'O75386': {'gene': 'TULP3', 'aliases': ['RP26'], 'complex': 'IFT-associated'},
            'Q8NDW8': {'gene': 'TTC21A', 'aliases': [], 'complex': 'IFT-associated'},
            'Q96EX3': {'gene': 'WDR34', 'aliases': ['SRTD11', 'FAP133'], 'complex': 'IFT-associated'},
            'Q8WVS4': {'gene': 'WDR60', 'aliases': ['SRTD8', 'FAP163'], 'complex': 'IFT-associated'},
            
            # Motor proteins
            'Q9Y496': {'gene': 'KIF3A', 'aliases': [], 'complex': 'Motor'},
            'O15066': {'gene': 'KIF3B', 'aliases': [], 'complex': 'Motor'},
            'O14782': {'gene': 'KIF3C', 'aliases': [], 'complex': 'Motor'},
            'Q92845': {'gene': 'KIFAP3', 'aliases': ['KAP3'], 'complex': 'Motor'},
            'Q8NCM8': {'gene': 'DYNC2H1', 'aliases': ['DHC2', 'DNCH2', 'DYH1B', 'SRTD3'], 'complex': 'Motor'},
            'Q8TCX1': {'gene': 'DYNC2LI1', 'aliases': ['D2LIC', 'LIC3', 'SRTD15'], 'complex': 'Motor'},
        }
    
    def get_bbsome_proteins(self) -> Dict[str, Dict]:
        """Returns dictionary of BBSome proteins"""
        return {
            'Q8NFJ9': {'gene': 'BBS1', 'aliases': ['BBS2L2'], 'complex': 'BBSome'},
            'Q9BXC9': {'gene': 'BBS2', 'aliases': ['RP74'], 'complex': 'BBSome'},
            'Q96RK4': {'gene': 'BBS4', 'aliases': [], 'complex': 'BBSome'},
            'Q8N3I7': {'gene': 'BBS5', 'aliases': [], 'complex': 'BBSome'},
            'Q8IWZ6': {'gene': 'BBS7', 'aliases': ['BBS2L1'], 'complex': 'BBSome'},
            'Q8TAM2': {'gene': 'BBS8', 'aliases': ['TTC8', 'RP51'], 'complex': 'BBSome'},
            'Q3BBV0': {'gene': 'BBS9', 'aliases': ['PTHB1', 'B1', 'D1'], 'complex': 'BBSome'},
            'A8MTZ0': {'gene': 'BBIP1', 'aliases': ['BBS18', 'NCRNA00081'], 'complex': 'BBSome'},
        }
    
    def get_chlamydomonas_ift_proteins(self) -> Dict[str, Dict]:
        """Returns dictionary of Chlamydomonas IFT proteins"""
        return {
            # IFT-A Complex
            'A8IQ96': {'gene': 'IFT144', 'complex': 'IFT-A'},
            'A8J7G0': {'gene': 'IFT140', 'complex': 'IFT-A'},
            'A8IVF8': {'gene': 'IFT139', 'complex': 'IFT-A'},
            'A8HNR6': {'gene': 'IFT122', 'complex': 'IFT-A'},
            'A8IMD9': {'gene': 'IFT121', 'complex': 'IFT-A'},
            'A8IZK6': {'gene': 'IFT43', 'complex': 'IFT-A'},
            
            # IFT-B1 Complex
            'Q2QPA4': {'gene': 'IFT88', 'complex': 'IFT-B1'},
            'A8HXK5': {'gene': 'IFT81', 'complex': 'IFT-B1'},
            'A8IQB4': {'gene': 'IFT74', 'complex': 'IFT-B1'},
            'A8J337': {'gene': 'IFT70', 'complex': 'IFT-B1'},
            'Q9FPE2': {'gene': 'IFT52', 'complex': 'IFT-B1'},
            'A8ISA8': {'gene': 'IFT46', 'complex': 'IFT-B1'},
            'Q9FLN8': {'gene': 'IFT27', 'complex': 'IFT-B1'},
            'A8I0P5': {'gene': 'IFT25', 'complex': 'IFT-B1'},
            'A8HY52': {'gene': 'IFT22', 'complex': 'IFT-B1'},
            
            # IFT-B2 Complex
            'A8HW27': {'gene': 'IFT172', 'complex': 'IFT-B2'},
            'A8HSF1': {'gene': 'IFT80', 'complex': 'IFT-B2'},
            'A8J7F2': {'gene': 'IFT57', 'complex': 'IFT-B2'},
            'A8IK24': {'gene': 'IFT54', 'complex': 'IFT-B2'},
            'A8IMS1': {'gene': 'IFT38', 'complex': 'IFT-B2'},
            'Q9XIF3': {'gene': 'IFT20', 'complex': 'IFT-B2'},
            
            # Motor proteins
            'P46870': {'gene': 'FLA10', 'complex': 'Motor'},
            'Q6P6L4': {'gene': 'FLA8', 'complex': 'Motor'},
            'A8ITP5': {'gene': 'KAP', 'complex': 'Motor'},
            'A0A2K3DKS7': {'gene': 'DHC1B', 'complex': 'Motor'},
            'A8HMU9': {'gene': 'D1bLIC', 'complex': 'Motor'},
            'A8IUH6': {'gene': 'FAP133', 'complex': 'Motor'},
            'A8ILC9': {'gene': 'FAP163', 'complex': 'Motor'},
        }
    
    def query_protein(self, uniprot_id: str, protein_info: Dict) -> List[Dict]:
        """
        Query a single protein and get all its interactions
        """
        print(f"Querying {uniprot_id} ({protein_info.get('gene', 'Unknown')})")
        
        # Use the discovered working API endpoint
        api_url = f"{self.base_url}/api/interactions/{uniprot_id}"
        
        try:
            with urllib.request.urlopen(api_url, timeout=15) as response:
                if response.getcode() == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    
                    interactions = []
                    for interaction in data.get('interactions', []):
                        # Process each interaction and normalize the data
                        processed_interaction = {
                            'id': interaction.get('id'),
                            'bait_uniprot': interaction.get('bait_uniprot'),
                            'bait_gene': interaction.get('bait_gene'),
                            'bait_complex': protein_info.get('complex', ''),
                            'bait_organism': interaction.get('bait_organism'),
                            'prey_uniprot': interaction.get('prey_uniprot'),
                            'prey_gene': interaction.get('prey_gene'),
                            'prey_organism': interaction.get('prey_organism'),
                            
                            # Confidence and scoring metrics
                            'confidence': interaction.get('confidence'),
                            'iptm': interaction.get('iptm'),
                            'interface_plddt': interaction.get('interface_plddt'),
                            'contacts_pae_lt_3': interaction.get('contacts_pae_lt_3'),
                            'contacts_pae_lt_6': interaction.get('contacts_pae_lt_6'),
                            
                            # ipSAE scoring (v4 analysis)
                            'ipsae': interaction.get('ipsae'),
                            'ipsae_confidence': interaction.get('ipsae_confidence'),
                            'ipsae_pae_cutoff': interaction.get('ipsae_pae_cutoff'),
                            
                            # Version and source information
                            'analysis_version': interaction.get('analysis_version'),
                            'alphafold_version': interaction.get('alphafold_version'),
                            'source_path': interaction.get('source_path'),
                            
                            # Experimental validation
                            'experimental_validation': interaction.get('experimental_validation'),
                            'validated': interaction.get('experimental_validation') is not None,
                            
                            # Query metadata
                            'query_uniprot': uniprot_id,
                            'query_gene': protein_info.get('gene', ''),
                            'query_complex': protein_info.get('complex', ''),
                            'extraction_timestamp': datetime.now().isoformat()
                        }
                        interactions.append(processed_interaction)
                    
                    self.processed_proteins.add(uniprot_id)
                    print(f"  Found {len(interactions)} interactions")
                    
                    # Rate limiting
                    time.sleep(1)
                    
                    return interactions
                else:
                    print(f"  HTTP {response.getcode()}")
                    return []
                    
        except Exception as e:
            print(f"  Error: {e}")
            self.failed_proteins.add(uniprot_id)
            return []
    
    def extract_proteins(self, protein_dict: Dict[str, Dict], species_name: str):
        """Extract interactions for a set of proteins"""
        print(f"\n{'='*60}")
        print(f"Extracting {species_name} proteins...")
        print(f"Total proteins: {len(protein_dict)}")
        print(f"{'='*60}")
        
        for i, (uniprot_id, protein_info) in enumerate(protein_dict.items(), 1):
            print(f"\n[{i}/{len(protein_dict)}] Processing {protein_info.get('gene', uniprot_id)}")
            interactions = self.query_protein(uniprot_id, protein_info)
            self.all_interactions.extend(interactions)
    
    def extract_all_ift_and_bbsome_proteins(self):
        """Main extraction function for IFT and BBSome proteins"""
        
        # Extract human IFT proteins
        human_ift = self.get_human_ift_proteins()
        self.extract_proteins(human_ift, "Human IFT")
        
        # Extract BBSome proteins  
        bbsome = self.get_bbsome_proteins()
        self.extract_proteins(bbsome, "BBSome")
        
        # Extract Chlamydomonas IFT proteins
        chlamydomonas_ift = self.get_chlamydomonas_ift_proteins()
        self.extract_proteins(chlamydomonas_ift, "Chlamydomonas IFT")
        
        return self.all_interactions
    
    def save_results(self, output_prefix='ift_bbsome_extraction'):
        """Save extracted data to files"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        print(f"\n{'='*60}")
        print("EXTRACTION SUMMARY")
        print(f"{'='*60}")
        print(f"Proteins successfully processed: {len(self.processed_proteins)}")
        print(f"Proteins failed: {len(self.failed_proteins)}")
        print(f"Total interactions found: {len(self.all_interactions)}")
        
        if self.failed_proteins:
            print(f"Failed proteins: {', '.join(self.failed_proteins)}")
        
        # Count interactions by analysis version
        v4_interactions = [i for i in self.all_interactions if i.get('analysis_version') == 'v4']
        v3_interactions = [i for i in self.all_interactions if i.get('analysis_version') == 'v3']
        
        print(f"v4 analysis interactions: {len(v4_interactions)}")
        print(f"v3 analysis interactions: {len(v3_interactions)}")
        
        # Count by confidence
        high_conf = [i for i in self.all_interactions if i.get('confidence') == 'High']
        medium_conf = [i for i in self.all_interactions if i.get('confidence') == 'Medium']
        low_conf = [i for i in self.all_interactions if i.get('confidence') == 'Low']
        
        print(f"High confidence: {len(high_conf)}")
        print(f"Medium confidence: {len(medium_conf)}")  
        print(f"Low confidence: {len(low_conf)}")
        
        # Count experimentally validated
        validated = [i for i in self.all_interactions if i.get('validated')]
        print(f"Experimentally validated: {len(validated)}")
        
        print(f"{'='*60}")
        
        # Save as JSON
        json_file = f"{output_prefix}_{timestamp}.json"
        with open(json_file, 'w') as f:
            json.dump(self.all_interactions, f, indent=2)
        print(f"Saved complete data to: {json_file}")
        
        # Save as CSV
        if self.all_interactions:
            csv_file = f"{output_prefix}_{timestamp}.csv"
            
            # Get all unique field names
            all_fields = set()
            for interaction in self.all_interactions:
                all_fields.update(interaction.keys())
            
            # Define field order for CSV
            priority_fields = [
                'query_uniprot', 'query_gene', 'query_complex',
                'bait_uniprot', 'bait_gene', 
                'prey_uniprot', 'prey_gene',
                'confidence', 'ipsae', 'ipsae_confidence',
                'iptm', 'interface_plddt', 'contacts_pae_lt_3', 'contacts_pae_lt_6',
                'analysis_version', 'alphafold_version', 'validated', 'experimental_validation'
            ]
            
            # Add remaining fields
            other_fields = sorted(all_fields - set(priority_fields))
            field_order = priority_fields + other_fields
            
            with open(csv_file, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=field_order)
                writer.writeheader()
                for interaction in self.all_interactions:
                    # Handle complex nested data for CSV
                    row = interaction.copy()
                    if 'experimental_validation' in row and isinstance(row['experimental_validation'], dict):
                        row['experimental_validation'] = json.dumps(row['experimental_validation'])
                    writer.writerow(row)
            
            print(f"Saved CSV data to: {csv_file}")
        
        # Save high-confidence v4 interactions separately
        high_conf_v4 = [i for i in self.all_interactions 
                       if i.get('analysis_version') == 'v4' and i.get('confidence') == 'High']
        
        if high_conf_v4:
            hc_file = f"{output_prefix}_high_confidence_v4_{timestamp}.json"
            with open(hc_file, 'w') as f:
                json.dump(high_conf_v4, f, indent=2)
            print(f"Saved high-confidence v4 interactions to: {hc_file}")
        
        # Save summary statistics
        stats_file = f"{output_prefix}_stats_{timestamp}.txt"
        with open(stats_file, 'w') as f:
            f.write(f"IFT and BBSome Protein Extraction Statistics\n")
            f.write(f"="*60 + "\n")
            f.write(f"Extraction timestamp: {datetime.now().isoformat()}\n")
            f.write(f"Total proteins queried: {len(self.processed_proteins) + len(self.failed_proteins)}\n")
            f.write(f"Proteins successfully processed: {len(self.processed_proteins)}\n")
            f.write(f"Proteins failed: {len(self.failed_proteins)}\n")
            f.write(f"Total interactions found: {len(self.all_interactions)}\n\n")
            
            f.write(f"Analysis Version Breakdown:\n")
            f.write(f"v4 interactions: {len(v4_interactions)}\n")
            f.write(f"v3 interactions: {len(v3_interactions)}\n\n")
            
            f.write(f"Confidence Level Breakdown:\n")
            f.write(f"High confidence: {len(high_conf)}\n")
            f.write(f"Medium confidence: {len(medium_conf)}\n")
            f.write(f"Low confidence: {len(low_conf)}\n\n")
            
            f.write(f"Experimental Validation:\n")
            f.write(f"Validated interactions: {len(validated)}\n\n")
            
            if self.failed_proteins:
                f.write(f"Failed proteins: {', '.join(self.failed_proteins)}\n")
        
        print(f"Saved statistics to: {stats_file}")

def main():
    """Main execution function"""
    print("IFT and BBSome Protein Interaction Extractor")
    print("="*60)
    
    extractor = IFTExtractor()
    
    # Extract all proteins and their interactions
    interactions = extractor.extract_all_ift_and_bbsome_proteins()
    
    # Save results
    extractor.save_results()
    
    print(f"\nExtraction complete! Found {len(interactions)} total interactions.")

if __name__ == "__main__":
    main()