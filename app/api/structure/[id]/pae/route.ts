/**
 * API Route: Serve PAE Contact Data
 * ==================================
 *
 * Returns the PAE contact information for structure coloring.
 *
 * Usage: GET /api/structure/123/pae
 *
 * Data source: Vercel Blob Storage (pae_contacts/{id}.json)
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Vercel Blob base URL (same as CIF route)
const BLOB_BASE_URL = 'https://rechesvudwvwhwta.public.blob.vercel-storage.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const interactionId = resolvedParams.id;

    // Construct Blob URL for PAE contact data
    const blobUrl = `${BLOB_BASE_URL}/pae_contacts/${interactionId}.json`;

    // Fetch from Vercel Blob
    const response = await fetch(blobUrl);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Contact data not found',
          id: interactionId,
          message: 'PAE contact data has not been generated for this interaction yet.',
          url: blobUrl
        },
        { status: 404 }
      );
    }

    // Parse and return the JSON data
    const contactData = await response.json();

    return NextResponse.json(contactData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });

  } catch (error) {
    console.error('Error serving PAE contact data:', error);

    return NextResponse.json(
      {
        error: 'Failed to load contact data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
