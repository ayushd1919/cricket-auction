'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  usePlayers,
  useTeams,
  useAuctionSettings,
  useCurrentPlayer,
  useBidHistory,
  useTeam,
} from '@/lib/hooks';
import {
  LogOut,
  Tv,
  Users,
  UserCircle,
  ListChecks,
  IndianRupee,
  User,
  Search,
  Clock,
  Gavel,
} from 'lucide-react';
import { formatLakhs, getRoleBadgeClass, getStatusColor, getStatusText, getTimeAgo, convertToDirectImageUrl } from '@/utils/helpers';
import { PLAYER_ROLES } from '@/utils/constants';

export default function OwnerDashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const { players, loading: playersLoading } = usePlayers();
  const { teams, loading: teamsLoading } = useTeams();
  const { settings, loading: settingsLoading } = useAuctionSettings();
  const { player: currentPlayer } = useCurrentPlayer(settings?.currentPlayer || null);
  const { history: allBids } = useBidHistory();
  const { history: currentPlayerBids } = useBidHistory(settings?.currentPlayer || undefined);
  const { team: myTeam } = useTeam(user?.teamId);

  // Use current player bids when a player is selected, otherwise show all recent bids
  const recentBids = settings?.currentPlayer ? currentPlayerBids : allBids;

  const [activeTab, setActiveTab] = useState<'live' | 'myteam' | 'allteams' | 'allplayers'>('live');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTeamDetail, setSelectedTeamDetail] = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'owner')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || player.role === filterRole;
    const matchesStatus = filterStatus === 'all' || player.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const myTeamPlayers = players.filter((p) => myTeam?.players.includes(p.id));

  if (authLoading || playersLoading || teamsLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <div>
                <h1 className="text-base md:text-xl font-bold text-primary">{myTeam?.teamName || 'Team Dashboard'}</h1>
                <p className="text-xs md:text-sm text-gray-600 hidden sm:block">{user?.teamName || 'Owner'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
              <div className="text-center">
                <p className="text-xs md:text-sm text-gray-600">Budget</p>
                <p className="text-lg md:text-2xl font-bold text-primary">{formatLakhs(myTeam?.remainingBudget || 0)}</p>
              </div>

              <div className="text-center hidden sm:block">
                <p className="text-xs md:text-sm text-gray-600">Players</p>
                <p className="text-base md:text-lg font-semibold">
                  {myTeam?.players.length || 0}/{myTeam?.maxPlayers || 15}
                </p>
              </div>

              <button onClick={handleLogout} className="flex items-center gap-1 md:gap-2 text-gray-600 hover:text-gray-900">
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex">
            {[
              { id: 'live', label: 'Live', fullLabel: 'Live Auction', icon: Tv },
              { id: 'myteam', label: 'Team', fullLabel: 'My Team', icon: UserCircle },
              { id: 'allteams', label: 'Teams', fullLabel: 'All Teams', icon: Users },
              { id: 'allplayers', label: 'Players', fullLabel: 'All Players', icon: ListChecks },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 md:flex-none flex flex-col md:flex-row items-center gap-1 md:gap-2 px-2 md:px-6 py-2 md:py-3 border-b-2 transition-colors text-xs md:text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="md:hidden">{tab.label}</span>
                <span className="hidden md:inline">{tab.fullLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Live Auction Tab */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            {/* Auction Status */}
            <div
              className={`p-4 rounded-lg text-center ${
                settings?.isActive
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${settings?.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
                ></div>
                <span className="font-semibold">
                  {settings?.isActive ? 'Auction in Progress' : 'Auction Not Active'}
                </span>
              </div>
            </div>

            {/* Current Player */}
            {currentPlayer ? (
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                <h2 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
                  <Gavel className="w-4 h-4 md:w-5 md:h-5 text-secondary animate-bounce" />
                  Currently Auctioning
                </h2>

                <div className="flex flex-col items-center gap-4 md:gap-6">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden avatar-container">
                    {currentPlayer.imageUrl ? (
                      <img
                        src={convertToDirectImageUrl(currentPlayer.imageUrl)}
                        alt={currentPlayer.name}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
                    )}
                  </div>

                  <div className="text-center flex-1">
                    <h3 className="text-xl md:text-2xl font-bold mb-2">{currentPlayer.name}</h3>
                    <span className={`badge ${getRoleBadgeClass(currentPlayer.role)}`}>{currentPlayer.role}</span>
                    <p className="text-sm md:text-base text-gray-600 mt-2">
                      Age: {currentPlayer.age}
                    </p>
                  </div>

                  <div className="bg-secondary/10 rounded-xl p-4 md:p-6 text-center w-full md:min-w-[200px]">
                    <p className="text-xs md:text-sm text-gray-600 mb-1">Current Bid</p>
                    <p className="text-3xl md:text-4xl font-bold text-secondary animate-pulse-slow">
                      {currentPlayer.currentBid > 0 ? formatLakhs(currentPlayer.currentBid) : 'No bids'}
                    </p>
                    {currentPlayer.biddingTeam && (
                      <p className="text-xs md:text-sm text-gray-600 mt-2">
                        by <span className="font-semibold">{teams.find((t) => t.id === currentPlayer.biddingTeam)?.teamName}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600">Waiting for Next Player</h3>
                <p className="text-gray-500 mt-2">The admin will select the next player to auction</p>
              </div>
            )}

            {/* Recent Bid Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                {settings?.currentPlayer ? 'Player Bid History' : 'Recent Bid Activity'}
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {recentBids.length > 0 ? (
                  recentBids.map((bid) => (
                    <div
                      key={bid.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        bid.type === 'sold' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{bid.playerName}</p>
                          {bid.type === 'sold' && (
                            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded font-semibold">
                              SOLD
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{bid.teamName}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${bid.type === 'sold' ? 'text-green-600' : 'text-primary'}`}>
                          {formatLakhs(bid.bidAmount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {bid.timestamp && getTimeAgo(bid.timestamp instanceof Date ? bid.timestamp : bid.timestamp.toDate())}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No bids yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* My Team Tab */}
        {activeTab === 'myteam' && myTeam && (
          <div className="space-y-4 md:space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="card text-center p-3 md:p-6">
                <p className="text-xs md:text-sm text-gray-600">Players</p>
                <p className="text-2xl md:text-3xl font-bold text-primary">{myTeamPlayers.length}</p>
              </div>
              <div className="card text-center p-3 md:p-6">
                <p className="text-xs md:text-sm text-gray-600">Budget Left</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600">{formatLakhs(myTeam.remainingBudget)}</p>
              </div>
              <div className="card text-center p-3 md:p-6">
                <p className="text-xs md:text-sm text-gray-600">Spent</p>
                <p className="text-2xl md:text-3xl font-bold text-orange-600">
                  {formatLakhs(myTeam.totalBudget - myTeam.remainingBudget)}
                </p>
              </div>
              <div className="card text-center p-3 md:p-6">
                <p className="text-xs md:text-sm text-gray-600">Slots Left</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-600">{myTeam.maxPlayers - myTeamPlayers.length}</p>
              </div>
            </div>

            {/* Team Roster */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">My Team Roster</h3>

              {myTeamPlayers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Player</th>
                        <th className="text-left py-3 px-4">Role</th>
                        <th className="text-left py-3 px-4">Age</th>
                        <th className="text-left py-3 px-4">Matches</th>
                        <th className="text-right py-3 px-4">Purchase Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myTeamPlayers.map((player) => (
                        <tr key={player.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden avatar-container">
                                {player.imageUrl ? (
                                  <img src={convertToDirectImageUrl(player.imageUrl)} alt={player.name} />
                                ) : (
                                  <User className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                              <span className="font-medium">{player.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`badge ${getRoleBadgeClass(player.role)}`}>{player.role}</span>
                          </td>
                          <td className="py-3 px-4">{player.age}</td>
                          <td className="py-3 px-4">{player.matches}</td>
                          <td className="py-3 px-4 text-right font-semibold text-primary">
                            {formatLakhs(player.currentBid)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No players purchased yet</p>
                </div>
              )}
            </div>

            {/* Role Distribution */}
            {myTeamPlayers.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Team Composition</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.values(PLAYER_ROLES).map((role) => {
                    const count = myTeamPlayers.filter((p) => p.role === role).length;
                    const percentage = myTeamPlayers.length > 0 ? Math.round((count / myTeamPlayers.length) * 100) : 0;

                    return (
                      <div key={role} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`badge ${getRoleBadgeClass(role)}`}>{role}</span>
                          <span className="text-2xl font-bold">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{percentage}% of team</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* All Teams Tab */}
        {activeTab === 'allteams' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {teams.map((team) => {
              const teamPlayers = players.filter((p) => team.players.includes(p.id));
              const isExpanded = selectedTeamDetail === team.id;

              return (
                <div key={team.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div
                    onClick={() => setSelectedTeamDetail(isExpanded ? null : team.id)}
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">{team.teamName}</h3>
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          team.id === user?.teamId ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {team.id === user?.teamId ? 'Your Team' : 'Opponent'}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{team.ownerName}</p>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Budget Left</span>
                        <span className="font-semibold text-primary">{formatLakhs(team.remainingBudget)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Players</span>
                        <span className="font-semibold">
                          {team.players.length}/{team.maxPlayers}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-secondary h-2 rounded-full"
                          style={{ width: `${((team.totalBudget - team.remainingBudget) / team.totalBudget) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && teamPlayers.length > 0 && (
                    <div className="border-t bg-gray-50 p-4">
                      <h4 className="font-semibold mb-3">Team Roster</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {teamPlayers.map((player) => (
                          <div key={player.id} className="flex items-center justify-between bg-white p-2 rounded">
                            <div>
                              <p className="text-sm font-medium">{player.name}</p>
                              <span className={`badge text-xs ${getRoleBadgeClass(player.role)}`}>{player.role}</span>
                            </div>
                            <span className="text-sm font-semibold">{formatLakhs(player.currentBid)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* All Players Tab */}
        {activeTab === 'allplayers' && (
          <div className="space-y-4 md:space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-lg p-3 md:p-4">
              <div className="flex flex-col gap-3 md:gap-4">
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
                <div className="flex gap-2">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="input-field flex-1 text-sm"
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
                    className="input-field flex-1 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="unsold">Unsold</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredPlayers.map((player) => (
                <div key={player.id} className="bg-white rounded-xl shadow-lg p-3 md:p-4">
                  <div className="flex items-start justify-between mb-2 md:mb-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden avatar-container">
                      {player.imageUrl ? (
                        <img src={convertToDirectImageUrl(player.imageUrl)} alt={player.name} />
                      ) : (
                        <User className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                      )}
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(player.status)}`}></div>
                  </div>

                  <h4 className="font-semibold text-sm md:text-base mb-1 truncate">{player.name}</h4>
                  <span className={`badge text-xs ${getRoleBadgeClass(player.role)}`}>{player.role}</span>

                  <div className="mt-2 md:mt-3 space-y-1 md:space-y-2">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-600">Age</span>
                      <span>{player.age}</span>
                    </div>

                    {player.status === 'sold' && (
                      <div className="border-t pt-1 md:pt-2">
                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="text-gray-600">Sold</span>
                          <span className="font-semibold text-primary">{formatLakhs(player.currentBid)}</span>
                        </div>
                        <p className="text-xs text-blue-600 truncate mt-1">
                          {teams.find((t) => t.id === player.soldTo)?.teamName}
                        </p>
                      </div>
                    )}

                    <div className="pt-1 md:pt-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          player.status === 'sold'
                            ? 'bg-blue-100 text-blue-800'
                            : player.status === 'bidding'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {getStatusText(player.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPlayers.length === 0 && (
              <div className="text-center py-10 bg-white rounded-xl shadow-lg">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No players found matching your criteria</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
