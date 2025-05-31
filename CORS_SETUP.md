# CORS Setup for Slack API

Since Slack API may have CORS restrictions when called from the browser, you have several options:

## Option 1: Use Slack Web API from a Slack App (Recommended)

1. Create a Slack App at https://api.slack.com/apps
2. Install the app to your workspace
3. Use the OAuth token provided by Slack
4. Ensure your app has the required scopes

## Option 2: Browser Extension

For development/testing, you can use a CORS proxy browser extension:

- "CORS Unblock" for Chrome/Firefox
- "Allow CORS" for Chrome

⚠️ **Warning**: Only use this for development. Never ask users to disable CORS in production.

## Option 3: Use a CORS Proxy Service

You can modify the Slack API calls to use a CORS proxy:

```javascript
// In src/lib/api/slack.ts
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'
// or use your own CORS proxy server

// Modify the fetch URLs:
const response = await fetch(`${CORS_PROXY}${API_ENDPOINTS.SLACK.AUTH_TEST}`, {
  // ... rest of the code
})
```

## Option 4: Deploy as Desktop App

Use Electron or Tauri to package the app as a desktop application, which bypasses CORS restrictions.

## Production Recommendation

For production use, we recommend:

1. Creating a proper Slack App with OAuth flow
2. Using Slack's official SDK with proper authentication
3. Implementing proper token management and refresh logic

## Testing the App

To test the app during development:

1. Use a browser extension to disable CORS (development only)
2. Or deploy a simple proxy server
3. Or use Slack's Socket Mode for real-time events
