/**
 * API Route: Serve CIF Structure Files
 * =====================================
 *
 * Returns the CIF file for a given interaction ID.
 *
 * Usage: GET /api/structure/123
 *
 * Data source: Vercel Blob Storage with UniProt-based naming
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

// Vercel Blob base URL
const BLOB_BASE_URL = 'https://rechesvudwvwhwta.public.blob.vercel-storage.com';

interface CifManifestEntry {
  id: number;
  interaction_directory: string;
  bait_uniprot: string;
  prey_uniprot: string;
  bait_gene: string;
  prey_gene: string;
}

interface CifManifest {
  entries: Record<string, CifManifestEntry>;
}

// Load manifest once (cached)
let manifest: CifManifest | null = null;

async function loadManifest(): Promise<CifManifest> {
  if (manifest) return manifest;

  const manifestPath = path.join(process.cwd(), 'cif_manifest.json');

  if (!fs.existsSync(manifestPath)) {
    throw new Error('CIF manifest not found');
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
    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get('download') === 'true';

    // Load manifest to get interaction directory name
    const manifest = await loadManifest();
    const entry = manifest.entries[interactionId];

    if (!entry) {
      return NextResponse.json(
        { error: 'Interaction not found', id: interactionId },
        { status: 404 }
      );
    }

    // Construct Blob URL using interaction_directory (UniProt IDs)
    // e.g., structures/a0avf1_and_q9nqc8.cif
    const blobUrl = `${BLOB_BASE_URL}/structures/${entry.interaction_directory}.cif`;

    // Fetch from Vercel Blob
    const response = await fetch(blobUrl);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'CIF file not found in Blob storage',
          id: interactionId,
          filename: `${entry.interaction_directory}.cif`,
          url: blobUrl
        },
        { status: 404 }
      );
    }

    // Get the CIF content
    const cifContent = await response.text();

    return new NextResponse(cifContent, {
      status: 200,
      headers: {
        'Content-Type': 'chemical/x-cif',
        'Content-Disposition': isDownload
          ? `attachment; filename="${entry.bait_gene}_${entry.prey_gene}.cif"`
          : `inline; filename="${entry.interaction_directory}.cif"`,
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
