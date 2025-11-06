# TempusMail - Temporary Email Service

A modern, full-stack temporary email service built with Next.js, Express.js, and Firebase App Hosting.

## Project Overview

TempusMail is a replica of the TempusMail.com homepage featuring:

- **Modern UI**: Responsive design with dark/light theme toggle
- **Email Generation**: Generate temporary email addresses using Mail.tm API
- **Inbox**: Real-time email viewing with auto-refresh
- **Popular Articles**: Notion blog cards integration
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Live Deployment

   https://tempmail--tempmail-8f1e2.asia-southeast1.hosted.app/

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **APIs**: Mail.tm API, Notion API
- **Deployment**: Firebase App Hosting
- **CI/CD**: GitHub Actions

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Firebase CLI installed globally
- Notion account with API access
- Mail.tm API access (no account needed)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tempmail
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   # For local development, point to Express server
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

   For the Express server, create a `.env` file:
   ```env
   NOTION_KEY=your_notion_integration_token
   NOTION_PAGE_ID=your_notion_database_id
   FRONTEND_URL=http://localhost:3000
   ```

4. **Run the development server**

   Start the Express backend server:
   ```bash
   npm run server
   ```

   In a new terminal, start the Next.js frontend:
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Building for Production

```bash
npm run build
npm start
```

## Deployment

### Deploy Express Backend to Cloud Run

1. **Install Google Cloud SDK**
   ```bash
   # Follow instructions at: https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate and set project**
   ```bash
   gcloud auth login
   gcloud config set project tempmail-8f1e2
   ```

3. **Enable required APIs**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

4. **Set environment variables for secrets**
   ```bash
   # Get your Notion credentials
   export NOTION_KEY="your_notion_token"
   export NOTION_PAGE_ID="your_database_id"
   ```

5. **Deploy to Cloud Run**
   ```bash
   # Option 1: Using the deployment script
   chmod +x deploy-cloudrun.sh
   ./deploy-cloudrun.sh

   # Option 2: Manual deployment
   gcloud builds submit --tag gcr.io/tempmail-8f1e2/tempmail-api
   gcloud run deploy tempmail-api \
     --image gcr.io/tempmail-8f1e2/tempmail-api \
     --platform managed \
     --region asia-southeast1 \
     --allow-unauthenticated \
     --set-env-vars "NOTION_KEY=${NOTION_KEY},NOTION_PAGE_ID=${NOTION_PAGE_ID},FRONTEND_URL=https://tempmail--tempmail-8f1e2.asia-southeast1.hosted.app" \
     --port 8080
   ```

6. **Get your Cloud Run service URL**
   ```bash
   gcloud run services describe tempmail-api --region asia-southeast1 --format 'value(status.url)'
   ```

7. **Update frontend environment variable**
   - Set `NEXT_PUBLIC_API_URL` in Firebase App Hosting to your Cloud Run URL
   - Or add it to `apphosting.yaml`:
     ```yaml
     env:
       - variable: NEXT_PUBLIC_API_URL
         value: https://tempmail-api-xxxxx-xx.a.run.app
     ```

### Deploy Next.js Frontend to Firebase App Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Set environment variable for API URL**
   - In Firebase Console > App Hosting > Settings > Environment Variables
   - Add `NEXT_PUBLIC_API_URL` with your Cloud Run service URL

4. **Deploy**
   ```bash
   git push origin main  # App Hosting auto-deploys on push
   ```

## Project Structure

```
tempmail/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── under-construction/ # Under construction page
├── components/            # React components
│   ├── Header.tsx         # Header with theme toggle
│   ├── EmailGenerator.tsx # Email generation component
│   ├── Inbox.tsx          # Email inbox component
│   ├── PopularArticles.tsx # Notion blog cards
│   ├── Footer.tsx         # Footer component
│   └── ThemeProvider.tsx  # Theme context provider
├── server/                # Express.js backend
│   └── index.js           # API server
├── lib/                   # Utility functions
│   └── api.ts             # API URL helper
├── public/                # Static assets
├── Dockerfile             # Docker config for Cloud Run
├── .dockerignore          # Docker ignore file
├── cloudbuild.yaml        # Cloud Build config
├── deploy-cloudrun.sh     # Cloud Run deployment script
├── package.json           # Dependencies
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## API Endpoints

### Backend API (Express.js)

- `POST /api/generate-email` - Generate a new temporary email address
- `GET /api/get-emails?token=<token>` - Fetch emails for a given token
- `GET /api/notion-articles` - Fetch articles from Notion database

## Features

### 1. Email Generation
- One-click temporary email generation
- Uses Mail.tm API for reliable email service
- Automatic account creation and authentication

### 2. Inbox
- Real-time email polling (every 10 seconds)
- Email preview and full view modal
- Copy email address to clipboard
- Manual refresh option

### 3. Dark/Light Theme
- System preference detection
- Persistent theme storage
- Smooth theme transitions

### 4. Notion Blog Integration
- Fetches articles from Notion database
- Displays blog cards with images
- Responsive grid layout

## Assumptions and Notes

1. **Mail.tm API**: No authentication required for basic usage. The service is free but rate-limited.

2. **Notion Integration**: 
   - Requires a Notion integration token
   - Database must be shared with the integration
   - Supports standard Notion database properties (Title, Description, URL, Cover, Date)

3. **Environment Variables**: 
   - Sensitive tokens are stored as environment variables in Firebase
   - Never commit `.env` files to the repository

4. **Firebase App Hosting**: 
   - Requires Firebase CLI and account setup
   - Environment variables must be configured in Firebase Console

5. **CORS**: The Express.js server has CORS enabled for development. In production, configure CORS appropriately.

## Testing

To test email reception:

1. Generate a temporary email address
2. Send an email to that address from any email service
3. The inbox should automatically update within 10 seconds
4. Click on an email to view full content

## Troubleshooting

### Emails not appearing
- Check if the Mail.tm API is accessible
- Verify the token is valid
- Check browser console for errors

### Notion articles not loading
- Verify `NOTION_TOKEN` and `NOTION_DATABASE_ID` are set correctly
- Ensure the database is shared with your integration
- Check that the database has the required properties

### Theme not persisting
- Clear browser cache and localStorage
- Check browser console for errors


