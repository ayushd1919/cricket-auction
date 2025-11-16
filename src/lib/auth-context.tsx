'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { User, Owner, Team } from '@/types';
import { ADMIN_CREDENTIALS } from '@/utils/constants';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInAsAdmin: (username: string, password: string) => Promise<boolean>;
  signInAsOwner: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for admin session
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
      setUser(JSON.parse(adminSession));
      setLoading(false);
      return;
    }

    // Check localStorage for owner session
    const ownerSession = localStorage.getItem('ownerSession');
    if (ownerSession) {
      setUser(JSON.parse(ownerSession));
      setLoading(false);
      return;
    }

    setLoading(false);
  }, []);

  const signInAsAdmin = async (username: string, password: string): Promise<boolean> => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const adminUser: User = {
        uid: 'admin',
        email: null,
        role: 'admin',
      };
      localStorage.setItem('adminSession', JSON.stringify(adminUser));
      setUser(adminUser);
      return true;
    }
    return false;
  };

  const signInAsOwner = async (username: string, password: string): Promise<boolean> => {
    if (!db) {
      console.error('Firestore not initialized');
      return false;
    }
    try {
      // Query owners collection for matching username
      const ownersRef = collection(db, 'owners');
      const q = query(ownersRef, where('username', '==', username));
      const ownerSnapshot = await getDocs(q);

      if (ownerSnapshot.empty) {
        console.error('Owner not found');
        return false;
      }

      const ownerDoc = ownerSnapshot.docs[0];
      const ownerData = ownerDoc.data() as Owner;

      // Check password
      if (ownerData.password !== password) {
        console.error('Invalid password');
        return false;
      }

      // Find the team associated with this owner
      const teamsRef = collection(db, 'teams');
      const teamQuery = query(teamsRef, where('ownerId', '==', ownerDoc.id));
      const teamSnapshot = await getDocs(teamQuery);

      let teamId = null;
      let teamName = null;

      if (!teamSnapshot.empty) {
        const teamDoc = teamSnapshot.docs[0];
        const teamData = teamDoc.data() as Team;
        teamId = teamDoc.id;
        teamName = teamData.teamName;
      }

      const ownerUser: User = {
        uid: ownerDoc.id,
        email: null,
        role: 'owner',
        teamId: teamId || undefined,
        teamName: teamName || undefined,
      };

      localStorage.setItem('ownerSession', JSON.stringify(ownerUser));
      setUser(ownerUser);
      return true;
    } catch (error) {
      console.error('Owner sign in error:', error);
      return false;
    }
  };

  const signOut = async () => {
    if (user?.role === 'admin') {
      localStorage.removeItem('adminSession');
    } else if (user?.role === 'owner') {
      localStorage.removeItem('ownerSession');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInAsAdmin, signInAsOwner, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
