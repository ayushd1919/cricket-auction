'use client';

import { X, User, IndianRupee } from 'lucide-react';
import { Team, Player } from '@/types';
import { formatLakhs, getRoleBadgeClass } from '@/utils/helpers';

interface TeamDetailModalProps {
  team: Team;
  players: Player[];
  onClose: () => void;
}

export default function TeamDetailModal({ team, players, onClose }: TeamDetailModalProps) {
  const totalSpent = team.totalBudget - team.remainingBudget;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">{team.teamName}</h3>
            <p className="text-sm text-gray-600">{team.ownerName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Team Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-xl font-bold text-primary">{formatLakhs(team.totalBudget)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-xl font-bold text-green-600">{formatLakhs(team.remainingBudget)}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">Spent</p>
              <p className="text-xl font-bold text-orange-600">{formatLakhs(totalSpent)}</p>
            </div>
          </div>

          {/* Players List */}
          <div>
            <h4 className="font-semibold mb-3">
              Team Roster ({players.length}/{team.maxPlayers})
            </h4>

            {players.length > 0 ? (
              <div className="space-y-2">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <span className={`badge text-xs ${getRoleBadgeClass(player.role)}`}>{player.role}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{formatLakhs(player.currentBid)}</p>
                      <p className="text-xs text-gray-500">Purchase Price</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No players purchased yet</p>
              </div>
            )}
          </div>

          {/* Role Distribution */}
          {players.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Role Distribution</h4>
              <div className="grid grid-cols-3 gap-3">
                {['Batsman', 'Bowler', 'All-rounder'].map((role) => {
                  const count = players.filter((p) => p.role === role).length;
                  return (
                    <div key={role} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{count}</p>
                      <p className="text-xs text-gray-600">{role}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <button onClick={onClose} className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
