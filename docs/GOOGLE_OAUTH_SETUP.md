# Google OAuth 2.0 Setup Guide

This guide follows Google's official OAuth 2.0 best practices for web applications.

## Reference
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google OAuth2l CLI Tool](https://github.com/google/oauth2l) (for testing)

## Step-by-Step Setup

### 1. Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - Choose **External** (unless you have Google Workspace)
   - Fill in required fields (App name, User support email, Developer contact)
   - Add scopes: `openid`, `profile`, `email`
   - Add test users if app is in testing mode

### 2. Configure OAuth Client

1. Choose **Web application** as the application type
2. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
3. Add **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
4. Click **Create**
5. Copy the **Client ID** and **Client Secret**

### 3. Environment Variables

Add to your `.env.local` file:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. OAuth Flow Features

Our implementation includes:

- **Account Selection**: Users can choose which Google account to use
- **Consent Screen**: Forces consent to ensure refresh tokens are obtained
- **Refresh Tokens**: `access_type=offline` ensures refresh tokens are provided
- **Incremental Authorization**: `include_granted_scopes=true` allows adding scopes later
- **Secure State**: CSRF protection via state parameter
- **Token Refresh**: Automatic token refresh using stored refresh tokens

### 5. Testing

1. Start your development server: `npm run dev`
2. Navigate to `/login`
3. Click the Google icon
4. You should see Google's account selection page
5. After authorization, you'll be redirected back to link your account

### 6. Production Checklist

- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Add production redirect URI in Google Console
- [ ] Verify OAuth consent screen is published (if needed)
- [ ] Test OAuth flow in production
- [ ] Ensure HTTPS is enabled (required by Google)

## Troubleshooting

### "redirect_uri_mismatch" Error
- Verify redirect URI in Google Console matches exactly (including http/https, trailing slashes)
- Check `NEXT_PUBLIC_APP_URL` matches your current URL

### "access_denied" Error
- User may have denied permissions
- Check OAuth consent screen configuration
- Verify app is not in restricted mode

### No Refresh Token
- Ensure `access_type=offline` is set (already included)
- User must grant consent (prompt=consent ensures this)
- First authorization always provides refresh token

### Token Expiration
- Access tokens expire after 1 hour
- Refresh tokens are long-lived
- System automatically refreshes tokens when needed

## Security Best Practices

1. **Never expose Client Secret** in client-side code
2. **Use HTTPS** in production
3. **Validate state parameter** (already implemented)
4. **Store tokens securely** (httpOnly cookies)
5. **Implement token refresh** (already implemented)
6. **Use minimal scopes** (only request what you need)

## Additional Resources

- [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
- [Google Identity Platform](https://developers.google.com/identity)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)

