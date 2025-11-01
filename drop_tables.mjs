import { sql } from '@vercel/postgres';

const POSTGRES_URL = process.env.POSTGRES_URL;

async function dropAllTables() {
  if (!POSTGRES_URL) {
    console.error('❌ POSTGRES_URL environment variable is not set.');
    process.exit(1);
  }

  console.log('🗑️  Dropping all tables in IFT database...\n');

  try {
    // Drop tables in reverse order of dependencies
    await sql`DROP TABLE IF EXISTS interactions CASCADE`;
    console.log('  ✅ Dropped "interactions" table');

    await sql`DROP TABLE IF EXISTS complex_interactions CASCADE`;
    console.log('  ✅ Dropped "complex_interactions" table (if exists)');

    await sql`DROP TABLE IF EXISTS protein_aliases CASCADE`;
    console.log('  ✅ Dropped "protein_aliases" table');

    await sql`DROP TABLE IF EXISTS proteins CASCADE`;
    console.log('  ✅ Dropped "proteins" table');

    await sql`DROP TABLE IF EXISTS complexes CASCADE`;
    console.log('  ✅ Dropped "complexes" table (if exists)');

    console.log('\n🎉 All tables dropped successfully!');
    console.log('Database is now clean and ready for fresh import.\n');

  } catch (error) {
    console.error('\n❌ Error dropping tables:', error);
    process.exit(1);
  }
}

dropAllTables();
