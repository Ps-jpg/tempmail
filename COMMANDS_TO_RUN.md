# Commands to Run - Step by Step

## 🚀 Initial Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File (Optional - for Notion integration)
```bash
# Create .env.local file with:
NOTION_TOKEN=your_notion_token_here
NOTION_DATABASE_ID=your_database_id_here
```

### 3. Start Backend Server (Terminal 1)
```bash
npm run server
```
This will start the Express.js server on http://localhost:3001

### 4. Start Frontend Server (Terminal 2)
```bash
npm run dev
```
This will start the Next.js app on http://localhost:3000

## ✅ Testing

1. Open http://localhost:3000 in your browser
2. Click "Generate Email Address"
3. Copy the generated email
4. Send a test email to that address
5. Check if it appears in the inbox (auto-refreshes every 10 seconds)

## 🏗️ Build for Production

```bash
npm run build
npm start
```

## 🔥 Firebase Deployment

### Prerequisites
```bash
npm install -g firebase-tools
firebase login
```

### Initialize Firebase App Hosting
```bash
firebase init apphosting
```

### Set Environment Variables
1. Go to Firebase Console → App Hosting → Your App → Environment Variables
2. Add:
   - `NOTION_TOKEN` (your Notion integration token)
   - `NOTION_DATABASE_ID` (your Notion database ID)

### Deploy
```bash
firebase deploy --only apphosting
```

## 📝 GitHub Actions Setup

### Get Firebase Token
```bash
firebase login:ci
```

### Add to GitHub Secrets
1. Go to GitHub Repo → Settings → Secrets and variables → Actions
2. Add secret: `FIREBASE_TOKEN` with the token from above

## 📦 Project Structure

```
tempmail/
├── app/                    # Next.js app directory
├── components/            # React components
├── server/                # Express.js backend
├── public/                # Static assets
├── package.json           # Dependencies
└── README.md              # Full documentation
```

## 🎯 Key Features Implemented

✅ Header with logo and dark/light theme toggle
✅ Email generation using Mail.tm API
✅ Real-time inbox with auto-refresh
✅ Popular articles section (Notion integration)
✅ Footer with standard links
✅ Responsive design
✅ Firebase App Hosting configuration
✅ GitHub Actions for CI/CD

## 📚 Documentation Files

- `README.md` - Complete project documentation
- `SETUP_COMMANDS.md` - Detailed setup instructions
- `QUICK_START.md` - Quick reference guide
- `COMMANDS_TO_RUN.md` - This file

## 🔑 Important Notes

1. **Mail.tm API**: Works without any setup - just generate emails!
2. **Notion Integration**: Optional - articles will show empty if not configured
3. **Environment Variables**: Never commit `.env.local` - it's in `.gitignore`
4. **Firebase**: Set environment variables in Firebase Console, not in code

