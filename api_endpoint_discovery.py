#!/usr/bin/env python3
"""
API Endpoint Discovery Script for ciliaaf3predictions.vercel.app
Run this first to figure out how to query the database
"""

import requests
import json
from typing import Dict, List

def test_api_endpoints():
    """Test various possible API endpoint patterns"""
    
    base_url = "https://ciliaaf3predictions.vercel.app"
    test_protein = "Q8NEZ3"  # IFT144/WDR19 - a known IFT protein
    
    print("="*60)
    print(f"Testing API endpoints for {base_url}")
    print(f"Using test protein: {test_protein} (IFT144/WDR19)")
    print("="*60 + "\n")
    
    # Common API patterns to try
    endpoints = [
        # Direct protein queries
        f"{base_url}/api/protein/{test_protein}",
        f"{base_url}/api/proteins/{test_protein}",
        f"{base_url}/api/interaction/{test_protein}",
        f"{base_url}/api/interactions/{test_protein}",
        
        # Search endpoints
        f"{base_url}/api/search?query={test_protein}",
        f"{base_url}/api/search?q={test_protein}",
        f"{base_url}/api/search?uniprot={test_protein}",
        f"{base_url}/api/search?protein={test_protein}",
        
        # Version-specific endpoints
        f"{base_url}/api/v4/protein/{test_protein}",
        f"{base_url}/api/v4/interactions/{test_protein}",
        f"{base_url}/api/protein/{test_protein}?version=v4",
        
        # Data file endpoints
        f"{base_url}/data/{test_protein}.json",
        f"{base_url}/data/proteins/{test_protein}.json",
        f"{base_url}/data/interactions/{test_protein}.json",
        
        # GraphQL endpoint
        f"{base_url}/graphql",
        f"{base_url}/api/graphql",
        
        # Other common patterns
        f"{base_url}/api/bait/{test_protein}",
        f"{base_url}/api/network/{test_protein}",
        f"{base_url}/api/get-interactions?bait={test_protein}",
    ]
    
    working_endpoints = []
    
    for endpoint in endpoints:
        try:
            print(f"Testing: {endpoint}")
            
            # Special handling for GraphQL
            if "graphql" in endpoint:
                # Try a simple GraphQL query
                query = {
                    "query": f"""
                    {{
                        protein(uniprot: "{test_protein}") {{
                            interactions {{
                                prey
                                confidence
                            }}
                        }}
                    }}
                    """
                }
                response = requests.post(endpoint, json=query, timeout=5)
            else:
                response = requests.get(endpoint, timeout=5)
            
            print(f"  Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"  ✓ SUCCESS! Got JSON response")
                    print(f"  Response keys: {list(data.keys())[:5]}...")  # Show first 5 keys
                    
                    # Try to understand the structure
                    if isinstance(data, dict):
                        for key in ['results', 'data', 'interactions', 'proteins', 'items']:
                            if key in data:
                                print(f"  Found '{key}' field with {len(data[key])} items")
                    
                    working_endpoints.append(endpoint)
                    
                    # Save a sample response for analysis
                    with open(f'sample_response_{len(working_endpoints)}.json', 'w') as f:
                        json.dump(data, f, indent=2)
                    print(f"  Saved sample response to sample_response_{len(working_endpoints)}.json")
                    
                except json.JSONDecodeError:
                    print(f"  Response is not JSON")
            
            elif response.status_code == 404:
                print(f"  Not found (404)")
            elif response.status_code == 405:
                print(f"  Method not allowed (405)")
            elif response.status_code == 500:
                print(f"  Server error (500)")
            else:
                print(f"  Other status: {response.status_code}")
                
        except requests.Timeout:
            print(f"  Timeout (no response after 5 seconds)")
        except requests.ConnectionError:
            print(f"  Connection error")
        except Exception as e:
            print(f"  Error: {str(e)[:50]}")
        
        print()  # Empty line between tests
    
    print("="*60)
    print(f"Summary: Found {len(working_endpoints)} working endpoints:")
    for ep in working_endpoints:
        print(f"  ✓ {ep}")
    print("="*60)
    
    if working_endpoints:
        print("\nNext steps:")
        print("1. Check the saved sample_response_*.json files")
        print("2. Identify which has the interaction data you need")
        print("3. Update the ift_protein_extractor.py with the correct endpoint")
    else:
        print("\nNo working endpoints found. Possible reasons:")
        print("1. The API might require authentication")
        print("2. The API might use different URL patterns")
        print("3. The site might load data differently (check browser DevTools)")
        print("\nTry:")
        print("1. Open the site in a browser")
        print("2. Open Developer Tools (F12)")
        print("3. Go to Network tab")
        print("4. Search for 'Q8NEZ3'")
        print("5. Look for XHR/Fetch requests that return data")

if __name__ == "__main__":
    test_api_endpoints()
