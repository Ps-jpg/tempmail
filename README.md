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
   NOTION_TOKEN=your_notion_integration_token
   NOTION_DATABASE_ID=your_notion_database_id
   ```

   For Firebase App Hosting, these will be set in the Firebase console.


4. **Run the development server**

   Start the backend server:
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

## Firebase App Hosting Deployment

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase App Hosting**
   ```bash
   firebase init apphosting
   ```

4. **Set environment variables in Firebase Console**
   - Go to Firebase Console > App Hosting > Your App > Environment Variables
   - Add:
     - `NOTION_TOKEN`: Your Notion integration token
     - `NOTION_DATABASE_ID`: Your Notion database ID

5. **Deploy**
   ```bash
   firebase deploy --only apphosting
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
├── public/                # Static assets
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


