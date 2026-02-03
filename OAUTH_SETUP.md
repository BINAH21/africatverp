# OAuth Setup Guide

This guide will help you set up OAuth authentication for Google, Facebook, Instagram, and LinkedIn.

## Overview

The system uses OAuth 2.0 to allow users to link their social media accounts. When users click a social media icon, they are redirected to the provider's authentication page, where they can authorize the application to access their account information.

## Setup Instructions

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to **APIs & Services** > **Credentials**
5. Click **Create Credentials** > **OAuth client ID**
6. Choose **Web application**
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
8. Copy the **Client ID** and **Client Secret**
9. Add to `.env`:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

### 2. Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add **Facebook Login** product
4. Go to **Settings** > **Basic**
5. Add **App Domains** and **Website** URL
6. Go to **Facebook Login** > **Settings**
7. Add valid OAuth redirect URIs:
   - `http://localhost:3000/api/auth/callback/facebook`
   - `https://yourdomain.com/api/auth/callback/facebook`
8. Copy the **App ID** and **App Secret**
9. Add to `.env`:
   ```
   NEXT_PUBLIC_FACEBOOK_APP_ID=your_app_id_here
   FACEBOOK_CLIENT_SECRET=your_app_secret_here
   ```

### 3. Instagram OAuth Setup

Instagram OAuth is managed through Facebook:

1. In your Facebook App, go to **Products** > **Instagram**
2. Add **Instagram Basic Display** product
3. Configure OAuth redirect URIs:
   - `http://localhost:3000/api/auth/callback/instagram`
   - `https://yourdomain.com/api/auth/callback/instagram`
4. Use the same App ID and App Secret as Facebook
5. Add to `.env`:
   ```
   NEXT_PUBLIC_INSTAGRAM_CLIENT_ID=your_instagram_client_id_here
   INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret_here
   ```

### 4. LinkedIn OAuth Setup

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. In **Auth** tab, add redirect URLs:
   - `http://localhost:3000/api/auth/callback/linkedin`
   - `https://yourdomain.com/api/auth/callback/linkedin`
4. Request access to: `openid`, `profile`, `email`
5. Copy the **Client ID** and **Client Secret**
6. Add to `.env`:
   ```
   NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_client_id_here
   LINKEDIN_CLIENT_SECRET=your_client_secret_here
   ```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret

# Instagram OAuth
NEXT_PUBLIC_INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# LinkedIn OAuth
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

**Important:** 
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Variables without the prefix are server-side only (more secure)
- Never commit `.env.local` to version control

## How It Works

1. **User clicks social media icon** → Redirects to `/api/auth/oauth/[provider]`
2. **OAuth initiation** → Generates state token and redirects to provider's login page
3. **User authorizes** → Provider redirects back with authorization code
4. **Token exchange** → Server exchanges code for access token
5. **User info retrieval** → Fetches user profile from provider
6. **Account linking** → User is redirected to `/auth/link-account` to complete registration
7. **Session creation** → User is logged in and redirected to dashboard

## Security Features

- **CSRF Protection**: State parameter prevents cross-site request forgery
- **Secure Cookies**: OAuth sessions stored in httpOnly cookies
- **Token Security**: Access tokens stored server-side only
- **State Validation**: Verifies state parameter on callback

## Testing

1. Start the development server: `npm run dev`
2. Navigate to `/login` or `/signup`
3. Click a social media icon
4. You should be redirected to the provider's login page
5. After authorization, you'll be redirected back to link your account

## Troubleshooting

### "Invalid redirect URI" error
- Ensure redirect URIs in provider settings match exactly (including http/https and trailing slashes)
- Check that `NEXT_PUBLIC_APP_URL` matches your current URL

### "Invalid client" error
- Verify client ID and secret are correct
- Check that the app is in the correct environment (development/production)

### "Access denied" error
- User may have denied permissions
- Check that required scopes are requested
- Verify app is approved (some providers require app review)

## Production Deployment

1. Update `NEXT_PUBLIC_APP_URL` to your production domain
2. Add production redirect URIs to all OAuth providers
3. Use environment variables in your hosting platform
4. Ensure HTTPS is enabled (required by most OAuth providers)
5. Test OAuth flow in production environment

