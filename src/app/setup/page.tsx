'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, doc, setDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SAMPLE_TEAMS, DEFAULT_TEAM_BUDGET, MAX_PLAYERS_PER_TEAM, PLAYER_ROLES } from '@/utils/constants';
import { generateId } from '@/utils/helpers';
import toast, { Toaster } from 'react-hot-toast';
import { Database, Users, User, Settings, CheckCircle, ArrowRight } from 'lucide-react';

const SAMPLE_PLAYERS = [
  { name: 'Virat Sharma', role: PLAYER_ROLES.BATSMAN, basePrice: 20, age: 28, matches: 150, speciality: 'Right-hand batsman, Captain' },
  { name: 'Rohit Patel', role: PLAYER_ROLES.BATSMAN, basePrice: 18, age: 30, matches: 140, speciality: 'Right-hand opening batsman' },
  { name: 'Shubman Verma', role: PLAYER_ROLES.BATSMAN, basePrice: 15, age: 23, matches: 60, speciality: 'Right-hand top-order batsman' },
  { name: 'Rishabh Kumar', role: PLAYER_ROLES.WICKET_KEEPER, basePrice: 16, age: 25, matches: 80, speciality: 'Left-hand batsman, Wicket-keeper' },
  { name: 'KL Singh', role: PLAYER_ROLES.WICKET_KEEPER, basePrice: 14, age: 29, matches: 90, speciality: 'Right-hand batsman, Wicket-keeper' },
  { name: 'Hardik Yadav', role: PLAYER_ROLES.ALL_ROUNDER, basePrice: 17, age: 27, matches: 100, speciality: 'Right-hand batsman, Medium-fast bowler' },
  { name: 'Ravindra Pandya', role: PLAYER_ROLES.ALL_ROUNDER, basePrice: 15, age: 32, matches: 180, speciality: 'Left-hand batsman, Left-arm spinner' },
  { name: 'Axar Chahal', role: PLAYER_ROLES.ALL_ROUNDER, basePrice: 12, age: 28, matches: 70, speciality: 'Left-hand batsman, Left-arm orthodox spinner' },
  { name: 'Jasprit Singh', role: PLAYER_ROLES.BOWLER, basePrice: 18, age: 28, matches: 90, speciality: 'Right-arm fast bowler' },
  { name: 'Mohammed Khan', role: PLAYER_ROLES.BOWLER, basePrice: 16, age: 30, matches: 120, speciality: 'Right-arm fast-medium bowler' },
  { name: 'Bhuvneshwar Shami', role: PLAYER_ROLES.BOWLER, basePrice: 14, age: 31, matches: 130, speciality: 'Right-arm medium-fast bowler, Swing specialist' },
  { name: 'Yuzvendra Thakur', role: PLAYER_ROLES.BOWLER, basePrice: 12, age: 31, matches: 85, speciality: 'Right-arm leg-break bowler' },
  { name: 'Kuldeep Chahar', role: PLAYER_ROLES.BOWLER, basePrice: 10, age: 27, matches: 45, speciality: 'Left-arm chinaman bowler' },
  { name: 'Shardul Siraj', role: PLAYER_ROLES.ALL_ROUNDER, basePrice: 11, age: 29, matches: 55, speciality: 'Right-arm medium-fast bowler, Lower-order batsman' },
  { name: 'Deepak Bumrah', role: PLAYER_ROLES.BOWLER, basePrice: 10, age: 26, matches: 40, speciality: 'Right-arm medium-fast bowler' },
  { name: 'Ishan Kishan', role: PLAYER_ROLES.WICKET_KEEPER, basePrice: 13, age: 24, matches: 35, speciality: 'Left-hand aggressive batsman, Wicket-keeper' },
  { name: 'Suryakumar Gill', role: PLAYER_ROLES.BATSMAN, basePrice: 16, age: 31, matches: 95, speciality: 'Right-hand batsman, 360-degree player' },
  { name: 'Shreyas Agarwal', role: PLAYER_ROLES.BATSMAN, basePrice: 14, age: 27, matches: 75, speciality: 'Right-hand middle-order batsman' },
  { name: 'Prithvi Rahul', role: PLAYER_ROLES.BATSMAN, basePrice: 12, age: 22, matches: 30, speciality: 'Right-hand opening batsman' },
  { name: 'Washington Ashwin', role: PLAYER_ROLES.ALL_ROUNDER, basePrice: 10, age: 23, matches: 25, speciality: 'Left-hand batsman, Right-arm off-spinner' },
];

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState({
    settings: false,
    teams: false,
    players: false,
  });
  const router = useRouter();

  const initializeAuctionSettings = async () => {
    if (!db) throw new Error('Database not initialized');
    try {
      await setDoc(doc(db, 'auctionSettings', 'current'), {
        isActive: false,
        currentPlayer: null,
        bidIncrement: 5,
        auctionStartTime: null,
        auctionEndTime: null,
      });
      return true;
    } catch (error) {
      console.error('Error initializing auction settings:', error);
      return false;
    }
  };

  const initializeTeams = async () => {
    if (!db) throw new Error('Database not initialized');
    try {
      for (const team of SAMPLE_TEAMS) {
        const teamId = generateId();
        await setDoc(doc(db, 'teams', teamId), {
          teamName: team.teamName,
          ownerName: team.ownerName,
          ownerEmail: team.ownerEmail,
          totalBudget: DEFAULT_TEAM_BUDGET,
          remainingBudget: DEFAULT_TEAM_BUDGET,
          players: [],
          maxPlayers: MAX_PLAYERS_PER_TEAM,
          createdAt: serverTimestamp(),
        });
      }
      return true;
    } catch (error) {
      console.error('Error initializing teams:', error);
      return false;
    }
  };

  const initializePlayers = async () => {
    if (!db) throw new Error('Database not initialized');
    try {
      for (const player of SAMPLE_PLAYERS) {
        const playerId = generateId();
        await setDoc(doc(db, 'players', playerId), {
          name: player.name,
          role: player.role,
          basePrice: player.basePrice,
          currentBid: 0,
          status: 'unsold',
          biddingTeam: null,
          soldTo: null,
          imageUrl: null,
          speciality: player.speciality,
          age: player.age,
          matches: player.matches,
          createdAt: serverTimestamp(),
        });
      }
      return true;
    } catch (error) {
      console.error('Error initializing players:', error);
      return false;
    }
  };

  const handleSetup = async () => {
    if (!db) {
      toast.error('Firebase not configured. Please set up your .env.local file first.');
      return;
    }

    setLoading(true);

    try {
      // Check if data already exists
      const teamsSnapshot = await getDocs(collection(db, 'teams'));
      const playersSnapshot = await getDocs(collection(db, 'players'));

      if (!teamsSnapshot.empty || !playersSnapshot.empty) {
        const confirm = window.confirm(
          'Data already exists in the database. Do you want to skip existing data and add more?'
        );
        if (!confirm) {
          setLoading(false);
          return;
        }
      }

      // Step 1: Initialize Auction Settings
      setStep(1);
      const settingsSuccess = await initializeAuctionSettings();
      if (settingsSuccess) {
        setCompleted((prev) => ({ ...prev, settings: true }));
        toast.success('Auction settings initialized!');
      }

      // Step 2: Initialize Teams
      setStep(2);
      if (teamsSnapshot.empty) {
        const teamsSuccess = await initializeTeams();
        if (teamsSuccess) {
          setCompleted((prev) => ({ ...prev, teams: true }));
          toast.success(`${SAMPLE_TEAMS.length} teams created!`);
        }
      } else {
        setCompleted((prev) => ({ ...prev, teams: true }));
        toast.success('Teams already exist, skipped!');
      }

      // Step 3: Initialize Players
      setStep(3);
      if (playersSnapshot.empty) {
        const playersSuccess = await initializePlayers();
        if (playersSuccess) {
          setCompleted((prev) => ({ ...prev, players: true }));
          toast.success(`${SAMPLE_PLAYERS.length} players added!`);
        }
      } else {
        setCompleted((prev) => ({ ...prev, players: true }));
        toast.success('Players already exist, skipped!');
      }

      setStep(4);
      toast.success('Setup completed successfully!');
    } catch (error: any) {
      toast.error(`Setup failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Database Setup</h1>
          <p className="text-gray-600 mt-2">Initialize your Cricket Auction database with sample data</p>
        </div>

        {/* Setup Steps */}
        <div className="space-y-4 mb-8">
          <div className={`p-4 rounded-lg border ${completed.settings ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <Settings className={`w-5 h-5 ${completed.settings ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="font-medium">Auction Settings</span>
              {completed.settings && <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />}
            </div>
            <p className="text-sm text-gray-600 mt-1">Configure initial auction parameters</p>
          </div>

          <div className={`p-4 rounded-lg border ${completed.teams ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <Users className={`w-5 h-5 ${completed.teams ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="font-medium">Teams ({SAMPLE_TEAMS.length} teams)</span>
              {completed.teams && <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />}
            </div>
            <p className="text-sm text-gray-600 mt-1">Create teams with {DEFAULT_TEAM_BUDGET} points budget each</p>
          </div>

          <div className={`p-4 rounded-lg border ${completed.players ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <User className={`w-5 h-5 ${completed.players ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="font-medium">Players ({SAMPLE_PLAYERS.length} players)</span>
              {completed.players && <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />}
            </div>
            <p className="text-sm text-gray-600 mt-1">Add sample players to the auction pool</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {step < 4 ? (
            <button
              onClick={handleSetup}
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Setting up... (Step {step}/3)
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  Initialize Database
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => router.push('/')}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              Go to Login
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => router.push('/')}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Skip Setup
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> Make sure you have configured your Firebase credentials in the <code>.env.local</code> file before running this setup. Copy <code>.env.local.example</code> and fill in your Firebase project details.
          </p>
        </div>
      </div>
    </div>
  );
}
