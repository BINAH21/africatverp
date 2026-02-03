# Google Calendar Integration Setup

This guide explains how to set up Google Calendar integration for the Africa TV ERP system.

## Overview

The dashboard includes a Google Calendar widget that displays:
- Today's date and time
- Upcoming events and broadcasts
- Holiday announcements
- Closed days notifications

## Setup Instructions

### 1. Enable Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Library**
4. Search for "Google Calendar API"
5. Click **Enable**

### 2. Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** (unless you have Google Workspace)
3. Fill in required information:
   - App name: "Africa TV ERP"
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/calendar.readonly` (read calendar events)
   - `https://www.googleapis.com/auth/calendar.events` (create/edit events)
5. Add test users if app is in testing mode

### 3. Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
5. Copy the **Client ID** and **Client Secret**

### 4. Environment Variables

Add to your `.env.local` file:

```env
# Google Calendar API
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALENDAR_ID=primary
```

### 5. Update OAuth Scopes

In `lib/oauth.ts`, ensure Google OAuth includes calendar scopes:

```typescript
google: {
  // ... other config
  scopes: [
    'openid',
    'profile',
    'email',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
  ],
}
```

### 6. Implement Calendar API Calls

Update `app/api/calendar/google/route.ts` to use real Google Calendar API:

```typescript
// Get access token from session
const session = await getSession(request);
const accessToken = session?.accessToken;

if (!accessToken) {
  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
}

// Fetch events from Google Calendar
const response = await fetch(
  `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${startDate}&timeMax=${endDate}`,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
);

const data = await response.json();
return NextResponse.json({ events: data.items });
```

## Features

### Calendar Widget
- Displays current date and time
- Shows today's events
- Links to full schedule page
- Color-coded event types

### Holiday Management
- Automatic holiday detection
- Announcements for upcoming holidays
- Closed day notifications
- Custom holiday support

### Event Types
- **Broadcast**: Live broadcasts and scheduled programs
- **Meeting**: Staff meetings and editorial sessions
- **Holiday**: National and company holidays
- **Closed**: Station closure days

## Usage

### Viewing Calendar Events
1. Log in to the dashboard
2. Calendar widget appears on the right side
3. Click "View Full Schedule" to see complete calendar

### Creating Events
1. Navigate to `/scheduling`
2. Click "Create Event"
3. Fill in event details
4. Event is automatically added to Google Calendar

### Holiday Announcements
- Holidays are automatically detected
- Announcements appear at the top of the dashboard
- Upcoming holidays shown in the calendar widget

## Troubleshooting

### "Calendar API not enabled"
- Enable Google Calendar API in Google Cloud Console
- Wait a few minutes for changes to propagate

### "Insufficient permissions"
- Check OAuth scopes include calendar permissions
- Re-authenticate user to grant new permissions

### "Events not showing"
- Verify calendar ID is correct
- Check access token is valid
- Ensure events exist in the specified date range

## Security Notes

- Access tokens are stored securely in httpOnly cookies
- Calendar data is only accessible to authenticated users
- OAuth tokens are refreshed automatically
- All API calls are server-side only

## Additional Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/v3/reference)
- [OAuth 2.0 for Web Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Calendar API Quickstart](https://developers.google.com/calendar/api/quickstart)

