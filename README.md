# Cricket Auction Platform

A real-time cricket player auction management system built with Next.js and Firebase. Admins conduct live auctions while team owners track bids, budgets, and player purchases in real-time.

## Features

### Admin Panel
- **Live Auction Control** - Start, pause, and end auctions with real-time status indicators
- **Player Management** - Add, edit, and delete players with role classification
- **Team Management** - Create and manage teams with custom budgets
- **Owner Management** - Create owner credentials (username/password authentication)
- **Real-time Bidding** - Place bids on behalf of teams with automatic validation
- **Consecutive Bid Prevention** - Same team cannot bid twice in a row
- **Bid History Tracking** - Complete history with SOLD event markers
- **Team Roster Display** - View purchased players with prices in team cards
- **Data Reset** - Clear all data with double confirmation for fresh starts
- **Mobile Responsive** - Full functionality across all device sizes

### Owner Dashboard
- **Live Auction View** - Real-time updates of current player being auctioned
- **Team Roster** - View all purchased players with purchase prices
- **Budget Tracking** - Monitor remaining budget and available slots
- **All Teams Overview** - Compare your team with other teams
- **Player Catalog** - Browse all players with search and filter options
- **Role Distribution** - Visual breakdown of team composition (Batsman, Bowler, All-rounder)
- **Bid History** - Track all bids for the current player or recent auction activity

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore (Real-time)
- **Authentication**: Custom username/password system
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/cricket-auction.git
cd cricket-auction
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Firebase**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable **Firestore Database** (Start in test mode for development)
   - Go to Project Settings > General > Your apps > Add Web App
   - Copy the Firebase config values

4. **Configure environment variables**

   Copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server**
```bash
npm run dev
```

6. **Initialize the database**

   Open [http://localhost:3000/setup](http://localhost:3000/setup) and click "Initialize Database" to create sample data.

### Default Credentials

**Admin Login:**
- Username: `admin`
- Password: `admin@123`

**Owner Login:**
- Create owners through the Admin panel
- Owners login with their assigned username/password

## Usage Guide

### Admin Workflow

1. **Start Auction** - Click "Start" to begin the auction session
2. **Select Player** - Click on an unsold player from the player pool
3. **Place Bids** - Select a team and enter bid amount (or use quick increment buttons)
4. **Finalize** - Mark player as "Sold" or "Unsold"
5. **Monitor** - Track team budgets, recent bids, and purchased players

### Key Features

- **Bid Validation**: Automatic checks for budget limits and minimum bid requirements
- **Consecutive Bid Prevention**: Ensures fair bidding by preventing same team from bidding twice in a row
- **Real-time Updates**: All changes sync instantly across admin and owner dashboards
- **SOLD Markers**: Clear visual indicators in bid history for completed sales

## Project Structure

```
cricket-auction/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Login page
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   ├── admin/
│   │   │   └── page.tsx          # Admin dashboard
│   │   ├── owner/
│   │   │   └── page.tsx          # Owner dashboard
│   │   └── setup/
│   │       └── page.tsx          # Database initialization
│   ├── components/
│   │   └── admin/
│   │       ├── AddPlayerModal.tsx
│   │       ├── AddTeamModal.tsx
│   │       ├── ManageTeamsModal.tsx
│   │       ├── ManageOwnersModal.tsx
│   │       ├── ManagePlayersModal.tsx
│   │       └── TeamDetailModal.tsx
│   ├── lib/
│   │   ├── firebase.ts           # Firebase configuration
│   │   ├── auth-context.tsx      # Authentication context
│   │   └── hooks.ts              # Firebase hooks and operations
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   └── utils/
│       ├── constants.ts          # App constants
│       └── helpers.ts            # Utility functions
├── .env.local.example            # Environment template
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project to [Vercel](https://vercel.com)
3. Add all `NEXT_PUBLIC_FIREBASE_*` environment variables in Vercel dashboard
4. Deploy

### Firebase Security Rules (Production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{playerId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /teams/{teamId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /owners/{ownerId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /auctionSettings/{settingId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /bidHistory/{bidId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

---

Built with Next.js 14, Firebase, Tailwind CSS, and TypeScript.
