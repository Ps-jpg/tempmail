# Quick Start Guide

## 🚀 Fast Setup (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Backend Server (Terminal 1)
```bash
npm run server
```

### Step 3: Run Frontend (Terminal 2)
```bash
npm run dev
```

### Step 4: Open Browser
Navigate to: http://localhost:3000

## ✅ What Works Out of the Box

- ✅ Email generation (uses Mail.tm API - no setup needed)
- ✅ Dark/Light theme toggle
- ✅ Responsive design
- ✅ Email inbox with auto-refresh
- ⚠️ Notion articles (requires Notion setup - optional)

## 🔧 Notion Setup (Optional - for blog articles)

1. Visit: https://www.notion.so/my-integrations
2. Create new integration → Copy token
3. Duplicate TempusMail Blog to your workspace
4. Share database with your integration
5. Copy database ID from URL
6. Create `.env.local`:
   ```
   NOTION_TOKEN=your_token
   NOTION_DATABASE_ID=your_database_id
   ```
7. Restart servers

## 📦 Production Build

```bash
npm run build
npm start
```

## 🌐 Firebase Deployment

See `SETUP_COMMANDS.md` for detailed Firebase deployment instructions.

## 🐛 Troubleshooting

**Email not generating?**
- Check browser console for errors
- Verify backend server is running on port 3001
- Mail.tm API might be rate-limited (wait a minute)

**Notion articles not showing?**
- Check `.env.local` file exists
- Verify tokens are correct
- Ensure database is shared with integration
- Check server logs for errors

**Theme not working?**
- Clear browser cache
- Check browser console for errors

