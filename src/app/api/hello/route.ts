// Test API route for Vercel functions
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'AI Cultural Time Machine API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}

export const runtime = 'edge';