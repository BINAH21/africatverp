import { NextRequest, NextResponse } from 'next/server';
import { generateOAuthUrl, generateState } from '@/lib/oauth';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider;

  // Validate provider
  const validProviders = ['google', 'facebook', 'instagram', 'linkedin'];
  if (!validProviders.includes(provider)) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('Invalid OAuth provider')}`, request.url)
    );
  }

  try {
    // Check if OAuth is configured
    const clientId = process.env[`NEXT_PUBLIC_${provider.toUpperCase()}_CLIENT_ID`] || 
                     process.env[`NEXT_PUBLIC_${provider === 'facebook' ? 'FACEBOOK_APP_ID' : provider.toUpperCase() + '_CLIENT_ID'}`];
    
    if (!clientId || clientId === '') {
      // Redirect back with helpful error message
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(`${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth is not configured. Please set up credentials in .env.local file.`)}`,
          request.url
        )
      );
    }

    // Generate state for CSRF protection
    const state = generateState();
    
    // Store state in cookie (httpOnly for security)
    const cookieStore = await cookies();
    cookieStore.set(`oauth_state_${provider}`, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    // Generate OAuth URL
    const authUrl = generateOAuthUrl(provider, state);

    // Redirect to OAuth provider
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('OAuth initiation error:', error);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error.message || 'Failed to initiate OAuth flow')}`,
        request.url
      )
    );
  }
}

