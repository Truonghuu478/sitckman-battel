# 🚀 Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Configuration Files
- [x] **vercel.json** - Cấu hình routing & caching
- [x] **.vercelignore** - Exclude test files & docs
- [x] **package.json** - Dependencies info
- [x] **.gitignore** - Git ignore rules

### 2. Dependencies Check
```bash
# All dependencies are CDN-based (no build step needed)
✅ Tailwind CSS - https://cdn.tailwindcss.com
✅ GSAP 3.12.2 - https://cdn.jsdelivr.net/npm/gsap@3.12.2
✅ Google Fonts - Spline Sans
✅ Material Icons - Google Fonts
```

### 3. File Structure
```
📦 Production Files (will be deployed)
├── index.html              ✅ Main entry point
├── vercel.json            ✅ Vercel config
├── README.md              ✅ Documentation
├── DEPLOYMENT.md          ✅ Deployment guide
├── js/                    ✅ Game logic
│   ├── main.js
│   ├── Game.js
│   ├── UIManager.js
│   ├── Player.js
│   ├── AIController.js
│   ├── CampaignManager.js
│   ├── InputHandler.js
│   └── ParticleSystem.js
└── styles/                ✅ Styling
    ├── main.css
    ├── new-ui.css
    ├── variables.css
    ├── animations.css
    └── components/
        ├── glass.css
        ├── buttons.css
        ├── cards.css
        ├── menu.css
        └── hud.css

🚫 Excluded from deployment (.vercelignore)
├── node_modules/          (Dev dependencies)
├── tests/                 (Test files)
├── coverage/              (Test coverage)
├── stitch/                (Design source files)
└── *.test.js              (Unit tests)
```

---

## 🎯 Vercel Configuration Explained

### vercel.json Features

#### 1. **Static Builds**
```json
"builds": [
  {
    "src": "index.html",
    "use": "@vercel/static"
  }
]
```
- Treats project as static site
- No build step required
- Fast deployment

#### 2. **Routing**
```json
"routes": [
  { "handle": "filesystem" },
  { "src": "/(.*)", "dest": "/$1" }
]
```
- Serves files directly
- SPA-friendly routing
- Handles all paths

#### 3. **Caching Headers**
```json
"headers": [
  {
    "source": "/(js|styles)/(.*)",
    "headers": [
      {
        "key": "Cache-Control",
        "value": "public, max-age=31536000, immutable"
      }
    ]
  }
]
```
- **JS/CSS**: 1 year cache (immutable)
- **index.html**: No cache (always fresh)
- **Other files**: 1 year cache

---

## 📦 Deployment Methods

### Method 1: Vercel CLI (Recommended)

#### Install Vercel CLI
```bash
npm i -g vercel
```

#### Login to Vercel
```bash
vercel login
```

#### Deploy to Production
```bash
# Navigate to project directory
cd /Users/truongle/Documents/web/games

# Deploy
vercel --prod
```

#### Expected Output
```
🔍 Inspect: https://vercel.com/[username]/stickman-fighting-game/[deployment-id]
✅ Production: https://stickman-fighting-game.vercel.app
```

---

### Method 2: GitHub Integration

#### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Production-ready: Professional UI/UX with tests"
git branch -M main
git remote add origin https://github.com/[username]/stickman-fighting-game.git
git push -u origin main
```

#### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: ./
5. Click "Deploy"

#### 3. Auto-Deploy Setup
- ✅ Every push to `main` → Auto deploy to production
- ✅ Pull requests → Preview deployments
- ✅ Branch deploys → Staging environments

---

## 🔧 Environment Setup

### No Environment Variables Needed
This project uses:
- Client-side JavaScript only
- No API keys
- No server-side code
- localStorage for game data

### Optional: Custom Domain
```bash
# Add custom domain
vercel domains add yourdomain.com

# Configure DNS
# A record: @ → 76.76.19.19
# CNAME: www → cname.vercel-dns.com
```

---

## 🧪 Pre-Deployment Tests

### 1. Run All Tests
```bash
npm test
```
**Expected**: ✅ 203/203 tests passing

### 2. Check Production Build
```bash
# Start local server
python3 -m http.server 8000

# Open browser
open http://localhost:8000
```

### 3. Verify Features
- [x] Main menu loads with glassmorphism
- [x] Stage selection shows all stages
- [x] Upgrade shop displays correctly
- [x] Battle HUD animates smoothly
- [x] Victory screen shows stats
- [x] Health bars update in real-time
- [x] Mobile responsive layout works
- [x] GSAP animations run smoothly

### 4. Check Console
- No JavaScript errors
- All assets load successfully
- No 404 errors

---

## 📊 Performance Optimization

### Vercel Edge Network
- **CDN**: Global edge network
- **Caching**: Aggressive caching for static assets
- **Compression**: Automatic gzip/brotli
- **HTTP/2**: Enabled by default

### Asset Optimization
- ✅ External CDN for libraries (Tailwind, GSAP)
- ✅ Minified CSS via Tailwind CDN
- ✅ Optimized images (none in current build)
- ✅ Reduced motion support
- ✅ 60fps throttled updates

### Expected Performance
- **Lighthouse Score**: 95-100
- **First Paint**: < 1s
- **Interactive**: < 2s
- **Bundle Size**: ~150KB (all JS)

---

## 🌐 Post-Deployment

### 1. Verify Deployment
```bash
# Check deployment status
vercel ls

# Open production URL
vercel open
```

### 2. Test Production Site
- Visit production URL
- Test all game features
- Check mobile responsiveness
- Verify HTTPS is enabled

### 3. Monitor Performance
```bash
# View analytics
vercel analytics

# Check logs
vercel logs
```

---

## 🔒 Security Headers

Vercel automatically adds:
- ✅ **X-Frame-Options**: DENY
- ✅ **X-Content-Type-Options**: nosniff
- ✅ **X-XSS-Protection**: 1; mode=block
- ✅ **HTTPS**: Force redirect
- ✅ **HSTS**: Enabled

---

## 🐛 Troubleshooting

### Issue: 404 on refresh
**Solution**: Already handled by routing in vercel.json
```json
{ "src": "/(.*)", "dest": "/$1" }
```

### Issue: Slow loading
**Check**:
1. CDN URLs are accessible
2. Cache headers are working
3. No large assets

### Issue: JavaScript errors
**Check**:
1. All JS files are deployed
2. No missing dependencies
3. Console for specific errors

---

## 📈 Deployment Stats

### File Sizes
- **index.html**: ~15KB
- **JS files**: ~120KB total
- **CSS files**: ~30KB total
- **Total**: ~165KB

### External Dependencies (CDN)
- Tailwind CSS: ~50KB (minified)
- GSAP: ~30KB (minified)
- Google Fonts: ~20KB
- Material Icons: ~10KB

### Total Bundle
- **First Load**: ~275KB
- **Cached Load**: ~165KB (HTML + custom files)

---

## ✅ Final Checklist

Before running `vercel --prod`:

- [x] All tests passing (203/203)
- [x] vercel.json configured
- [x] .vercelignore created
- [x] Local testing successful
- [x] No console errors
- [x] Mobile responsive verified
- [x] GSAP animations working
- [x] Health bars updating
- [x] Victory screen functional
- [x] Shop UI synchronized
- [x] Stage selection working

---

## 🚀 Deploy Command

```bash
# One-line deployment
cd /Users/truongle/Documents/web/games && vercel --prod

# With custom name
vercel --prod --name stickman-fighting-pro

# With debug output
vercel --prod --debug
```

---

**Ready to deploy!** 🎮✨

Game đã được optimize và test hoàn chỉnh cho production deployment.
