import { Timestamp } from 'firebase/firestore';

export interface Player {
  id: string;
  name: string;
  role: string;
  basePrice: number;
  currentBid: number;
  status: 'unsold' | 'bidding' | 'sold';
  biddingTeam: string | null;
  soldTo: string | null;
  imageUrl: string | null;
  speciality: string;
  age: number;
  matches: number;
  createdAt: Timestamp | Date;
}

export interface Owner {
  id: string;
  username: string;
  password: string;
  name: string;
  createdAt: Timestamp | Date;
}

export interface Team {
  id: string;
  teamName: string;
  ownerId: string;
  ownerName: string;
  totalBudget: number;
  remainingBudget: number;
  players: string[];
  maxPlayers: number;
  createdAt: Timestamp | Date;
}

export interface AuctionSettings {
  id: string;
  isActive: boolean;
  currentPlayer: string | null;
  bidIncrement: number;
  auctionStartTime: Timestamp | Date | null;
  auctionEndTime: Timestamp | Date | null;
}

export interface BidHistory {
  id: string;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  bidAmount: number;
  timestamp: Timestamp | Date;
  type?: 'bid' | 'sold'; // Optional type to distinguish bid from sold events
}

export interface User {
  uid: string;
  email: string | null;
  role: 'admin' | 'owner';
  teamId?: string;
  teamName?: string;
  ownerId?: string;
  ownerName?: string;
}

export type PlayerRole = 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper';
export type PlayerStatus = 'unsold' | 'bidding' | 'sold';
