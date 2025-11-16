'use client';

import { useState } from 'react';
import { X, Users, Edit2, Trash2, Save } from 'lucide-react';
import { Team, Owner } from '@/types';
import { formatLakhs } from '@/utils/helpers';
import toast from 'react-hot-toast';

interface ManageTeamsModalProps {
  teams: Team[];
  owners: Owner[];
  onClose: () => void;
  onUpdate: (teamId: string, data: Partial<Team>) => Promise<void>;
  onDelete: (teamId: string) => Promise<void>;
}

export default function ManageTeamsModal({ teams, owners, onClose, onUpdate, onDelete }: ManageTeamsModalProps) {
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Team>>({});
  const [loading, setLoading] = useState(false);

  const handleEdit = (team: Team) => {
    setEditingTeam(team.id);
    setEditData({
      teamName: team.teamName,
      ownerId: team.ownerId,
      ownerName: team.ownerName,
      remainingBudget: team.remainingBudget,
    });
  };

  const handleOwnerChange = (ownerId: string) => {
    const owner = owners.find((o) => o.id === ownerId);
    if (owner) {
      setEditData({
        ...editData,
        ownerId: owner.id,
        ownerName: owner.name,
      });
    }
  };

  const handleSave = async (teamId: string) => {
    setLoading(true);
    try {
      await onUpdate(teamId, editData);
      toast.success('Team updated successfully!');
      setEditingTeam(null);
    } catch (error) {
      toast.error('Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (team: Team) => {
    if (team.players.length > 0) {
      toast.error('Cannot delete team with players. Remove players first.');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete "${team.teamName}"? This action cannot be undone.`);
    if (!confirmed) return;

    setLoading(true);
    try {
      await onDelete(team.id);
      toast.success('Team deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Manage Teams
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {teams.length === 0 ? (
            <div className="text-center py-8 sm:py-10 text-gray-500">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm sm:text-base">No teams added yet</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {teams.map((team) => (
                <div key={team.id} className="border rounded-lg p-3 sm:p-4">
                  {editingTeam === team.id ? (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Team Name</label>
                          <input
                            type="text"
                            value={editData.teamName || ''}
                            onChange={(e) => setEditData({ ...editData, teamName: e.target.value })}
                            className="input-field text-sm sm:text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Owner</label>
                          <select
                            value={editData.ownerId || ''}
                            onChange={(e) => handleOwnerChange(e.target.value)}
                            className="input-field text-sm sm:text-base"
                          >
                            <option value="">Select owner...</option>
                            {owners.map((owner) => (
                              <option key={owner.id} value={owner.id}>
                                {owner.name} (@{owner.username})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Remaining Budget (Points)
                        </label>
                        <input
                          type="number"
                          value={editData.remainingBudget || 0}
                          onChange={(e) => setEditData({ ...editData, remainingBudget: Number(e.target.value) })}
                          className="input-field text-sm sm:text-base"
                          min={0}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingTeam(null)}
                          className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSave(team.id)}
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
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <h4 className="font-semibold text-base sm:text-lg">{team.teamName}</h4>
                          <span className="text-xs sm:text-sm bg-gray-100 px-2 py-1 rounded">
                            {team.players.length}/{team.maxPlayers} players
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <span className="text-gray-600">Owner:</span>
                            <p className="font-medium truncate">{team.ownerName}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Budget Left:</span>
                            <p className="font-medium text-primary">{formatLakhs(team.remainingBudget)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:ml-4 justify-end">
                        <button
                          onClick={() => handleEdit(team)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit team"
                        >
                          <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(team)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete team"
                          disabled={team.players.length > 0}
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
