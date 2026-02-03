import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getUserInfo } from '@/lib/oauth';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider;
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}&provider=${provider}`, request.url)
    );
  }

  // Validate required parameters
  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/login?error=missing_parameters', request.url)
    );
  }

  try {
    // Verify state (CSRF protection)
    const cookieStore = await cookies();
    const storedState = cookieStore.get(`oauth_state_${provider}`)?.value;

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL('/login?error=invalid_state', request.url)
      );
    }

    // Clear state cookie
    cookieStore.delete(`oauth_state_${provider}`);

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(provider, code);

    // Get user info from provider
    const userInfo = await getUserInfo(provider, tokenData.access_token);

    // Transform user info to our format
    let userData: any = {};
    
    switch (provider) {
      case 'google':
        userData = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          provider: 'google',
        };
        break;
      case 'facebook':
        userData = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture?.data?.url,
          provider: 'facebook',
        };
        break;
      case 'instagram':
        userData = {
          id: userInfo.id,
          username: userInfo.username,
          provider: 'instagram',
        };
        break;
      case 'linkedin':
        userData = {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          provider: 'linkedin',
        };
        break;
    }

    // Store OAuth data in session cookie
    const sessionData = {
      user: userData,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: tokenData.expires_in
        ? Date.now() + tokenData.expires_in * 1000
        : null,
      provider,
    };

    cookieStore.set('oauth_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Redirect to dashboard or account linking page
    return NextResponse.redirect(
      new URL('/auth/link-account', request.url)
    );
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error.message || 'oauth_failed')}`,
        request.url
      )
    );
  }
}

