# IFT Extractor Setup Guide

## ⚠️ Current Status
The script is a **template** - it has all IFT proteins listed but needs to be connected to your actual database API.

## 🔧 What Needs to be Modified

### 1. Find Your Database API Endpoints
First, inspect your website to find the actual API endpoints:
1. Open https://ciliaaf3predictions.vercel.app/ in Chrome/Firefox
2. Open Developer Tools (F12)
3. Go to Network tab
4. Search for a protein (e.g., Q8NEZ3)
5. Look for the API calls being made

### 2. Modify the query_protein Function

Replace this section in `ift_protein_extractor.py` (lines 130-155):

```python
def query_protein(self, uniprot_id: str, protein_info: Dict) -> List[Dict]:
    """
    Query a single protein and get all its interactions
    """
    logging.info(f"Querying {uniprot_id} ({protein_info.get('gene', 'Unknown')})")
    
    # REPLACE THIS WITH YOUR ACTUAL API ENDPOINT
    # Example possibilities based on common patterns:
    
    # Option 1: Direct UniProt query
    api_url = f"{self.base_url}/api/interactions/{uniprot_id}"
    
    # Option 2: Search endpoint
    # api_url = f"{self.base_url}/api/search"
    # params = {"query": uniprot_id, "version": "v4"}
    
    # Option 3: GraphQL endpoint
    # api_url = f"{self.base_url}/graphql"
    # query = {"query": f"{{interactions(bait: \"{uniprot_id}\", version: \"v4\") {{...}}}}"}
    
    try:
        # Make the actual API call
        response = self.session.get(api_url)
        response.raise_for_status()
        data = response.json()
        
        # Parse the response - adjust based on actual structure
        interactions = []
        for interaction in data.get('results', []):
            interactions.append({
                'bait_uniprot': uniprot_id,
                'prey_uniprot': interaction.get('prey'),
                'prey_gene': interaction.get('prey_gene', ''),
                'confidence': interaction.get('confidence', 0),
                'iptm': interaction.get('iPTM', None),
                'ipae_3a': interaction.get('iPAE <3Å', None),
                'ipae_6a': interaction.get('iPAE <6Å', None),
                'iplddt': interaction.get('ipLDDT', None),
                'alphafold': interaction.get('AlphaFold', False),
                'experimental': interaction.get('Experimental', False),
                'version': 'v4'
            })
        
        self.processed_proteins.add(uniprot_id)
        time.sleep(0.5)  # Rate limiting
        
        return interactions
        
    except Exception as e:
        logging.error(f"Error querying {uniprot_id}: {e}")
        return []
```

## 🔍 How to Find the Right API Structure

### Method 1: Browser Network Inspector
```javascript
// In browser console while on the website:
// 1. Search for a protein
// 2. Look at Network tab for requests
// 3. Find requests that return interaction data
// 4. Note the URL pattern and response format
```

### Method 2: Check the Website Source
Look for API configuration in the website's JavaScript:
- Check for files like `api.js`, `config.js`, or `services.js`
- Look for fetch() or axios calls
- Check environment variables or constants

### Method 3: Common Patterns to Try
```python
# Try these URL patterns:
patterns = [
    f"/api/protein/{uniprot_id}",
    f"/api/interactions?bait={uniprot_id}",
    f"/api/v4/protein/{uniprot_id}",
    f"/api/search?q={uniprot_id}&version=v4",
    f"/data/{uniprot_id}.json"
]
```

## 📝 Quick Test Script
Before running the full extraction, test with one protein:

```python
import requests

# Test with IFT144
test_uniprot = "Q8NEZ3"
base_url = "https://ciliaaf3predictions.vercel.app"

# Try different endpoint patterns
endpoints = [
    f"{base_url}/api/protein/{test_uniprot}",
    f"{base_url}/api/interactions/{test_uniprot}",
    f"{base_url}/api/search?query={test_uniprot}"
]

for endpoint in endpoints:
    try:
        response = requests.get(endpoint)
        print(f"\nTrying: {endpoint}")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("SUCCESS! This endpoint works")
            print(f"Response sample: {str(response.json())[:200]}...")
            break
    except Exception as e:
        print(f"Failed: {e}")
```

## 🚀 Once Connected

After you've found the correct API endpoint and modified the script:

1. **Test with one protein first:**
   ```bash
   python ift_protein_extractor.py
   # Modify main() to only query one protein initially
   ```

2. **Check the output:**
   - Verify you're getting interaction data
   - Confirm v4 analysis data is included
   - Check all fields are populated

3. **Run full extraction:**
   - The script will query all ~90 proteins
   - Will save results as JSON and CSV
   - Includes logging for troubleshooting

## ⚠️ Important Notes

- **Rate Limiting**: The script includes 0.5 second delays between requests
- **Error Handling**: Failed queries are logged but don't stop the extraction
- **Memory**: With ~90 proteins, expect potentially thousands of interactions
- **Time**: Full extraction may take 5-10 minutes depending on response times

## 💡 Alternative: Direct Database Access

If you have direct database access (PostgreSQL, MySQL, etc.), you could query directly:

```sql
-- Example SQL query
SELECT b.uniprot_id as bait, p.uniprot_id as prey, 
       confidence, iptm, ipae_3a, ipae_6a, iplddt
FROM interactions i
JOIN proteins b ON i.bait_id = b.id
JOIN proteins p ON i.prey_id = p.id
WHERE b.uniprot_id IN ('Q8NEZ3', 'Q96RY7', ...) -- all IFT proteins
  AND i.version = 'v4';
```

## Need Help?

If you can share:
1. A sample API response from your website
2. The network requests you see in browser DevTools
3. Any API documentation

I can provide more specific modifications to the script!
