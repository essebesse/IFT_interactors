/**
 * API Route: Serve CIF Structure Files
 * =====================================
 *
 * Returns the CIF file for a given interaction ID.
 *
 * Usage: GET /api/structure/123
 *
 * Data source: Vercel Blob Storage
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

// Vercel Blob base URL (auto-detected from uploaded files)
const BLOB_BASE_URL = 'https://rechesvudwvwhwta.public.blob.vercel-storage.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const interactionId = params.id;

    // Construct Blob URL
    const blobUrl = `${BLOB_BASE_URL}/structures/${interactionId}.cif`;

    // Fetch from Vercel Blob
    const response = await fetch(blobUrl);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'CIF file not found in Blob storage',
          id: interactionId,
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
        'Content-Disposition': `inline; filename="interaction_${interactionId}.cif"`,
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
