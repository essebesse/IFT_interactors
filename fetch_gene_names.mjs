import { sql } from '@vercel/postgres';

const BATCH_SIZE = 50;
const DELAY_MS = 100;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchUniProtData(uniprotIds) {
  console.log(`Fetching gene names for ${uniprotIds.length} proteins from UniProt...\n`);

  const geneData = new Map();

  for (let i = 0; i < uniprotIds.length; i += BATCH_SIZE) {
    const batch = uniprotIds.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i/BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(uniprotIds.length/BATCH_SIZE);

    console.log(`Processing batch ${batchNum}/${totalBatches}...`);

    try {
      const ids = batch.join(',');
      const url = `https://rest.uniprot.org/uniprotkb/accessions?accessions=${ids}&format=json&fields=accession,gene_names`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'IFT_InteractorsApp/1.0'
        }
      });

      if (!response.ok) {
        console.warn(`  ⚠️  UniProt API error: ${response.status} ${response.statusText}`);
        await sleep(DELAY_MS * 3);
        continue;
      }

      const data = await response.json();

      for (const entry of data.results || []) {
        const uniprotId = entry.primaryAccession;
        let geneName = null;
        const aliases = [];

        // Get primary gene name
        if (entry.genes && entry.genes.length > 0) {
          if (entry.genes[0].geneName && entry.genes[0].geneName.value) {
            geneName = entry.genes[0].geneName.value;
          }

          // Get synonyms for aliases table
          for (const gene of entry.genes) {
            if (gene.geneName && gene.geneName.value) {
              aliases.push({ name: gene.geneName.value, type: 'gene_name' });
            }
            if (gene.synonyms) {
              for (const synonym of gene.synonyms) {
                if (synonym.value) {
                  aliases.push({ name: synonym.value, type: 'gene_synonym' });
                }
              }
            }
          }
        }

        if (geneName || aliases.length > 0) {
          geneData.set(uniprotId, { geneName, aliases });
        }
      }

    } catch (error) {
      console.error(`  ❌ Error fetching batch ${batchNum}:`, error.message);
    }

    await sleep(DELAY_MS);
  }

  return geneData;
}

async function main() {
  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL environment variable is not set.');
    process.exit(1);
  }

  console.log('🧬 Fetching gene names for IFT/BBSome proteins\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // Get all proteins
    const proteinsResult = await sql`
      SELECT id, uniprot_id, gene_name
      FROM proteins
      ORDER BY uniprot_id
    `;

    console.log(`📊 Found ${proteinsResult.rows.length} proteins in database\n`);

    const proteins = proteinsResult.rows;
    const uniprotIds = proteins.map(p => p.uniprot_id);

    // Fetch gene data from UniProt
    const geneData = await fetchUniProtData(uniprotIds);

    console.log(`\n✅ Fetched data for ${geneData.size} proteins\n`);

    // Update proteins table with gene names
    console.log('📝 Updating gene_name column in proteins table...\n');

    let updatedCount = 0;
    for (const protein of proteins) {
      const data = geneData.get(protein.uniprot_id);
      if (data && data.geneName) {
        await sql`
          UPDATE proteins
          SET gene_name = ${data.geneName}
          WHERE id = ${protein.id}
        `;
        console.log(`  ✓ ${protein.uniprot_id} → ${data.geneName}`);
        updatedCount++;
      }
    }

    console.log(`\n✅ Updated ${updatedCount} gene names\n`);

    // Insert aliases into protein_aliases table
    console.log('📝 Inserting aliases into protein_aliases table...\n');

    let aliasCount = 0;
    for (const protein of proteins) {
      const data = geneData.get(protein.uniprot_id);
      if (data && data.aliases.length > 0) {
        for (const alias of data.aliases) {
          try {
            await sql`
              INSERT INTO protein_aliases (protein_id, alias_name, alias_type, source)
              VALUES (${protein.id}, ${alias.name}, ${alias.type}, 'uniprot')
              ON CONFLICT (protein_id, alias_name) DO NOTHING
            `;
            aliasCount++;
          } catch (e) {
            // Ignore conflicts
          }
        }
      }
    }

    console.log(`\n✅ Inserted ${aliasCount} aliases\n`);

    // Show summary
    const summary = await sql`
      SELECT
        COUNT(*) FILTER (WHERE gene_name IS NOT NULL) as with_gene_name,
        COUNT(*) FILTER (WHERE gene_name IS NULL) as without_gene_name
      FROM proteins
    `;

    console.log('=' .repeat(60));
    console.log('📊 Summary:');
    console.log(`  Proteins with gene names: ${summary.rows[0].with_gene_name}`);
    console.log(`  Proteins without gene names: ${summary.rows[0].without_gene_name}`);
    console.log(`  Total aliases: ${aliasCount}`);
    console.log('=' .repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  }
}

main();
