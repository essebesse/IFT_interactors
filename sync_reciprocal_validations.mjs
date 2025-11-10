import { sql } from '@vercel/postgres';

async function syncReciprocals() {
  console.log('🔄 Syncing reciprocal validations...\n');

  // Find all interactions with validations
  const validated = await sql`
    SELECT
      i.id,
      b.gene_name as bait_gene,
      p.gene_name as prey_gene,
      b.uniprot_id as bait_uniprot,
      p.uniprot_id as prey_uniprot,
      i.experimental_validation
    FROM interactions i
    JOIN proteins b ON i.bait_protein_id = b.id
    JOIN proteins p ON i.prey_protein_id = p.id
    WHERE i.experimental_validation IS NOT NULL
    ORDER BY b.gene_name, p.gene_name
  `;

  console.log(`Found ${validated.rows.length} interactions with validation data\n`);

  let synced = 0;
  let merged = 0;
  let skipped = 0;

  // Process each validated interaction
  for (const interaction of validated.rows) {
    const { bait_uniprot, prey_uniprot, bait_gene, prey_gene, experimental_validation } = interaction;

    // Find the reciprocal interaction(s)
    const reciprocals = await sql`
      SELECT
        i.id,
        i.experimental_validation
      FROM interactions i
      JOIN proteins b ON i.bait_protein_id = b.id
      JOIN proteins p ON i.prey_protein_id = p.id
      WHERE b.uniprot_id = ${prey_uniprot}
        AND p.uniprot_id = ${bait_uniprot}
    `;

    if (reciprocals.rows.length === 0) {
      console.log(`⚠️  No reciprocal found for ${bait_gene}→${prey_gene}`);
      skipped++;
      continue;
    }

    const reciprocal = reciprocals.rows[0];

    // Merge validation data from both directions
    const methods1 = experimental_validation.experimental_methods || [];
    const methods2 = reciprocal.experimental_validation?.experimental_methods || [];

    // Combine and deduplicate by study + method
    const allMethods = [...methods1, ...methods2];
    const uniqueMethods = [];
    const seen = new Set();

    for (const method of allMethods) {
      const key = `${method.study}|${method.method}|${method.pmid || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMethods.push(method);
      }
    }

    // Check if we need to update
    const originalCount = reciprocal.experimental_validation?.experimental_methods?.length || 0;
    const newCount = uniqueMethods.length;

    if (originalCount === newCount) {
      // Already synced
      continue;
    }

    // Calculate validation summary
    const validationSummary = {
      is_validated: true,
      validation_count: uniqueMethods.length,
      strongest_method: uniqueMethods[0]?.method || 'Unknown',
      consensus_confidence: calculateConsensusConfidence(uniqueMethods)
    };

    const newValidation = {
      experimental_methods: uniqueMethods,
      validation_summary: validationSummary
    };

    // Update the reciprocal interaction
    await sql`
      UPDATE interactions
      SET experimental_validation = ${JSON.stringify(newValidation)}
      WHERE id = ${reciprocal.id}
    `;

    if (originalCount === 0) {
      console.log(`✅ SYNCED: ${prey_gene}→${bait_gene} (0 → ${newCount} validations)`);
      synced++;
    } else {
      console.log(`🔀 MERGED: ${prey_gene}→${bait_gene} (${originalCount} → ${newCount} validations)`);
      merged++;
    }

    // Also update the original interaction if it needs merging
    if (methods1.length < uniqueMethods.length) {
      await sql`
        UPDATE interactions
        SET experimental_validation = ${JSON.stringify(newValidation)}
        WHERE id = ${interaction.id}
      `;
      console.log(`   └─ Also updated ${bait_gene}→${prey_gene} (${methods1.length} → ${newCount})`);
    }
  }

  console.log('\n📊 Sync Summary:');
  console.log(`  Synced (0 → N): ${synced}`);
  console.log(`  Merged (N → M): ${merged}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Total updated: ${synced + merged}`);

  // Verify no mismatches remain
  const remaining = await sql`
    SELECT COUNT(*) as count
    FROM interactions i1
    JOIN interactions i2 ON
      i1.bait_protein_id = i2.prey_protein_id
      AND i1.prey_protein_id = i2.bait_protein_id
    WHERE (i1.experimental_validation IS NOT NULL AND i2.experimental_validation IS NULL)
       OR (i1.experimental_validation IS NULL AND i2.experimental_validation IS NOT NULL)
       OR (
         i1.experimental_validation IS NOT NULL
         AND i2.experimental_validation IS NOT NULL
         AND jsonb_array_length(i1.experimental_validation->'experimental_methods')
           != jsonb_array_length(i2.experimental_validation->'experimental_methods')
       )
  `;

  console.log(`\n🔍 Remaining mismatches: ${remaining.rows[0].count}`);

  if (remaining.rows[0].count === 0) {
    console.log('✅ All reciprocal validations are now synchronized!\n');
  } else {
    console.log('⚠️  Some mismatches remain. Re-run this script or check manually.\n');
  }

  process.exit(0);
}

function calculateConsensusConfidence(methods) {
  // Prioritize structural methods > biochemical > MS/proteomics
  const hasStructure = methods.some(m =>
    m.method.includes('Crystal structure') ||
    m.method.includes('Cryo-EM') ||
    m.method.includes('NMR')
  );
  const hasBiochemical = methods.some(m =>
    m.method.includes('reconstitution') ||
    m.method.includes('Pulldown') ||
    m.method.includes('Y2H')
  );
  const hasMS = methods.some(m => m.method.includes('MS'));

  if (hasStructure) return 'high';
  if (hasBiochemical && hasMS) return 'high';
  if (hasBiochemical || hasMS) return 'medium';
  return 'low';
}

syncReciprocals().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
