# Vercel Deployment Guide

## Fixed Issues

✅ **ERR_REQUIRE_ESM Error**: Fixed by downgrading `nanoid` from v5 to v4 (v4 supports CommonJS `require()`)

⚠️ **IMPORTANT LIMITATION**: Socket.IO WebSockets do NOT work on Vercel serverless functions. The app will deploy and serve static files, but real-time chat features will not work. For full Socket.IO support, deploy to **Railway** or **Render** instead (see `VERCEL-LIMITATIONS.md`).

## Deployment Steps

### 1. Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy to Vercel
From the project root directory:
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No** (for first deployment)
- Project name? `sai-chat` (or your preferred name)
- Directory? **./** (current directory)
- Override settings? **No**

### 4. Production Deployment
After initial deployment, deploy to production:
```bash
vercel --prod
```

## Alternative: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect settings:
   - Framework Preset: **Other**
   - Build Command: (leave empty or `npm install`)
   - Output Directory: (leave empty)
   - Install Command: `npm install`
5. Click **"Deploy"**

## Configuration Files

### `vercel.json`
This file configures Vercel to:
- Use Node.js runtime for `server.js`
- Route all requests (including Socket.IO) to the Express server
- Serve static files from the `public` directory

### `package.json`
- Updated `nanoid` to v4.0.2 (CommonJS compatible)
- Start script: `node server.js`

## Important Notes

### Socket.IO on Vercel
- Socket.IO works on Vercel, but requires proper WebSocket support
- The `vercel.json` routes all `/socket.io/*` requests to the server
- Make sure your frontend connects to the correct Socket.IO endpoint

### Environment Variables
If you need to set environment variables:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add any required variables (e.g., `PORT`, `NODE_ENV`)

### Custom Domain
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Troubleshooting

### Still getting ERR_REQUIRE_ESM?
- Make sure `package-lock.json` is committed to git
- Run `npm install` locally to verify dependencies
- Check that `nanoid` version is `^4.0.2` in `package.json`

### Socket.IO not connecting?
- Verify the Socket.IO client connects to your Vercel deployment URL
- Check browser console for connection errors
- Ensure WebSocket support is enabled in Vercel (should be automatic)

### Build fails?
- Check Vercel build logs in the dashboard
- Verify all dependencies are in `package.json`
- Ensure `server.js` is in the root directory

## Testing Locally

Before deploying, test locally:
```bash
npm install
npm start
```

Visit `http://localhost:3000` to verify everything works.

## Post-Deployment

After successful deployment:
1. Your app will be available at `https://your-project.vercel.app`
2. Socket.IO will work automatically
3. All routes will be handled by your Express server
4. Static files from `public/` will be served correctly

## Auto-Deploy from GitHub

Once connected to GitHub:
- Every push to `main` branch auto-deploys
- Pull requests get preview deployments
- No manual deployment needed!

