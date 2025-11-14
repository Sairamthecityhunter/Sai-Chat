# Railway HTTPS Setup Guide

## Fixing HTTPS on Railway

Railway should automatically provide HTTPS for your domain. If you're seeing "not eligible for HTTPS" error, follow these steps:

### Option 1: Use Railway's Auto-Generated Domain (Recommended)

1. **Go to your Railway project dashboard**
2. **Click on your service** (the chat app)
3. **Go to the "Settings" tab**
4. **Scroll down to "Domains" section**
5. **Click "Generate Domain"** if you haven't already
6. Railway will give you a domain like: `your-app-name.up.railway.app`
7. **This domain automatically has HTTPS enabled**

### Option 2: Add Custom Domain (If you have one)

1. **In Railway dashboard**, go to Settings → Domains
2. **Click "Custom Domain"**
3. **Enter your domain** (e.g., `chat.yourdomain.com`)
4. **Add CNAME record** in your domain's DNS:
   - Type: `CNAME`
   - Name: `chat` (or `@` for root domain)
   - Value: `your-app.up.railway.app` (Railway will show you the exact value)
5. **Wait for DNS propagation** (5-30 minutes)
6. Railway will automatically provision SSL certificate

### Option 3: Force HTTPS in Application

The app is already configured to work with HTTPS. Make sure:

1. **Your Railway service is running**
2. **You're accessing via the Railway-provided domain** (not localhost)
3. **Clear your browser cache** and try again

### Troubleshooting

**If HTTPS still doesn't work:**

1. **Check Railway logs**:
   - Go to your service → "Deployments" tab
   - Check for any errors

2. **Verify domain configuration**:
   - Make sure the domain is properly set in Railway
   - Wait a few minutes after generating domain

3. **Try accessing directly**:
   - Use the full URL: `https://your-app-name.up.railway.app`
   - Don't use `http://` - always use `https://`

4. **Redeploy**:
   - In Railway, go to your service
   - Click "Redeploy" to restart the service

### Quick Fix Steps:

1. **Delete the current domain** (if you added one manually)
2. **Generate a new Railway domain** in Settings → Domains
3. **Wait 2-3 minutes** for Railway to provision SSL
4. **Access via HTTPS**: `https://your-new-domain.up.railway.app`

### Note:

- Railway automatically provides HTTPS for all `.up.railway.app` domains
- Custom domains also get automatic SSL via Let's Encrypt
- No additional configuration needed in your code
- The server code is already configured to work with HTTPS

If you're still having issues, check Railway's status page or contact Railway support.

