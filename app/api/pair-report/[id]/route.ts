/**
 * API Route: Serve LLM Pair Reports
 * ==================================
 *
 * Returns the markdown pair report for a given interaction ID.
 * Looks up bait/prey UniProt IDs from the database, then fetches
 * the corresponding report from Vercel Blob storage.
 *
 * Usage: GET /api/pair-report/123
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

const BLOB_BASE_URL = 'https://rechesvudwvwhwta.public.blob.vercel-storage.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const interactionId = resolvedParams.id;

    // Look up bait and prey UniProt IDs
    const result = await sql`
      SELECT bait.uniprot_id AS bait_uniprot, prey.uniprot_id AS prey_uniprot
      FROM interactions i
      JOIN proteins bait ON i.bait_protein_id = bait.id
      JOIN proteins prey ON i.prey_protein_id = prey.id
      WHERE i.id = ${interactionId}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Interaction not found', id: interactionId },
        { status: 404 }
      );
    }

    const { bait_uniprot, prey_uniprot } = result.rows[0];

    // Try bait_prey order first, then prey_bait
    const filename1 = `${bait_uniprot.toUpperCase()}_${prey_uniprot.toUpperCase()}.md`;
    const filename2 = `${prey_uniprot.toUpperCase()}_${bait_uniprot.toUpperCase()}.md`;

    let markdown: string | null = null;

    for (const filename of [filename1, filename2]) {
      const blobUrl = `${BLOB_BASE_URL}/pair_reports/${filename}`;
      const response = await fetch(blobUrl);
      if (response.ok) {
        markdown = await response.text();
        break;
      }
    }

    if (!markdown) {
      return NextResponse.json(
        {
          error: 'Report not found',
          id: interactionId,
          tried: [filename1, filename2]
        },
        { status: 404 }
      );
    }

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=86400'
      }
    });

  } catch (error) {
    console.error('Error serving pair report:', error);
    return NextResponse.json(
      {
        error: 'Failed to load report',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
