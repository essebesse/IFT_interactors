/**
 * API Route: Serve PAE Contact Data
 * ==================================
 *
 * Returns the PAE contact information for structure coloring.
 *
 * Usage: GET /api/structure/123/pae
 *
 * Data source: public/contacts_data/{id}.json
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const interactionId = resolvedParams.id;

    // Path to contact data file
    const contactPath = path.join(
      process.cwd(),
      'public',
      'contacts_data',
      `${interactionId}.json`
    );

    if (!fs.existsSync(contactPath)) {
      return NextResponse.json(
        {
          error: 'Contact data not found',
          id: interactionId,
          message: 'PAE contact data has not been generated for this interaction yet.'
        },
        { status: 404 }
      );
    }

    // Read and return contact data
    const contactData = await readFile(contactPath, 'utf8');
    const parsed = JSON.parse(contactData);

    return NextResponse.json(parsed, {
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
