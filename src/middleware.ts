import { NextRequest, NextResponse } from 'next/server';

/**
 * SECURITY NOTE:
 * The ADMIN_API_TOKEN gate has been disabled per user request to allow 
 * direct API key management without a shared admin secret.
 * 
 * Authentication and authorization should be handled by a proper 
 * user/session system in the future for multi-tenant production use.
 */

export function middleware(_request: NextRequest) {
  // Authentication bypass: Allow all requests to proceed.
  // Individual API routes still perform their own validation (e.g., testing API key connectivity).
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
