import { NextResponse } from 'next/server';

// This endpoint is not used in the IFT Interactors project
// IFT project uses simple bait-prey interactions only
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    { error: 'Not implemented - IFT project does not use protein complexes' },
    { status: 404 }
  );
}
