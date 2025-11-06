# Setup Commands

Run these commands in order to set up and run the project:

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
NOTION_TOKEN=your_notion_integration_token_here
NOTION_DATABASE_ID=your_notion_database_id_here
```

**Note**: For local development only. For Firebase deployment, set these in Firebase Console.

## 3. Set Up Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Give it a name (e.g., "TempusMail Blog")
4. Copy the "Internal Integration Token"
5. Duplicate the TempusMail Blog Notion page to your workspace
6. Share the database with your integration
7. Copy the database ID from the URL (the part after the last `/` and before `?`)

## 4. Run Development Servers

**Terminal 1 - Backend Server:**
```bash
npm run server
```

**Terminal 2 - Frontend Server:**
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 5. Test Email Reception

1. Generate a temporary email
2. Send an email to that address from any email service
3. Check if it appears in the inbox (auto-refreshes every 10 seconds)

## 6. Build for Production

```bash
npm run build
npm start
```

## 7. Firebase Deployment

### Install Firebase CLI (if not installed)
```bash
npm install -g firebase-tools
```

### Login to Firebase
```bash
firebase login
```

### Initialize Firebase App Hosting
```bash
firebase init apphosting
```

### Set Environment Variables in Firebase Console
1. Go to Firebase Console
2. Select your project
3. Go to App Hosting > Your App
4. Go to Environment Variables
5. Add:
   - `NOTION_TOKEN`: Your Notion integration token
   - `NOTION_DATABASE_ID`: Your Notion database ID

### Deploy
```bash
firebase deploy --only apphosting
```

## 8. GitHub Actions Setup

1. Go to your GitHub repository Settings > Secrets and variables > Actions
2. Add a new secret:
   - Name: `FIREBASE_TOKEN`
   - Value: Get it by running `firebase login:ci` in terminal

The GitHub Actions workflow will automatically deploy on push to main/master branch.

