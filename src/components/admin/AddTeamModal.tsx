'use client';

import { useState } from 'react';
import { X, Users } from 'lucide-react';
import { Team, Owner } from '@/types';
import { DEFAULT_TEAM_BUDGET, MAX_PLAYERS_PER_TEAM } from '@/utils/constants';

interface AddTeamModalProps {
  owners: Owner[];
  onClose: () => void;
  onAdd: (team: Omit<Team, 'id' | 'createdAt'>) => Promise<void>;
}

export default function AddTeamModal({ owners, onClose, onAdd }: AddTeamModalProps) {
  const [formData, setFormData] = useState({
    teamName: '',
    ownerId: '',
    totalBudget: DEFAULT_TEAM_BUDGET,
    maxPlayers: MAX_PLAYERS_PER_TEAM,
  });
  const [loading, setLoading] = useState(false);

  const selectedOwner = owners.find((o) => o.id === formData.ownerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOwner) {
      return;
    }

    setLoading(true);

    try {
      await onAdd({
        ...formData,
        ownerName: selectedOwner.name,
        remainingBudget: formData.totalBudget,
        players: [],
      });
    } catch (error) {
      console.error('Failed to add team:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Add New Team
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Team Name *</label>
            <input
              type="text"
              value={formData.teamName}
              onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
              className="input-field"
              placeholder="e.g., Thunder Strikers"
              required
              minLength={3}
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Select Owner *</label>
            {owners.length === 0 ? (
              <div className="p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs sm:text-sm text-yellow-800">
                No owners available. Please add owners first from the "Manage Owners" section.
              </div>
            ) : (
              <select
                value={formData.ownerId}
                onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                className="input-field text-sm sm:text-base"
                required
              >
                <option value="">Choose an owner...</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} (@{owner.username})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Budget (Points) *
              </label>
              <input
                type="number"
                value={formData.totalBudget}
                onChange={(e) => setFormData({ ...formData, totalBudget: Number(e.target.value) })}
                className="input-field text-sm sm:text-base"
                min={10}
                max={10000}
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Max Players *</label>
              <input
                type="number"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({ ...formData, maxPlayers: Number(e.target.value) })}
                className="input-field text-sm sm:text-base"
                min={5}
                max={25}
                required
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-gray-600">
            <p>
              <strong>Note:</strong> The team will start with a remaining budget equal to the total
              budget ({formData.totalBudget} points) and can acquire up to {formData.maxPlayers}{' '}
              players.
            </p>
          </div>

          <div className="flex gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 sm:py-2 px-3 sm:px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || owners.length === 0 || !formData.ownerId}
              className="flex-1 btn-primary disabled:opacity-50 text-sm sm:text-base py-2.5 sm:py-2"
            >
              {loading ? 'Adding...' : 'Add Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
