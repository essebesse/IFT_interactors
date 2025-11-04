/**
 * API Route: Serve CIF Structure Files
 * =====================================
 *
 * Returns the CIF file for a given interaction ID.
 *
 * Usage: GET /api/structure/123
 *
 * Data source: Local files from cif_manifest.json (for now)
 * Future: Can be switched to Vercel Blob storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

interface CifManifestEntry {
  id: number;
  bait_uniprot: string;
  bait_gene: string;
  prey_uniprot: string;
  prey_gene: string;
  ipsae: number;
  cif_path: string;
  confidences_path: string;
  interaction_directory: string;
  status: string;
}

interface CifManifest {
  generated_at: string;
  total: number;
  found: number;
  not_found: number;
  errors: number;
  entries: Record<string, CifManifestEntry>;
}

// Load manifest once (cached in module scope)
let manifest: CifManifest | null = null;

async function loadManifest(): Promise<CifManifest> {
  if (manifest) return manifest;

  const manifestPath = path.join(process.cwd(), 'cif_manifest.json');

  if (!fs.existsSync(manifestPath)) {
    throw new Error('CIF manifest not found. Run scripts/collect_cif_paths.mjs first.');
  }

  const data = await readFile(manifestPath, 'utf8');
  manifest = JSON.parse(data);
  return manifest;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const interactionId = params.id;

    // Load manifest
    const manifest = await loadManifest();

    // Find entry
    const entry = manifest.entries[interactionId];

    if (!entry) {
      return NextResponse.json(
        { error: 'Interaction not found', id: interactionId },
        { status: 404 }
      );
    }

    if (!entry.cif_path || !fs.existsSync(entry.cif_path)) {
      return NextResponse.json(
        {
          error: 'CIF file not found',
          id: interactionId,
          expected_path: entry.cif_path
        },
        { status: 404 }
      );
    }

    // Read and return CIF file
    const cifContent = await readFile(entry.cif_path, 'utf8');

    return new NextResponse(cifContent, {
      status: 200,
      headers: {
        'Content-Type': 'chemical/x-cif',
        'Content-Disposition': `inline; filename="${entry.interaction_directory}.cif"`,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });

  } catch (error) {
    console.error('Error serving CIF file:', error);

    return NextResponse.json(
      {
        error: 'Failed to load structure',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
