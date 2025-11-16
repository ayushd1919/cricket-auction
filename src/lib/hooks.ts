'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Player, Team, AuctionSettings, BidHistory, Owner } from '@/types';

// Hook to get all owners with real-time updates
export function useOwners() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'owners'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ownersData: Owner[] = [];
      snapshot.forEach((doc) => {
        ownersData.push({ id: doc.id, ...doc.data() } as Owner);
      });
      setOwners(ownersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { owners, loading };
}

// Hook to get all players with real-time updates
export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'players'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playersData: Player[] = [];
      snapshot.forEach((doc) => {
        playersData.push({ id: doc.id, ...doc.data() } as Player);
      });
      setPlayers(playersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { players, loading };
}

// Hook to get all teams with real-time updates
export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'teams'), orderBy('teamName'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teamsData: Team[] = [];
      snapshot.forEach((doc) => {
        teamsData.push({ id: doc.id, ...doc.data() } as Team);
      });
      setTeams(teamsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { teams, loading };
}

// Hook to get auction settings with real-time updates
export function useAuctionSettings() {
  const [settings, setSettings] = useState<AuctionSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'auctionSettings', 'current'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings({ id: docSnap.id, ...docSnap.data() } as AuctionSettings);
      } else {
        setSettings(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { settings, loading };
}

// Hook to get current player being auctioned
export function useCurrentPlayer(playerId: string | null) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId || !db) {
      setPlayer(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'players', playerId), (docSnap) => {
      if (docSnap.exists()) {
        setPlayer({ id: docSnap.id, ...docSnap.data() } as Player);
      } else {
        setPlayer(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [playerId]);

  return { player, loading };
}

// Hook to get bid history
export function useBidHistory(playerId?: string) {
  const [history, setHistory] = useState<BidHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    // Reset history when playerId changes
    setHistory([]);
    setLoading(true);

    let q;
    if (playerId) {
      // Query for specific player - filter first, then we'll sort in memory
      q = query(
        collection(db, 'bidHistory'),
        where('playerId', '==', playerId)
      );
    } else {
      q = query(collection(db, 'bidHistory'), orderBy('timestamp', 'desc'), limit(20));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyData: BidHistory[] = [];
      snapshot.forEach((doc) => {
        historyData.push({ id: doc.id, ...doc.data() } as BidHistory);
      });

      // Sort by timestamp desc and limit if filtering by playerId
      if (playerId) {
        historyData.sort((a, b) => {
          const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : a.timestamp.toDate().getTime();
          const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : b.timestamp.toDate().getTime();
          return timeB - timeA;
        });
        setHistory(historyData.slice(0, 10));
      } else {
        setHistory(historyData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [playerId]);

  return { history, loading };
}

// Hook to get a specific team
export function useTeam(teamId: string | undefined) {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId || !db) {
      setTeam(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'teams', teamId), (docSnap) => {
      if (docSnap.exists()) {
        setTeam({ id: docSnap.id, ...docSnap.data() } as Team);
      } else {
        setTeam(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [teamId]);

  return { team, loading };
}

// Admin actions
export async function addPlayer(playerData: Omit<Player, 'id' | 'createdAt'>) {
  if (!db) throw new Error('Database not initialized');
  const docRef = await addDoc(collection(db, 'players'), {
    ...playerData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updatePlayer(playerId: string, data: Partial<Player>) {
  if (!db) throw new Error('Database not initialized');
  await updateDoc(doc(db, 'players', playerId), data);
}

export async function deletePlayer(playerId: string) {
  if (!db) throw new Error('Database not initialized');
  await deleteDoc(doc(db, 'players', playerId));
}

export async function addTeam(teamData: Omit<Team, 'id' | 'createdAt'>) {
  if (!db) throw new Error('Database not initialized');
  const docRef = await addDoc(collection(db, 'teams'), {
    ...teamData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateTeam(teamId: string, data: Partial<Team>) {
  if (!db) throw new Error('Database not initialized');
  await updateDoc(doc(db, 'teams', teamId), data);
}

export async function deleteTeam(teamId: string) {
  if (!db) throw new Error('Database not initialized');
  await deleteDoc(doc(db, 'teams', teamId));
}

export async function addOwner(ownerData: Omit<Owner, 'id' | 'createdAt'>) {
  if (!db) throw new Error('Database not initialized');
  const docRef = await addDoc(collection(db, 'owners'), {
    ...ownerData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateOwner(ownerId: string, data: Partial<Owner>) {
  if (!db) throw new Error('Database not initialized');
  await updateDoc(doc(db, 'owners', ownerId), data);
}

export async function deleteOwner(ownerId: string) {
  if (!db) throw new Error('Database not initialized');
  await deleteDoc(doc(db, 'owners', ownerId));
}

export async function initializeAuctionSettings() {
  if (!db) throw new Error('Database not initialized');
  const settingsRef = doc(db, 'auctionSettings', 'current');

  await setDoc(settingsRef, {
    isActive: false,
    currentPlayer: null,
    bidIncrement: 5,
    auctionStartTime: null,
    auctionEndTime: null,
  });
}

export async function updateAuctionSettings(data: Partial<AuctionSettings>) {
  if (!db) throw new Error('Database not initialized');
  await updateDoc(doc(db, 'auctionSettings', 'current'), data);
}

export async function startPlayerAuction(playerId: string) {
  if (!db) throw new Error('Database not initialized');
  const database = db;
  await runTransaction(database, async (transaction) => {
    const playerRef = doc(database, 'players', playerId);
    const settingsRef = doc(database, 'auctionSettings', 'current');

    transaction.update(playerRef, {
      status: 'bidding',
      currentBid: 0,
      biddingTeam: null,
    });

    transaction.update(settingsRef, {
      currentPlayer: playerId,
      isActive: true,
    });
  });
}

export async function placeBid(
  playerId: string,
  playerName: string,
  teamId: string,
  teamName: string,
  bidAmount: number
) {
  if (!db) throw new Error('Database not initialized');
  const database = db;
  await runTransaction(database, async (transaction) => {
    const playerRef = doc(database, 'players', playerId);
    const teamRef = doc(database, 'teams', teamId);

    const playerDoc = await transaction.get(playerRef);
    const teamDoc = await transaction.get(teamRef);

    if (!playerDoc.exists() || !teamDoc.exists()) {
      throw new Error('Player or team not found');
    }

    const teamData = teamDoc.data();
    if (teamData.remainingBudget < bidAmount) {
      throw new Error('Insufficient budget');
    }

    transaction.update(playerRef, {
      currentBid: bidAmount,
      biddingTeam: teamId,
    });

    // Add to bid history
    const bidHistoryRef = doc(collection(database, 'bidHistory'));
    transaction.set(bidHistoryRef, {
      playerId,
      playerName,
      teamId,
      teamName,
      bidAmount,
      timestamp: serverTimestamp(),
    });
  });
}

export async function markPlayerSold(playerId: string) {
  if (!db) throw new Error('Database not initialized');
  const database = db;
  await runTransaction(database, async (transaction) => {
    const playerRef = doc(database, 'players', playerId);
    const playerDoc = await transaction.get(playerRef);

    if (!playerDoc.exists()) {
      throw new Error('Player not found');
    }

    const playerData = playerDoc.data();
    if (!playerData.biddingTeam) {
      throw new Error('No team has bid on this player');
    }

    const teamRef = doc(database, 'teams', playerData.biddingTeam);
    const teamDoc = await transaction.get(teamRef);

    if (!teamDoc.exists()) {
      throw new Error('Team not found');
    }

    const teamData = teamDoc.data();

    // Update player
    transaction.update(playerRef, {
      status: 'sold',
      soldTo: playerData.biddingTeam,
    });

    // Update team
    transaction.update(teamRef, {
      remainingBudget: teamData.remainingBudget - playerData.currentBid,
      players: [...teamData.players, playerId],
    });

    // Add sold event to bid history
    const soldHistoryRef = doc(collection(database, 'bidHistory'));
    transaction.set(soldHistoryRef, {
      playerId,
      playerName: playerData.name,
      teamId: playerData.biddingTeam,
      teamName: teamData.teamName,
      bidAmount: playerData.currentBid,
      timestamp: serverTimestamp(),
      type: 'sold', // Mark this as a sold event
    });

    // Clear current player from auction settings
    const settingsRef = doc(database, 'auctionSettings', 'current');
    transaction.update(settingsRef, {
      currentPlayer: null,
    });
  });
}

export async function markPlayerUnsold(playerId: string) {
  if (!db) throw new Error('Database not initialized');
  const database = db;
  await runTransaction(database, async (transaction) => {
    const playerRef = doc(database, 'players', playerId);

    transaction.update(playerRef, {
      status: 'unsold',
      currentBid: 0,
      biddingTeam: null,
    });

    // Clear current player from auction settings
    const settingsRef = doc(database, 'auctionSettings', 'current');
    transaction.update(settingsRef, {
      currentPlayer: null,
    });
  });
}

export async function resetAllData() {
  if (!db) throw new Error('Database not initialized');
  const database = db;

  // Delete all players
  const playersSnapshot = await getDocs(collection(database, 'players'));
  const playerDeletes = playersSnapshot.docs.map((doc) => deleteDoc(doc.ref));

  // Delete all teams
  const teamsSnapshot = await getDocs(collection(database, 'teams'));
  const teamDeletes = teamsSnapshot.docs.map((doc) => deleteDoc(doc.ref));

  // Delete all owners
  const ownersSnapshot = await getDocs(collection(database, 'owners'));
  const ownerDeletes = ownersSnapshot.docs.map((doc) => deleteDoc(doc.ref));

  // Delete all bid history
  const bidHistorySnapshot = await getDocs(collection(database, 'bidHistory'));
  const bidDeletes = bidHistorySnapshot.docs.map((doc) => deleteDoc(doc.ref));

  // Wait for all deletions
  await Promise.all([...playerDeletes, ...teamDeletes, ...ownerDeletes, ...bidDeletes]);

  // Reset auction settings
  await setDoc(doc(database, 'auctionSettings', 'current'), {
    isActive: false,
    currentPlayer: null,
    bidIncrement: 5,
    auctionStartTime: null,
    auctionEndTime: null,
  });
}
