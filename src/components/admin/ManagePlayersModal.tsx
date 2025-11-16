'use client';

import { useState } from 'react';
import { X, Users, Edit2, Trash2, Save, User } from 'lucide-react';
import { Player } from '@/types';
import { formatLakhs, getRoleBadgeClass, convertToDirectImageUrl } from '@/utils/helpers';
import { PLAYER_ROLES } from '@/utils/constants';
import toast from 'react-hot-toast';

interface ManagePlayersModalProps {
  players: Player[];
  onClose: () => void;
  onUpdate: (playerId: string, data: Partial<Player>) => Promise<void>;
  onDelete: (playerId: string) => Promise<void>;
}

export default function ManagePlayersModal({ players, onClose, onUpdate, onDelete }: ManagePlayersModalProps) {
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Player>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (player: Player) => {
    setEditingPlayer(player.id);
    setEditData({
      name: player.name,
      role: player.role,
      age: player.age,
      imageUrl: player.imageUrl,
    });
  };

  const handleSave = async (playerId: string) => {
    setLoading(true);
    try {
      await onUpdate(playerId, editData);
      toast.success('Player updated successfully!');
      setEditingPlayer(null);
    } catch (error) {
      toast.error('Failed to update player');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (player: Player) => {
    if (player.status === 'sold') {
      toast.error('Cannot delete sold player. Remove from team first.');
      return;
    }

    if (player.status === 'bidding') {
      toast.error('Cannot delete player currently in auction.');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete "${player.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    setLoading(true);
    try {
      await onDelete(player.id);
      toast.success('Player deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete player');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Manage Players ({players.length})
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 sm:p-4 border-b">
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field text-sm sm:text-base"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-8 sm:py-10 text-gray-500">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm sm:text-base">No players found</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredPlayers.map((player) => (
                <div key={player.id} className="border rounded-lg p-3 sm:p-4">
                  {editingPlayer === player.id ? (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={editData.name || ''}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="input-field text-sm sm:text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Role</label>
                          <select
                            value={editData.role || ''}
                            onChange={(e) => setEditData({ ...editData, role: e.target.value as any })}
                            className="input-field text-sm sm:text-base"
                          >
                            {Object.values(PLAYER_ROLES).map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Age</label>
                          <input
                            type="number"
                            value={editData.age || 0}
                            onChange={(e) => setEditData({ ...editData, age: Number(e.target.value) })}
                            className="input-field text-sm sm:text-base"
                            min={10}
                            max={60}
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
                          <input
                            type="text"
                            value={player.status}
                            className="input-field bg-gray-100 text-sm sm:text-base"
                            disabled
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Image URL</label>
                        <input
                          type="text"
                          value={editData.imageUrl || ''}
                          onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
                          className="input-field text-sm sm:text-base"
                          placeholder="Google Drive or direct image URL"
                        />
                        {editData.imageUrl && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Image Preview:</p>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full overflow-hidden avatar-container flex-shrink-0">
                                <img
                                  src={convertToDirectImageUrl(editData.imageUrl)}
                                  alt="Preview"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                  onLoad={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'block';
                                  }}
                                />
                              </div>
                              <div className="text-xs text-gray-500 overflow-hidden">
                                <p>Converted URL:</p>
                                <p className="font-mono break-all text-[10px] sm:text-xs">{convertToDirectImageUrl(editData.imageUrl)}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingPlayer(null)}
                          className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSave(player.id)}
                          disabled={loading}
                          className="px-3 py-1.5 text-xs sm:text-sm bg-primary text-white rounded hover:bg-primary/90 flex items-center gap-1"
                        >
                          <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {player.imageUrl ? (
                            <img
                              src={convertToDirectImageUrl(player.imageUrl)}
                              alt={player.name}
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
                          <div>
                            <span className="text-xs sm:text-sm text-gray-600">Name</span>
                            <p className="font-medium text-sm sm:text-base truncate">{player.name}</p>
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm text-gray-600">Role</span>
                            <p>
                              <span className={`badge text-xs ${getRoleBadgeClass(player.role)}`}>{player.role}</span>
                            </p>
                          </div>
                          <div className="hidden sm:block">
                            <span className="text-xs sm:text-sm text-gray-600">Age</span>
                            <p className="font-medium text-sm sm:text-base">{player.age}</p>
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm text-gray-600">Status</span>
                            <p className="font-medium capitalize text-sm sm:text-base">{player.status}</p>
                          </div>
                          <div className="hidden md:block">
                            <span className="text-xs sm:text-sm text-gray-600">Current Bid</span>
                            <p className="font-medium text-primary text-sm sm:text-base">{formatLakhs(player.currentBid)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:ml-4 justify-end">
                        <button
                          onClick={() => handleEdit(player)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit player"
                        >
                          <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(player)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete player"
                          disabled={player.status !== 'unsold'}
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t">
          <button
            onClick={onClose}
            className="w-full py-2.5 sm:py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
