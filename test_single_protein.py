#!/usr/bin/env python3
"""
Test script to validate the IFT extractor with a single protein
"""

import urllib.request
import urllib.parse
import urllib.error
import json
from datetime import datetime

def test_single_protein():
    """Test extraction for a single IFT protein"""
    
    # Test with IFT144 (Q8NEZ3) - we know this has good data
    test_uniprot = "Q8NEZ3"
    test_info = {'gene': 'IFT144', 'complex': 'IFT-A'}
    
    base_url = "https://ciliaaf3predictions.vercel.app"
    api_url = f"{base_url}/api/interactions/{test_uniprot}"
    
    print(f"Testing single protein extraction...")
    print(f"Protein: {test_uniprot} ({test_info['gene']})")
    print(f"API URL: {api_url}")
    print(f"{'='*60}")
    
    try:
        with urllib.request.urlopen(api_url, timeout=15) as response:
            if response.getcode() == 200:
                data = json.loads(response.read().decode('utf-8'))
                
                print(f"✓ API call successful!")
                print(f"Response keys: {list(data.keys())}")
                print(f"Number of interactions: {len(data.get('interactions', []))}")
                
                interactions = []
                for interaction in data.get('interactions', []):
                    # Process each interaction
                    processed_interaction = {
                        'id': interaction.get('id'),
                        'bait_uniprot': interaction.get('bait_uniprot'),
                        'bait_gene': interaction.get('bait_gene'),
                        'bait_complex': test_info.get('complex', ''),
                        'prey_uniprot': interaction.get('prey_uniprot'),
                        'prey_gene': interaction.get('prey_gene'),
                        'confidence': interaction.get('confidence'),
                        'iptm': interaction.get('iptm'),
                        'ipsae': interaction.get('ipsae'),
                        'ipsae_confidence': interaction.get('ipsae_confidence'),
                        'analysis_version': interaction.get('analysis_version'),
                        'validated': interaction.get('experimental_validation') is not None,
                        'query_uniprot': test_uniprot,
                        'query_gene': test_info.get('gene', ''),
                        'extraction_timestamp': datetime.now().isoformat()
                    }
                    interactions.append(processed_interaction)
                
                print(f"\nProcessed {len(interactions)} interactions:")
                print(f"{'='*60}")
                
                # Analyze the results
                v4_count = len([i for i in interactions if i.get('analysis_version') == 'v4'])
                v3_count = len([i for i in interactions if i.get('analysis_version') == 'v3'])
                high_conf = len([i for i in interactions if i.get('confidence') == 'High'])
                validated = len([i for i in interactions if i.get('validated')])
                
                print(f"Analysis version breakdown:")
                print(f"  v4 interactions: {v4_count}")
                print(f"  v3 interactions: {v3_count}")
                print(f"Confidence breakdown:")
                print(f"  High confidence: {high_conf}")
                print(f"  Validated: {validated}")
                
                print(f"\nSample interactions:")
                for i, interaction in enumerate(interactions[:5]):
                    print(f"  {i+1}. {interaction['prey_gene']} ({interaction['prey_uniprot']}) - "
                          f"Conf: {interaction['confidence']}, iPSAE: {interaction['ipsae']}, "
                          f"Version: {interaction['analysis_version']}")
                
                if len(interactions) > 5:
                    print(f"  ... and {len(interactions) - 5} more")
                
                # Save test results
                test_file = f"test_extraction_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                with open(test_file, 'w') as f:
                    json.dump(interactions, f, indent=2)
                print(f"\nSaved test results to: {test_file}")
                
                return True, len(interactions)
                
            else:
                print(f"✗ HTTP error: {response.getcode()}")
                return False, 0
                
    except Exception as e:
        print(f"✗ Error: {e}")
        return False, 0

if __name__ == "__main__":
    success, count = test_single_protein()
    if success:
        print(f"\n✓ Test passed! Found {count} interactions.")
        print("Ready to run full extraction.")
    else:
        print(f"\n✗ Test failed. Check API connection.")