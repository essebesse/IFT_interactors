# Protoview - Protein Interaction Visualization

**Updated**: Wed Oct 1 2025

## Quick Links

- ****Live Website**: https://ciliaaf3predictions.vercel.app/
- ****Full Documentation**: [CLAUDE.md](CLAUDE.md)
- **Incremental Import** (RECOMMENDED): [INCREMENTAL_IMPORT_WORKFLOW.md](INCREMENTAL_IMPORT_WORKFLOW.md)
- ****Legacy Full Import**: [IMPORT_WORKFLOW.md](IMPORT_WORKFLOW.md)
- ****Recent Fixes**: [SESSION_FIXES.md](SESSION_FIXES.md)

## Overview

Next.js web application for exploring protein-protein interaction data from AlphaFold predictions (AF2 + AF3). Features interactive network visualization, comprehensive search, and structural quality metrics.

## Quick Start

### Import New AF3 Data (Incremental - RECOMMENDED)

```bash
# Set database connection
export POSTGRES_URL="postgresql://neondb_owner:npg_q2HCPRojzJ0i@ep-falling-shadow-agzy57k0-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Run complete incremental workflow (fast, safe, preserves existing data)
node db/import_af3_json.mjs /path/to/AF3_PD_analysis_v3.json
node db/incremental_organism_lookup.mjs  # ** Only processes Unknown proteins
node db/fetch_aliases.mjs
node -e "const { sql } = require('@vercel/postgres'); (async () => { const result = await sql\`UPDATE proteins p SET gene_name = pa.alias_name FROM protein_aliases pa WHERE p.id = pa.protein_id AND pa.alias_type = 'gene_name' AND p.gene_name IS NULL\`; console.log(\`Updated \${result.rowCount} proteins\`); })();"
node db/check_db.mjs
```

See [INCREMENTAL_IMPORT_WORKFLOW.md](INCREMENTAL_IMPORT_WORKFLOW.md) for detailed instructions.

### Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linting
npx tsc --noEmit     # Type checking
```

## Database

- **PostgreSQL** hosted on Neon
- **1,339 proteins** across multiple organisms
- **2,267 interactions** (AF2 + AF3)
- **7,597 protein aliases** for comprehensive search

## Key Features

- **Search by UniProt ID, gene name, or protein alias
- **Interactive force-directed network graph
- **Confidence level filtering (AF3 + AF2 by iPTM)
- **Structural quality metrics (iPAE, ipLDDT)
- **Smart result sorting (confidence → iPAE contacts → iPTM)
- **Organism codes (Hs:, Cr:, Mm:, etc.)
- **Cross-species protein lookup
- **ChlamyFP integration with human homolog fallback
- **Direct links to UniProt and ChlamyFP databases

## Important Notes

**Use incremental workflow for new data** - Fast, safe, preserves existing assignments
**All 5 import steps are CRITICAL** - See workflow for details
****Changes are immediate** - Database updates go live instantly
****Hard refresh browser** - Ctrl+Shift+R after database changes

## Documentation

- **CLAUDE.md** - Complete project documentation and architecture
- **IMPORT_WORKFLOW.md** - Step-by-step import guide with troubleshooting
- **SESSION_FIXES.md** - Recent fixes and solutions for common issues

## Support

For issues or questions, see the troubleshooting section in [CLAUDE.md](CLAUDE.md) or [IMPORT_WORKFLOW.md](IMPORT_WORKFLOW.md).
