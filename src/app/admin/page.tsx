'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  usePlayers,
  useTeams,
  useOwners,
  useAuctionSettings,
  useCurrentPlayer,
  useBidHistory,
  addPlayer,
  addTeam,
  addOwner,
  updatePlayer,
  updateTeam,
  updateOwner,
  deletePlayer,
  deleteTeam,
  deleteOwner,
  startPlayerAuction,
  placeBid,
  markPlayerSold,
  markPlayerUnsold,
  updateAuctionSettings,
  initializeAuctionSettings,
  resetAllData,
} from '@/lib/hooks';
import { Player, Team } from '@/types';
import {
  LogOut,
  Play,
  Pause,
  Square,
  Plus,
  Search,
  Gavel,
  Clock,
  Users,
  IndianRupee,
  User,
  X,
  Settings,
  UserPlus,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatLakhs, getRoleBadgeClass, getStatusColor, getStatusText, convertToDirectImageUrl, getTimeAgo } from '@/utils/helpers';
import { PLAYER_ROLES, BID_INCREMENTS, DEFAULT_TEAM_BUDGET, MAX_PLAYERS_PER_TEAM } from '@/utils/constants';
import AddPlayerModal from '@/components/admin/AddPlayerModal';
import AddTeamModal from '@/components/admin/AddTeamModal';
import TeamDetailModal from '@/components/admin/TeamDetailModal';
import ManageTeamsModal from '@/components/admin/ManageTeamsModal';
import ManageOwnersModal from '@/components/admin/ManageOwnersModal';
import ManagePlayersModal from '@/components/admin/ManagePlayersModal';

export default function AdminDashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const { players, loading: playersLoading } = usePlayers();
  const { teams, loading: teamsLoading } = useTeams();
  const { owners, loading: ownersLoading } = useOwners();
  const { settings, loading: settingsLoading } = useAuctionSettings();
  const { player: currentPlayer } = useCurrentPlayer(settings?.currentPlayer || null);
  const { history: bidHistory } = useBidHistory(currentPlayer?.id);
  const { history: allBidHistory } = useBidHistory(); // Get all recent bids

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [bidAmount, setBidAmount] = useState(0);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showManageTeamsModal, setShowManageTeamsModal] = useState(false);
  const [showManageOwnersModal, setShowManageOwnersModal] = useState(false);
  const [showManagePlayersModal, setShowManagePlayersModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedTeamForModal, setSelectedTeamForModal] = useState<Team | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileTab, setMobileTab] = useState<'auction' | 'players' | 'teams'>('auction');

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Update bid amount when current bid changes
  useEffect(() => {
    if (currentPlayer && settings) {
      setBidAmount(currentPlayer.currentBid + settings.bidIncrement);
    }
  }, [currentPlayer, settings]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const handleStartAuction = async () => {
    try {
      // If settings don't exist, initialize them first
      if (!settings) {
        await initializeAuctionSettings();
      }
      await updateAuctionSettings({ isActive: true, auctionStartTime: new Date() });
      toast.success('Auction started!');
    } catch (error) {
      console.error('Start auction error:', error);
      toast.error('Failed to start auction');
    }
  };

  const handlePauseAuction = async () => {
    try {
      await updateAuctionSettings({ isActive: false });
      toast.success('Auction paused');
    } catch (error) {
      toast.error('Failed to pause auction');
    }
  };

  const handleEndAuction = async () => {
    try {
      await updateAuctionSettings({
        isActive: false,
        currentPlayer: null,
        auctionEndTime: new Date(),
      });
      toast.success('Auction ended');
    } catch (error) {
      toast.error('Failed to end auction');
    }
  };

  const handleStartPlayerAuction = async (playerId: string) => {
    if (settings?.currentPlayer) {
      toast.error('Another player is currently being auctioned');
      return;
    }
    try {
      await startPlayerAuction(playerId);
      toast.success('Player auction started!');
    } catch (error) {
      toast.error('Failed to start player auction');
    }
  };

  const handlePlaceBid = async () => {
    if (!currentPlayer || !selectedTeam) {
      toast.error('Please select a team');
      return;
    }

    const team = teams.find((t) => t.id === selectedTeam);
    if (!team) {
      toast.error('Team not found');
      return;
    }

    // Check if the same team is trying to bid consecutively
    if (currentPlayer.biddingTeam === selectedTeam) {
      toast.error('Same team cannot bid consecutively. Another team must bid first.');
      return;
    }

    if (bidAmount > team.remainingBudget) {
      toast.error('Bid exceeds team budget');
      return;
    }

    if (bidAmount <= currentPlayer.currentBid) {
      toast.error('Bid must be higher than current bid');
      return;
    }

    try {
      await placeBid(currentPlayer.id, currentPlayer.name, selectedTeam, team.teamName, bidAmount);
      toast.success(`Bid placed: ${formatLakhs(bidAmount)} by ${team.teamName}`);
      setBidAmount(bidAmount + (settings?.bidIncrement || 5));
      setSelectedTeam(''); // Reset team selection after bid
    } catch (error: any) {
      toast.error(error.message || 'Failed to place bid');
    }
  };

  const handleMarkSold = async () => {
    if (!currentPlayer) return;
    if (!currentPlayer.biddingTeam) {
      toast.error('No team has bid on this player');
      return;
    }

    try {
      await markPlayerSold(currentPlayer.id);
      const team = teams.find((t) => t.id === currentPlayer.biddingTeam);
      toast.success(`${currentPlayer.name} sold to ${team?.teamName} for ${formatLakhs(currentPlayer.currentBid)}!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark player as sold');
    }
  };

  const handleMarkUnsold = async () => {
    if (!currentPlayer) return;

    try {
      await markPlayerUnsold(currentPlayer.id);
      toast.success(`${currentPlayer.name} marked as unsold`);
    } catch (error) {
      toast.error('Failed to mark player as unsold');
    }
  };

  const handleResetAllData = async () => {
    const confirmed = window.confirm(
      'WARNING: This will delete ALL data including players, teams, owners, and bid history. This action cannot be undone. Are you sure?'
    );
    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'This is your FINAL warning. All auction data will be permanently deleted. Type OK to proceed.'
    );
    if (!doubleConfirm) return;

    try {
      await resetAllData();
      toast.success('All data has been reset successfully!');
    } catch (error) {
      console.error('Reset error:', error);
      toast.error('Failed to reset data');
    }
  };

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || player.role === filterRole;
    const matchesStatus = filterStatus === 'all' || player.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const availableTeams = teams.filter(
    (team) => team.remainingBudget >= (bidAmount || settings?.bidIncrement || 5) && team.players.length < team.maxPlayers
  );

  if (authLoading || playersLoading || teamsLoading || ownersLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <h1 className="text-lg md:text-2xl font-bold text-primary">Cricket Auction</h1>
              <div
                className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm ${
                  settings?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${settings?.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                {settings?.isActive ? 'Live' : 'Off'}
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>

              <div className="flex items-center gap-1 md:gap-2">
                {!settings?.isActive ? (
                  <button onClick={handleStartAuction} className="btn-primary flex items-center gap-1 md:gap-2 text-xs md:text-sm py-1.5 md:py-2 px-2 md:px-4">
                    <Play className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Start</span>
                  </button>
                ) : (
                  <button onClick={handlePauseAuction} className="btn-secondary flex items-center gap-1 md:gap-2 text-xs md:text-sm py-1.5 md:py-2 px-2 md:px-4">
                    <Pause className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Pause</span>
                  </button>
                )}
                <button
                  onClick={handleEndAuction}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 md:py-2 px-2 md:px-4 rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                >
                  <Square className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">End</span>
                </button>
              </div>

              <button
                onClick={() => setShowManageOwnersModal(true)}
                className="hidden lg:flex items-center gap-2 text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                <UserPlus className="w-5 h-5" />
                Manage Owners
              </button>

              <button
                onClick={handleResetAllData}
                className="hidden lg:flex items-center gap-2 text-red-600 hover:text-red-700 border border-red-300 px-3 py-2 rounded-lg hover:bg-red-50"
                title="Reset all data"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>

              <button onClick={handleLogout} className="flex items-center gap-1 md:gap-2 text-gray-600 hover:text-gray-900">
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden bg-white border-b">
        <div className="flex">
          <button
            onClick={() => setMobileTab('auction')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${
              mobileTab === 'auction' ? 'border-primary text-primary' : 'border-transparent text-gray-600'
            }`}
          >
            <Gavel className="w-4 h-4 mx-auto mb-1" />
            Auction
          </button>
          <button
            onClick={() => setMobileTab('players')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${
              mobileTab === 'players' ? 'border-primary text-primary' : 'border-transparent text-gray-600'
            }`}
          >
            <User className="w-4 h-4 mx-auto mb-1" />
            Players
          </button>
          <button
            onClick={() => setMobileTab('teams')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${
              mobileTab === 'teams' ? 'border-primary text-primary' : 'border-transparent text-gray-600'
            }`}
          >
            <Users className="w-4 h-4 mx-auto mb-1" />
            Teams
          </button>
        </div>
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)]">
        {/* Left Panel - Auction Control */}
        <div className={`${mobileTab === 'auction' ? 'block' : 'hidden'} lg:block w-full lg:w-[30%] p-4 overflow-y-auto border-r bg-white`}>
          <h2 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
            <Gavel className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            Auction Control
          </h2>

          {currentPlayer ? (
            <div className="space-y-4">
              {/* Current Player Card */}
              <div className="card border-2 border-primary">
                <div className="text-center mb-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center overflow-hidden avatar-container">
                    {currentPlayer.imageUrl ? (
                      <img src={convertToDirectImageUrl(currentPlayer.imageUrl)} alt={currentPlayer.name} className="rounded-full" />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold">{currentPlayer.name}</h3>
                  <span className={`badge ${getRoleBadgeClass(currentPlayer.role)}`}>{currentPlayer.role}</span>
                  <p className="text-gray-600 mt-1">Age: {currentPlayer.age}</p>
                </div>

                <div className="bg-secondary/10 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600">Current Bid</p>
                  <p className="text-3xl font-bold text-secondary animate-bid-update">
                    {currentPlayer.currentBid > 0 ? formatLakhs(currentPlayer.currentBid) : 'No bids yet'}
                  </p>
                  {currentPlayer.biddingTeam && (
                    <p className="text-sm text-gray-600 mt-1">
                      by {teams.find((t) => t.id === currentPlayer.biddingTeam)?.teamName}
                    </p>
                  )}
                </div>

                {/* Bid History for Current Player Only */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Bids for {currentPlayer.name}</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {bidHistory.slice(0, 10).map((bid) => (
                      <div
                        key={bid.id}
                        className={`text-xs p-2 rounded ${
                          bid.type === 'sold' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{bid.teamName}</span>
                          <span className={bid.type === 'sold' ? 'text-green-600 font-semibold' : ''}>
                            {formatLakhs(bid.bidAmount)}
                          </span>
                        </div>
                        {bid.type === 'sold' && (
                          <span className="text-green-600 font-semibold">SOLD!</span>
                        )}
                      </div>
                    ))}
                    {bidHistory.length === 0 && <p className="text-xs text-gray-500">No bids yet for this player</p>}
                  </div>
                </div>
              </div>

              {/* Bid Controls */}
              <div className="card">
                <h4 className="font-medium mb-3">Place Bid</h4>

                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1">Select Team</label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Choose team...</option>
                    {availableTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.teamName} ({formatLakhs(team.remainingBudget)} left)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1">Bid Amount (Points)</label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="input-field"
                    min={currentPlayer.currentBid + 1}
                  />
                </div>

                <div className="flex gap-2 mb-3">
                  {BID_INCREMENTS.map((increment) => (
                    <button
                      key={increment}
                      onClick={() => setBidAmount(currentPlayer.currentBid + increment)}
                      className="flex-1 py-1 px-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      +{increment}
                    </button>
                  ))}
                </div>

                <button onClick={handlePlaceBid} className="w-full btn-primary mb-2">
                  Place Bid
                </button>

                <div className="flex gap-2">
                  <button onClick={handleMarkSold} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg">
                    Sold
                  </button>
                  <button onClick={handleMarkUnsold} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg">
                    Unsold
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-10">
              <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No player selected</p>
              <p className="text-sm text-gray-400">Click on a player from the pool to start auction</p>
            </div>
          )}
        </div>

        {/* Center Panel - Player Pool */}
        <div className={`${mobileTab === 'players' ? 'block' : 'hidden'} lg:block w-full lg:w-[40%] p-4 overflow-y-auto bg-gray-50`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-semibold">Players ({players.length})</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowManagePlayersModal(true)}
                className="flex items-center gap-1 text-xs md:text-sm py-1 px-2 md:px-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Manage Players"
              >
                <Settings className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              <button
                onClick={() => setShowAddPlayerModal(true)}
                className="btn-primary flex items-center gap-1 md:gap-2 text-xs md:text-sm py-1 px-2 md:px-3"
              >
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="input-field text-sm py-1"
              >
                <option value="all">All Roles</option>
                {Object.values(PLAYER_ROLES).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field text-sm py-1"
              >
                <option value="all">All Status</option>
                <option value="unsold">Unsold</option>
                <option value="bidding">Bidding</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>

          {/* Player Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredPlayers.map((player) => (
              <div
                key={player.id}
                onClick={() => player.status === 'unsold' && handleStartPlayerAuction(player.id)}
                className={`card p-3 cursor-pointer transition-all hover:shadow-lg ${
                  player.status === 'unsold' ? 'hover:border-primary border-2 border-transparent' : 'opacity-75'
                } ${currentPlayer?.id === player.id ? 'border-2 border-primary' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden avatar-container">
                    {player.imageUrl ? (
                      <img src={convertToDirectImageUrl(player.imageUrl)} alt={player.name} />
                    ) : (
                      <User className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(player.status)}`}></div>
                </div>

                <h4 className="font-semibold text-sm truncate">{player.name}</h4>
                <span className={`badge text-xs ${getRoleBadgeClass(player.role)}`}>{player.role}</span>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{formatLakhs(player.basePrice)}</span>
                  <span className="text-xs text-gray-500">{getStatusText(player.status)}</span>
                </div>

                {player.soldTo && (
                  <p className="text-xs text-blue-600 mt-1 truncate">
                    Sold to: {teams.find((t) => t.id === player.soldTo)?.teamName}
                  </p>
                )}
              </div>
            ))}
          </div>

          {filteredPlayers.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <p>No players found</p>
            </div>
          )}
        </div>

        {/* Right Panel - Teams Overview */}
        <div className={`${mobileTab === 'teams' ? 'block' : 'hidden'} lg:block w-full lg:w-[30%] p-4 overflow-y-auto bg-white`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              Teams ({teams.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowManageOwnersModal(true)}
                className="lg:hidden flex items-center gap-1 text-xs md:text-sm py-1 px-2 md:px-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Manage Owners"
              >
                <UserPlus className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              <button
                onClick={() => setShowManageTeamsModal(true)}
                className="flex items-center gap-1 text-xs md:text-sm py-1 px-2 md:px-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Manage Teams"
              >
                <Settings className="w-3 h-3 md:w-4 md:h-4" />
              </button>
              <button
                onClick={() => setShowAddTeamModal(true)}
                className="btn-primary flex items-center gap-1 text-xs md:text-sm py-1 px-2 md:px-3"
              >
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
                Add
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {teams.map((team) => {
              const teamPlayers = players.filter((p) => team.players.includes(p.id));
              return (
                <div
                  key={team.id}
                  onClick={() => {
                    setSelectedTeamForModal(team);
                    setShowTeamModal(true);
                  }}
                  className="card p-4 cursor-pointer hover:shadow-lg transition-all border-l-4 border-primary"
                >
                  <h4 className="font-semibold mb-2">{team.teamName}</h4>
                  <p className="text-sm text-gray-600 mb-3">{team.ownerName}</p>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Budget Left</span>
                    <span className="text-lg font-bold text-primary">{formatLakhs(team.remainingBudget)}</span>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Players</span>
                    <span className="font-medium">
                      {team.players.length}/{team.maxPlayers}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-secondary h-2 rounded-full transition-all"
                      style={{
                        width: `${((team.totalBudget - team.remainingBudget) / team.totalBudget) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(((team.totalBudget - team.remainingBudget) / team.totalBudget) * 100)}% spent
                  </p>

                  {/* Show sold players with prices */}
                  {teamPlayers.length > 0 && (
                    <div className="mt-3 border-t pt-2">
                      <p className="text-xs font-medium text-gray-600 mb-1">Purchased Players:</p>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {teamPlayers.slice(0, 3).map((player) => (
                          <div key={player.id} className="flex justify-between text-xs">
                            <span className="truncate">{player.name}</span>
                            <span className="font-semibold text-primary">{formatLakhs(player.currentBid)}</span>
                          </div>
                        ))}
                        {teamPlayers.length > 3 && (
                          <p className="text-xs text-gray-500">+{teamPlayers.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {teams.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No teams added yet</p>
            </div>
          )}

          {/* Recent Bid History */}
          {teams.length > 0 && allBidHistory.length > 0 && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3">Recent Bid History</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allBidHistory.slice(0, 10).map((bid) => (
                  <div
                    key={bid.id}
                    className={`text-xs p-2 rounded ${
                      bid.type === 'sold' ? 'bg-green-50 border border-green-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{bid.playerName}</span>
                        {bid.type === 'sold' && (
                          <span className="ml-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                            SOLD
                          </span>
                        )}
                      </div>
                      <span className={`font-semibold ${bid.type === 'sold' ? 'text-green-600' : 'text-primary'}`}>
                        {formatLakhs(bid.bidAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-500 mt-0.5">
                      <span>{bid.teamName}</span>
                      <span>
                        {bid.timestamp && getTimeAgo(bid.timestamp instanceof Date ? bid.timestamp : bid.timestamp.toDate())}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddPlayerModal && (
        <AddPlayerModal
          onClose={() => setShowAddPlayerModal(false)}
          onAdd={async (playerData) => {
            await addPlayer(playerData);
            toast.success('Player added successfully!');
            setShowAddPlayerModal(false);
          }}
        />
      )}

      {showAddTeamModal && (
        <AddTeamModal
          owners={owners}
          onClose={() => setShowAddTeamModal(false)}
          onAdd={async (teamData) => {
            await addTeam(teamData);
            toast.success('Team added successfully!');
            setShowAddTeamModal(false);
          }}
        />
      )}

      {showManageTeamsModal && (
        <ManageTeamsModal
          teams={teams}
          owners={owners}
          onClose={() => setShowManageTeamsModal(false)}
          onUpdate={async (teamId, data) => {
            await updateTeam(teamId, data);
          }}
          onDelete={async (teamId) => {
            await deleteTeam(teamId);
          }}
        />
      )}

      {showTeamModal && selectedTeamForModal && (
        <TeamDetailModal
          team={selectedTeamForModal}
          players={players.filter((p) => selectedTeamForModal.players.includes(p.id))}
          onClose={() => {
            setShowTeamModal(false);
            setSelectedTeamForModal(null);
          }}
        />
      )}

      {showManageOwnersModal && (
        <ManageOwnersModal
          owners={owners}
          onClose={() => setShowManageOwnersModal(false)}
          onAdd={async (ownerData) => {
            await addOwner(ownerData);
          }}
          onUpdate={async (ownerId, data) => {
            await updateOwner(ownerId, data);
          }}
          onDelete={async (ownerId) => {
            await deleteOwner(ownerId);
          }}
        />
      )}

      {showManagePlayersModal && (
        <ManagePlayersModal
          players={players}
          onClose={() => setShowManagePlayersModal(false)}
          onUpdate={async (playerId, data) => {
            await updatePlayer(playerId, data);
          }}
          onDelete={async (playerId) => {
            await deletePlayer(playerId);
          }}
        />
      )}
    </div>
  );
}
