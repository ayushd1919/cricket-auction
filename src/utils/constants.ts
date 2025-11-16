export const PLAYER_ROLES = {
  BATSMAN: 'Batsman',
  BOWLER: 'Bowler',
  ALL_ROUNDER: 'All-rounder',
} as const;

export const PLAYER_STATUS = {
  UNSOLD: 'unsold',
  BIDDING: 'bidding',
  SOLD: 'sold',
} as const;

export const BID_INCREMENTS = [5, 10, 20, 50] as const; // in lakhs

export const DEFAULT_TEAM_BUDGET = 100; // in lakhs
export const MAX_PLAYERS_PER_TEAM = 15;

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin@123',
};

// Sample teams for initial setup
export const SAMPLE_TEAMS = [
  { teamName: 'Thunder Strikers', ownerName: 'Rajesh Kumar', ownerEmail: 'rajesh@example.com' },
  { teamName: 'Royal Warriors', ownerName: 'Amit Singh', ownerEmail: 'amit@example.com' },
  { teamName: 'Super Kings', ownerName: 'Priya Sharma', ownerEmail: 'priya@example.com' },
  { teamName: 'Mighty Lions', ownerName: 'Vikram Patel', ownerEmail: 'vikram@example.com' },
  { teamName: 'Fire Hawks', ownerName: 'Neha Gupta', ownerEmail: 'neha@example.com' },
  { teamName: 'Storm Riders', ownerName: 'Arun Verma', ownerEmail: 'arun@example.com' },
  { teamName: 'Golden Eagles', ownerName: 'Sanjay Reddy', ownerEmail: 'sanjay@example.com' },
  { teamName: 'Blue Dragons', ownerName: 'Kavita Nair', ownerEmail: 'kavita@example.com' },
];

export const TEAM_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
];
