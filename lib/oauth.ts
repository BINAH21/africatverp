// OAuth configuration and utilities

export interface OAuthProvider {
  id: string;
  name: string;
  authUrl: string;
  tokenUrl: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

// Get base URL for redirect URIs
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

// Get OAuth provider configuration
export function getOAuthProvider(provider: string): OAuthProvider {
  const baseUrl = getBaseUrl();
  
  const providers: Record<string, OAuthProvider> = {
    google: {
      id: 'google',
      name: 'Google',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      redirectUri: `${baseUrl}/api/auth/callback/google`,
      scopes: [
        'openid',
        'profile',
        'email',
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    },
    facebook: {
      id: 'facebook',
      name: 'Facebook',
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      clientId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
      redirectUri: `${baseUrl}/api/auth/callback/facebook`,
      scopes: ['email', 'public_profile'],
    },
    instagram: {
      id: 'instagram',
      name: 'Instagram',
      authUrl: 'https://api.instagram.com/oauth/authorize',
      tokenUrl: 'https://api.instagram.com/oauth/access_token',
      clientId: process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID || '',
      redirectUri: `${baseUrl}/api/auth/callback/instagram`,
      scopes: ['user_profile', 'user_media'],
    },
    linkedin: {
      id: 'linkedin',
      name: 'LinkedIn',
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
      clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || '',
      redirectUri: `${baseUrl}/api/auth/callback/linkedin`,
      scopes: ['openid', 'profile', 'email'],
    },
  };

  return providers[provider] || providers.google;
}

// OAuth Provider Configurations (for backward compatibility)
export const oauthProviders: Record<string, OAuthProvider> = {
  get google() { return getOAuthProvider('google'); },
  get facebook() { return getOAuthProvider('facebook'); },
  get instagram() { return getOAuthProvider('instagram'); },
  get linkedin() { return getOAuthProvider('linkedin'); },
};

// Generate OAuth authorization URL
export function generateOAuthUrl(provider: string, state: string): string {
  const config = getOAuthProvider(provider);
  
  if (!config) {
    throw new Error(`Unknown OAuth provider: ${provider}`);
  }

  // Check if client ID is configured
  if (!config.clientId || config.clientId === '' || config.clientId.includes('your_')) {
    throw new Error(`OAuth not configured for ${provider}. Please set up credentials in .env.local file. See OAUTH_SETUP.md for instructions.`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state: state,
  });

  // Add provider-specific parameters
  if (provider === 'google') {
    // Google OAuth 2.0 best practices
    params.append('access_type', 'offline'); // Get refresh token
    params.append('prompt', 'select_account consent'); // Show account picker and force consent
    params.append('include_granted_scopes', 'true'); // Incremental authorization
  } else if (provider === 'facebook') {
    // Facebook uses response_type in the base params
  } else if (provider === 'linkedin') {
    // LinkedIn uses response_type in the base params
  } else if (provider === 'instagram') {
    // Instagram specific params
  }

  return `${config.authUrl}?${params.toString()}`;
}

// Generate random state for OAuth
export function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(
  provider: string,
  code: string
): Promise<{ access_token: string; refresh_token?: string; expires_in?: number }> {
  const config = getOAuthProvider(provider);
  if (!config) {
    throw new Error(`Unknown OAuth provider: ${provider}`);
  }

  // Get client secret based on provider
  let clientSecret = '';
  if (provider === 'facebook') {
    clientSecret = process.env.FACEBOOK_CLIENT_SECRET || '';
  } else if (provider === 'instagram') {
    clientSecret = process.env.INSTAGRAM_CLIENT_SECRET || '';
  } else {
    clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`] || '';
  }

  if (!clientSecret) {
    throw new Error(`Client secret not configured for ${provider}`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: clientSecret,
    code: code,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return await response.json();
}

// Get user info from OAuth provider
export async function getUserInfo(provider: string, accessToken: string): Promise<any> {
  const userInfoUrls: Record<string, { url: string; method: 'GET' | 'POST'; headers?: Record<string, string> }> = {
    google: {
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    facebook: {
      url: `https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${accessToken}`,
      method: 'GET',
    },
    instagram: {
      url: `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`,
      method: 'GET',
    },
    linkedin: {
      url: 'https://api.linkedin.com/v2/userinfo',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  };

  const config = userInfoUrls[provider];
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const response = await fetch(config.url, {
    method: config.method,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch user info: ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

