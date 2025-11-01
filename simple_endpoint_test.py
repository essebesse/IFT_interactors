#!/usr/bin/env python3
"""
Simple API endpoint discovery using only standard library
"""

import urllib.request
import urllib.parse
import urllib.error
import json
import time

def test_endpoint(url, timeout=10):
    """Test a single endpoint and return response info"""
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            status = response.getcode()
            if status == 200:
                data = response.read().decode('utf-8')
                try:
                    json_data = json.loads(data)
                    return True, status, json_data
                except json.JSONDecodeError:
                    return True, status, data[:200] + "..." if len(data) > 200 else data
            else:
                return False, status, None
    except urllib.error.HTTPError as e:
        return False, e.code, str(e)
    except urllib.error.URLError as e:
        return False, None, str(e)
    except Exception as e:
        return False, None, str(e)

def discover_api_endpoints():
    """Test various API endpoint patterns"""
    
    base_url = "https://ciliaaf3predictions.vercel.app"
    test_protein = "Q8NEZ3"  # IFT144/WDR19
    
    print("="*60)
    print(f"Testing API endpoints for {base_url}")
    print(f"Using test protein: {test_protein} (IFT144/WDR19)")
    print("="*60 + "\n")
    
    # Common API patterns to try
    endpoints = [
        f"{base_url}/api/protein/{test_protein}",
        f"{base_url}/api/proteins/{test_protein}",
        f"{base_url}/api/interaction/{test_protein}",
        f"{base_url}/api/interactions/{test_protein}",
        f"{base_url}/api/search?query={test_protein}",
        f"{base_url}/api/search?q={test_protein}",
        f"{base_url}/api/search?uniprot={test_protein}",
        f"{base_url}/api/search?protein={test_protein}",
        f"{base_url}/api/v4/protein/{test_protein}",
        f"{base_url}/api/v4/interactions/{test_protein}",
        f"{base_url}/api/protein/{test_protein}?version=v4",
        f"{base_url}/data/{test_protein}.json",
        f"{base_url}/data/proteins/{test_protein}.json",
        f"{base_url}/data/interactions/{test_protein}.json",
        f"{base_url}/api/bait/{test_protein}",
        f"{base_url}/api/network/{test_protein}",
        f"{base_url}/api/get-interactions?bait={test_protein}",
    ]
    
    working_endpoints = []
    
    for i, endpoint in enumerate(endpoints):
        print(f"Testing {i+1}/{len(endpoints)}: {endpoint}")
        
        success, status, data = test_endpoint(endpoint)
        
        if success and status == 200:
            print(f"  ✓ SUCCESS! Status: {status}")
            if isinstance(data, dict):
                print(f"  Response keys: {list(data.keys())[:5]}")
                if 'results' in data:
                    print(f"  Found 'results' with {len(data['results'])} items")
                elif 'data' in data:
                    print(f"  Found 'data' with {len(data['data'])} items")
                elif 'interactions' in data:
                    print(f"  Found 'interactions' with {len(data['interactions'])} items")
            else:
                print(f"  Response preview: {str(data)[:100]}...")
                
            working_endpoints.append(endpoint)
            
            # Save sample response
            filename = f'sample_response_{len(working_endpoints)}.json'
            try:
                with open(filename, 'w') as f:
                    if isinstance(data, dict):
                        json.dump(data, f, indent=2)
                    else:
                        f.write(str(data))
                print(f"  Saved sample to {filename}")
            except Exception as e:
                print(f"  Could not save response: {e}")
        else:
            if status:
                print(f"  Status: {status}")
            else:
                print(f"  Error: {data}")
        
        print()  # Empty line
        time.sleep(1)  # Rate limiting
    
    print("="*60)
    print(f"Summary: Found {len(working_endpoints)} working endpoints:")
    for ep in working_endpoints:
        print(f"  ✓ {ep}")
    print("="*60)
    
    return working_endpoints

if __name__ == "__main__":
    working_endpoints = discover_api_endpoints()
    
    if not working_endpoints:
        print("\nNo working API endpoints found.")
        print("Next steps:")
        print("1. Check the website in a browser")
        print("2. Use browser DevTools to monitor network requests")
        print("3. Look for API calls when searching for proteins")