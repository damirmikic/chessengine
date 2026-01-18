# 🚀 Deployment Guide

This guide covers deploying the AI Chess Coach to various hosting platforms.

## Quick Start: Vercel (Recommended)

### Option 1: Web Dashboard (Easiest)

1. Visit [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import from GitHub: `damirmikic/chessengine`
4. Click "Deploy" (no configuration needed!)
5. Your app is live! 🎉

**Deployment URL:** `https://chessengine-<random>.vercel.app`

### Option 2: CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /path/to/chessengine
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? chessengine
# - Directory? ./
# - Override settings? No

# Production deployment
vercel --prod
```

### Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `chess.yoursite.com`)
3. Add DNS records as instructed
4. SSL certificate is automatic!

---

## Alternative Platforms

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd /path/to/chessengine
netlify deploy

# Production deployment
netlify deploy --prod
```

**Or via Web Dashboard:**
1. Go to [app.netlify.com](https://app.netlify.com)
2. "Add new site" → "Import from Git"
3. Select GitHub repo
4. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: `/`
5. Deploy!

---

### Cloudflare Pages

1. Visit [pages.cloudflare.com](https://pages.cloudflare.com)
2. "Create a project" → Connect to Git
3. Select repository: `damirmikic/chessengine`
4. Build settings:
   - Framework preset: None
   - Build command: (leave empty)
   - Build output directory: `/`
5. Save and Deploy

**Benefits:**
- Unlimited bandwidth (free tier)
- Fastest global CDN
- Built-in analytics

---

### GitHub Pages (Simplest)

1. Go to repository Settings → Pages
2. Source: Deploy from branch
3. Branch: `main`, Folder: `/` (root)
4. Save and wait ~2 minutes

**Your site:** `https://damirmikic.github.io/chessengine/`

**Note:** GitHub Pages has some limitations:
- No custom headers (might affect CORS)
- Slower CDN compared to Vercel/Cloudflare
- No preview deployments

---

## Configuration Files

### Vercel (`vercel.json`)
```json
{
  "version": 2,
  "public": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

### Netlify (`netlify.toml`)
```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
```

### Cloudflare Pages (`_headers`)
```
/*
  Access-Control-Allow-Origin: *
  X-Frame-Options: DENY
```

---

## Post-Deployment Checklist

After deploying, verify:

- ✅ App loads without errors
- ✅ Local Stockfish engine initializes
- ✅ Cloud engine connects (check Settings → Cloud API)
- ✅ Board moves work
- ✅ Analysis features function
- ✅ Multiplayer (PeerJS) works
- ✅ WebSocket connection to chess-api.com succeeds
- ✅ HTTPS is enabled (required for cloud engine)

---

## Troubleshooting

### Issue: "Failed to fetch" errors

**Solution:** Check CORS headers in your platform config

### Issue: ES6 modules not loading

**Solution:** Ensure HTTPS is enabled and headers allow module loading

### Issue: Stockfish WASM fails to load

**Solution:**
1. Check `Content-Type: application/wasm` header
2. Verify `stockfish.wasm` is in root directory
3. Check browser console for specific errors

### Issue: Cloud engine won't connect

**Solution:**
1. Verify HTTPS is enabled (required for WebSocket)
2. Check browser console for WebSocket errors
3. Try switching to local engine temporarily
4. Verify chess-api.com is accessible

### Issue: PeerJS multiplayer not working

**Solution:**
1. Check if PeerJS CDN is accessible
2. Verify HTTPS (required for WebRTC)
3. Check firewall/network restrictions

---

## Performance Optimization

### Enable Compression

Most platforms enable this by default, but verify:

**Vercel/Netlify/Cloudflare:** Automatic gzip/brotli ✅

### Cache Headers

Add to platform config:

```json
{
  "headers": [
    {
      "source": "/(.*).wasm",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*).js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## Monitoring

### Analytics

**Vercel Analytics:**
```bash
# Add to your project (optional)
npm install @vercel/analytics
```

**Cloudflare Analytics:**
Built-in, free, available in dashboard

**Google Analytics:**
Add to `index.html` before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## Continuous Deployment

All recommended platforms support automatic deployments:

1. **Push to GitHub** → Automatic deployment
2. **Pull Request** → Preview deployment (unique URL)
3. **Merge to main** → Production deployment

**Example Workflow:**
```bash
git checkout -b feature/new-opening-book
# ... make changes ...
git add .
git commit -m "feat: add extended opening book"
git push origin feature/new-opening-book
# → Preview deployment created automatically!

# After review, merge PR
# → Production deployment happens automatically
```

---

## Custom Domains

### Vercel
1. Dashboard → Project → Settings → Domains
2. Add domain
3. Configure DNS:
   - Type: `CNAME`
   - Name: `chess` (or `@` for root)
   - Value: `cname.vercel-dns.com`
4. SSL: Automatic ✅

### Netlify
1. Dashboard → Domain Settings → Add custom domain
2. Configure DNS:
   - Type: `CNAME`
   - Name: `chess`
   - Value: `<your-site>.netlify.app`
3. SSL: Automatic ✅

### Cloudflare Pages
1. Dashboard → Custom domains → Set up a domain
2. Add domain (if already on Cloudflare, it's instant)
3. SSL: Automatic ✅

---

## Environment Variables (Future Use)

If you need API keys or secrets later:

### Vercel
```bash
vercel env add CHESS_API_KEY
```

### Netlify
```bash
netlify env:set CHESS_API_KEY "your-key-here"
```

### Cloudflare
Dashboard → Settings → Environment variables

---

## Cost Estimates

| Platform | Free Tier | Paid Plans Start At |
|----------|-----------|---------------------|
| **Vercel** | 100 GB bandwidth/mo | $20/mo (Pro) |
| **Netlify** | 100 GB bandwidth/mo | $19/mo (Pro) |
| **Cloudflare Pages** | Unlimited bandwidth | $20/mo (Workers) |
| **GitHub Pages** | 100 GB bandwidth/mo | N/A (always free) |

**Your app will likely stay free forever** (estimated ~5-10 GB/month for moderate traffic).

---

## Recommended: Vercel

**For this chess app, Vercel is the best choice because:**

1. ✅ Zero configuration
2. ✅ Perfect ES6 module support
3. ✅ Excellent WebSocket performance (cloud API)
4. ✅ Preview deployments for every PR
5. ✅ Fast global CDN
6. ✅ Free tier is generous
7. ✅ Great developer experience

**Deploy now:** [vercel.com/new](https://vercel.com/new)

---

## Questions?

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages
- GitHub Pages Docs: https://docs.github.com/pages

**Happy deploying! 🚀♟️**
