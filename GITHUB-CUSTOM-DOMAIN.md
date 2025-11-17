# Free Hosting with Custom Domain Setup Guide

## Option 1: Render (Recommended - Free + Custom Domain)

Render offers free hosting with custom domain support. Perfect for your chat app!

### Step 1: Deploy to Render

1. **Go to Render**: https://render.com
2. **Sign up** with your GitHub account
3. **New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `Sairamthecityhunter/Sai-Chat`
4. **Configure**:
   - **Name**: `sai-chat` (or any name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: **Free**
5. **Click "Create Web Service"**
6. **Wait for deployment** (5-10 minutes)

### Step 2: Add Custom Domain (FREE)

1. **In Render Dashboard**:
   - Go to your service → **Settings** tab
   - Scroll to **"Custom Domains"** section
2. **Add Your Domain**:
   - Click **"Add Custom Domain"**
   - Enter your domain (e.g., `chat.yourdomain.com` or `yourdomain.com`)
   - Click **"Save"**
3. **Configure DNS** (in your domain provider):
   - Render will show you DNS records to add
   - Usually a **CNAME** record:
     - **Type**: CNAME
     - **Name**: `chat` (or `@` for root domain)
     - **Value**: `your-service.onrender.com` (Render shows this)
   - **Save DNS settings**
4. **Wait for SSL**:
   - Render automatically provisions SSL certificate
   - Takes 5-30 minutes
   - You'll see "SSL Certificate Active" when ready

### Step 3: Access Your Site

- Your site will be live at: `https://your-custom-domain.com`
- **Completely FREE!**

---

## Option 2: Fly.io (Free + Custom Domain)

Fly.io also offers free hosting with custom domain support.

### Steps:

1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Sign up**: https://fly.io (use GitHub to sign in)

3. **Deploy**:
   ```bash
   fly launch
   ```
   - Follow prompts
   - Choose a region
   - Don't add Postgres (we don't need it)

4. **Add Custom Domain**:
   ```bash
   fly domains add yourdomain.com
   ```
   - Fly will show DNS records to add
   - Add them to your domain provider
   - Fly automatically provisions SSL

---

## Option 3: Railway (Free Tier + Custom Domain)

Railway also supports custom domains on free tier.

### Steps:

1. **Deploy to Railway**: https://railway.app
   - Connect GitHub repo
   - Deploy automatically

2. **Add Custom Domain**:
   - Settings → Domains → Custom Domain
   - Enter your domain
   - Add CNAME record Railway provides
   - Railway auto-provisions SSL

---

## Recommended: Render (Easiest)

**Why Render?**
- ✅ Completely FREE
- ✅ Easy custom domain setup
- ✅ Automatic SSL certificates
- ✅ GitHub integration
- ✅ Supports WebSockets (Socket.io)
- ✅ Auto-deploys on git push

**Get Started Now:**

1. Go to: https://render.com
2. Sign up with GitHub
3. New Web Service → Connect `Sai-Chat` repo
4. Use these settings:
   - Build: `npm install`
   - Start: `node server.js`
   - Plan: **Free**
5. Add your custom domain in Settings
6. Configure DNS as shown
7. Done! Your site is live!

---

## Custom Domain Setup (Render Example)

### If you have a domain (e.g., `yourdomain.com`):

1. **In Render**: Add custom domain `chat.yourdomain.com`
2. **In your domain provider** (GoDaddy, Namecheap, etc.):
   - Add CNAME record:
     - Name: `chat`
     - Value: `your-service.onrender.com`
3. **Wait 5-30 minutes** for DNS propagation
4. **Render automatically adds SSL** - you'll see it in dashboard
5. **Access**: `https://chat.yourdomain.com`

### If you DON'T have a domain:

- Use Render's free subdomain: `your-app.onrender.com`
- Or get a free domain from:
  - Freenom (free .tk, .ml domains)
  - GitHub Student Pack (if you're a student)

---

## Quick Deploy Checklist

- [ ] Sign up at Render.com with GitHub
- [ ] Create new Web Service
- [ ] Connect your GitHub repo
- [ ] Set build command: `npm install`
- [ ] Set start command: `node server.js`
- [ ] Choose Free plan
- [ ] Deploy and wait
- [ ] Add custom domain (if you have one)
- [ ] Configure DNS
- [ ] Wait for SSL
- [ ] Share your live URL!

---

## Need Help?

If you need help with:
- Domain purchase
- DNS configuration
- SSL setup
- Any deployment issues

Just let me know! The Render option is the easiest and completely free.

