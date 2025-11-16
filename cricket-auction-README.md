# Cricket Tournament Auction System

## 🏏 Project Overview
A real-time cricket player auction platform for local tournaments where admin conducts the auction and team owners monitor their teams, budgets, and bidding in real-time.

---

## 📋 Tech Stack (100% Free)
- **Frontend**: Next.js 14+ (React)
- **Database**: Firebase Firestore (Real-time Database)
- **Authentication**: Firebase Auth
- **Hosting**: Vercel (Free tier)
- **Styling**: Tailwind CSS

---

## 🎯 Core Features Required

### Admin Panel
- Player management (Add/Edit/Delete players)
- Live auction control (Start/Pause/Resume/End)
- Real-time bidding system
- Team wallet management
- Auction history tracking
- Sold/Unsold player status

### Owner Dashboard
- Real-time bid updates
- Team roster view
- Remaining wallet balance
- All players catalog
- Team-wise player distribution
- Auction status notifications

---

## 🚀 Complete Development Prompt

Use this prompt with Claude or any AI assistant to build the complete website:

---

### **PROMPT START**

Build a responsive cricket player auction website with the following specifications:

## **AUTHENTICATION & ROLES**

**Two User Roles:**
1. **Admin** - Full auction control (username: admin, password: admin@123)
2. **Owner** - View-only access with team assignment (8-10 owners with team names)

**Authentication Requirements:**
- Firebase Authentication
- Persistent login sessions
- Role-based routing protection
- Logout functionality

---

## **DATABASE SCHEMA (Firebase Firestore)**

### Collection: `players`
```javascript
{
  id: string,
  name: string,
  role: string, // Batsman, Bowler, All-rounder, Wicket-keeper
  basePrice: number,
  currentBid: number,
  status: string, // 'unsold', 'bidding', 'sold'
  biddingTeam: string | null,
  soldTo: string | null,
  imageUrl: string | null,
  speciality: string, // batting style, bowling type
  age: number,
  matches: number,
  createdAt: timestamp
}
```

### Collection: `teams`
```javascript
{
  id: string,
  teamName: string,
  ownerName: string,
  ownerEmail: string,
  totalBudget: number, // e.g., 100 lakhs
  remainingBudget: number,
  players: array, // Array of player IDs
  maxPlayers: number, // e.g., 15
  createdAt: timestamp
}
```

### Collection: `auctionSettings`
```javascript
{
  id: 'current',
  isActive: boolean,
  currentPlayer: string | null, // Player ID being auctioned
  bidIncrement: number, // e.g., 5 lakhs
  auctionStartTime: timestamp,
  auctionEndTime: timestamp | null
}
```

### Collection: `bidHistory`
```javascript
{
  id: string,
  playerId: string,
  playerName: string,
  teamId: string,
  teamName: string,
  bidAmount: number,
  timestamp: timestamp
}
```

---

## **PAGES & ROUTING**

### 1. **Login Page** (`/`)
- Clean centered login form
- Role selection (Admin/Owner)
- Email/Password for Owner
- Username/Password for Admin
- Error handling for invalid credentials
- Redirect based on role after login

### 2. **Admin Dashboard** (`/admin`)

**Top Navigation Bar:**
- Auction title
- Current time
- Active/Inactive status indicator
- Start/Pause/Resume/End Auction buttons
- Logout button

**Main Content - Three Column Layout:**

**Left Panel (30% width) - Auction Control:**
- Current player card (Large)
  - Player photo
  - Name, Role, Age
  - Base price
  - Current bid (Large, animated)
  - Bid history (last 5 bids)
- Bid controls:
  - Team selector dropdown (only teams with budget)
  - Bid amount input (pre-filled with current bid + increment)
  - "Place Bid" button (prominent)
  - Quick bid buttons (+5L, +10L, +20L)
- "Sold" button (marks player as sold to current bidding team)
- "Unsold" button (marks player as unsold)
- "Next Player" button

**Center Panel (40% width) - Player Pool:**
- Search bar (by name/role)
- Filter tabs: All | Unsold | Sold | Batsman | Bowler | All-rounder | WK
- Player cards grid (4x5 layout):
  - Photo thumbnail
  - Name
  - Role badge
  - Base price
  - Status indicator (Green: Unsold, Yellow: Bidding, Blue: Sold)
  - Sold team name (if sold)
- Click player card to start auction
- "Add Player" floating button (opens modal)

**Right Panel (30% width) - Teams Overview:**
- Team cards (scrollable):
  - Team logo/color
  - Team name
  - Remaining budget (Large, color-coded)
  - Players count (X/15)
  - Progress bar for budget used
- Click team to see detailed roster

**Modals:**
- Add/Edit Player Modal
- Team Details Modal (Player list with remove option)
- Auction History Modal
- Settings Modal (Edit team budgets, bid increment)

### 3. **Owner Dashboard** (`/owner`)

**Header:**
- Team name with logo
- Remaining budget (Prominent display)
- Player count (X/15)
- Logout button

**Two Tab Layout:**

**Tab 1: Live Auction**
- Current player being auctioned (Hero section):
  - Large player card
  - Current bid (Auto-updating, animated)
  - Bidding team name
  - Timer/pulse animation when active
- Recent bid activity feed (Last 10 bids across all players)
- Auction status: "Auction in Progress" / "Waiting for Next Player" / "Auction Paused"

**Tab 2: My Team**
- Team statistics cards:
  - Total players
  - Remaining budget
  - Budget used
  - Slots remaining
- Player roster table:
  - Player name
  - Role
  - Purchase price
  - Actions: View details
- Team composition chart (Role-wise distribution)

**Tab 3: All Teams**
- Grid of all team cards:
  - Team name
  - Owner name
  - Remaining budget
  - Player count
  - Click to see their full roster

**Tab 4: All Players**
- Searchable player catalog
- Filter by: All | Sold | Unsold | Role
- Player cards showing:
  - Name, Role, Stats
  - Status and sold team (if applicable)
  - Base price and sold price

---

## **REAL-TIME FEATURES (Critical)**

**Implement Firebase real-time listeners for:**
1. Current player being auctioned (auctionSettings.currentPlayer)
2. Current bid amount updates
3. Player status changes (unsold → bidding → sold)
4. Team budget updates
5. Auction active/pause status
6. Bid history updates

**Owner Dashboard Auto-Updates:**
- Current bid amount (every change)
- Current bidding team name
- Auction status changes
- Their team's remaining budget
- New players added to their team

---

## **UI/UX REQUIREMENTS**

**Responsive Design:**
- Mobile: Single column layout, collapsible panels
- Tablet: Two column layout
- Desktop: Three column layout (Admin), Full width (Owner)

**Color Scheme:**
- Primary: Cricket green (#2d6a4f)
- Secondary: Orange (#ff6b35)
- Background: Light gray (#f8f9fa)
- Cards: White with subtle shadows
- Success: Green, Warning: Yellow, Danger: Red

**Design Elements:**
- Modern card-based design
- Smooth animations for bid updates
- Loading states for all actions
- Toast notifications for success/error
- Skeleton loaders for data fetching
- Pulse animation for active bidding
- Badge system for player roles
- Progress bars for budgets

**Typography:**
- Headings: Bold, 24-32px
- Body: 14-16px
- Large numbers (bids/budgets): 28-36px, bold

**Icons:**
- Use Lucide React icons
- Player roles, actions, navigation

---

## **FUNCTIONALITY & VALIDATION**

**Admin Controls:**
- Cannot bid more than team's remaining budget
- Cannot assign player to team with 15+ players
- Warn if bid is below current bid + increment
- Confirm before marking player sold/unsold
- Prevent starting auction if another player is active
- Auto-disable bid button if no teams have sufficient budget

**Owner Restrictions:**
- Read-only access
- Cannot modify any data
- Auto-refresh on data changes

**Data Validation:**
- Player name: Required, 3-50 characters
- Base price: Positive number, max 50 crores
- Team budget: Positive number
- Bid amount: Greater than current bid

**Error Handling:**
- Firebase connection errors
- Invalid login attempts
- Insufficient budget errors
- Network timeout handling
- Graceful fallbacks

---

## **EDGE CASES TO HANDLE**

1. **Multiple Admins:** Show warning if another admin is active
2. **Network Loss:** Queue actions, sync when reconnected
3. **Simultaneous Bids:** Use Firebase transactions
4. **Player Deletion:** Prevent if player is sold or in bidding
5. **Budget Overflow:** Prevent team from bidding beyond budget
6. **Empty States:** Show helpful messages when no players/teams
7. **Auction Not Started:** Show "Waiting for auction to start" to owners
8. **Mid-Auction Refresh:** Restore current state correctly

---

## **ADDITIONAL FEATURES (Optional but Recommended)**

1. **Auction Statistics:**
   - Highest bid of the auction
   - Most expensive player
   - Team spending comparison chart
   - Role-wise price distribution

2. **Export Functionality:**
   - Export final teams to PDF
   - Export auction summary to Excel

3. **Sound Effects:**
   - Bell sound on new bid
   - Gavel sound on player sold

4. **Timer:**
   - Countdown timer for each player (30 seconds)
   - Auto-mark unsold if timer expires

5. **Notifications:**
   - Browser notifications for owners on new bids
   - Email summary after auction

---

## **DEPLOYMENT STEPS**

1. **Firebase Setup:**
   - Create Firebase project
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Set up security rules
   - Get Firebase config

2. **Vercel Deployment:**
   - Push code to GitHub
   - Import project to Vercel
   - Add Firebase environment variables
   - Deploy

3. **Initial Data Setup:**
   - Create admin user
   - Add 8-10 teams with owners
   - Set initial budgets (e.g., 100 crores each)
   - Add sample players

---

## **SECURITY RULES (Firebase)**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only admin can write players, teams, auctionSettings
    match /players/{playerId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
    
    match /teams/{teamId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
    
    match /auctionSettings/{settingId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
    
    match /bidHistory/{bidId} {
      allow read: if request.auth != null;
      allow create: if request.auth.token.admin == true;
    }
  }
}
```

---

## **CODE STRUCTURE**

```
/cricket-auction
├── /src
│   ├── /app
│   │   ├── page.jsx                 # Login page
│   │   ├── /admin
│   │   │   └── page.jsx             # Admin dashboard
│   │   └── /owner
│   │       └── page.jsx             # Owner dashboard
│   ├── /components
│   │   ├── /admin
│   │   │   ├── AuctionControl.jsx
│   │   │   ├── PlayerPool.jsx
│   │   │   ├── TeamsOverview.jsx
│   │   │   └── AddPlayerModal.jsx
│   │   ├── /owner
│   │   │   ├── LiveAuction.jsx
│   │   │   ├── MyTeam.jsx
│   │   │   └── AllPlayers.jsx
│   │   └── /shared
│   │       ├── PlayerCard.jsx
│   │       ├── TeamCard.jsx
│   │       └── Navbar.jsx
│   ├── /lib
│   │   ├── firebase.js              # Firebase config
│   │   └── hooks.js                 # Custom hooks
│   └── /utils
│       ├── helpers.js               # Utility functions
│       └── constants.js             # Constants
├── .env.local                       # Environment variables
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## **TESTING CHECKLIST**

- [ ] Login as admin works
- [ ] Login as owner works
- [ ] Admin can add/edit/delete players
- [ ] Admin can start auction for a player
- [ ] Admin can place bids for different teams
- [ ] Bid updates reflect in real-time on owner dashboard
- [ ] Admin can mark player as sold
- [ ] Team budget decreases when player is sold
- [ ] Player count increases for team
- [ ] Admin can mark player as unsold
- [ ] Admin cannot bid more than team budget
- [ ] Owner can see live auction updates
- [ ] Owner can see their team roster
- [ ] Owner can see all teams and players
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Logout works for both roles
- [ ] Page refresh maintains login state
- [ ] Firebase real-time sync works
- [ ] Error messages display correctly
- [ ] Loading states show during data fetch

---

## **PERFORMANCE OPTIMIZATION**

1. Use Next.js Image component for player photos
2. Implement lazy loading for player lists
3. Use React.memo for expensive components
4. Debounce search inputs
5. Limit real-time listeners (unsubscribe when not needed)
6. Use Firebase query limits (pagination)
7. Optimize bundle size (code splitting)

---

**IMPORTANT NOTES:**
- Prioritize real-time functionality - this is the core feature
- Make the admin interface efficient for quick auction management
- Owner dashboard should be clean and auto-updating
- Handle all error cases gracefully
- Test with multiple browser tabs (1 admin + 3-4 owners)
- Ensure mobile experience is smooth

**OUTPUT REQUIREMENTS:**
- Fully functional Next.js application
- Complete Firebase setup instructions
- Environment variables template
- Deployment guide
- User manual for admin and owners

### **PROMPT END**

---

## 🎨 Design References

The website should have a modern, clean look similar to:
- IPL Auction style interface
- Cricket scoreboard aesthetics
- Material Design principles
- Glassmorphism for cards (subtle)

---

## 🔧 Setup Instructions

### 1. Clone and Install
```bash
npx create-next-app@latest cricket-auction
cd cricket-auction
npm install firebase lucide-react
```

### 2. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Enable Firestore and Authentication
4. Copy config to `.env.local`

### 3. Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Deploy to Vercel
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```
Then import to Vercel and add environment variables.

---

## 📱 Usage Flow

### Admin Flow:
1. Login → Admin Dashboard
2. Add teams and set budgets
3. Add players to pool
4. Click "Start Auction"
5. Select player to auction
6. Select team and place bid
7. Click "Sold" or "Unsold"
8. Move to next player

### Owner Flow:
1. Login → Owner Dashboard
2. Watch live auction updates
3. See current bids in real-time
4. Monitor team budget
5. View team roster
6. Check all teams status

---

## 🎯 Success Metrics
- Real-time updates < 500ms delay
- Mobile responsive (320px - 1920px)
- Zero cost hosting and database
- Support 50+ concurrent users
- Auction completion in < 2 hours

---

## 🐛 Common Issues & Solutions

**Issue**: Real-time not updating
**Solution**: Check Firebase rules, ensure listeners are active

**Issue**: Budget not decreasing
**Solution**: Verify Firebase transaction implementation

**Issue**: Multiple admins conflict
**Solution**: Implement admin lock mechanism

---

## 📞 Support
For questions or issues:
- Check Firebase console for errors
- Verify Vercel deployment logs
- Test with browser console open

---

## 🏆 Future Enhancements
- Video streaming integration
- Live commentary
- Player statistics analytics
- Previous auction history
- Multi-language support (Hindi, Marathi)
- Telegram/WhatsApp notifications

---

**Ready to start building!** Copy the prompt above and paste it to start development. The website will be production-ready and 100% free to host! 🚀