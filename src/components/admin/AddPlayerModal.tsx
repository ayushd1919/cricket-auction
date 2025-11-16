'use client';

import { useState } from 'react';
import { X, User } from 'lucide-react';
import { PLAYER_ROLES } from '@/utils/constants';
import { Player } from '@/types';

interface AddPlayerModalProps {
  onClose: () => void;
  onAdd: (player: Omit<Player, 'id' | 'createdAt'>) => Promise<void>;
}

export default function AddPlayerModal({ onClose, onAdd }: AddPlayerModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    role: string;
    age: number;
    imageUrl: string;
  }>({
    name: '',
    role: PLAYER_ROLES.BATSMAN,
    age: 25,
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onAdd({
        ...formData,
        basePrice: 0,
        matches: 0,
        speciality: '',
        currentBid: 0,
        status: 'unsold',
        biddingTeam: null,
        soldTo: null,
        imageUrl: formData.imageUrl || null,
      });
    } catch (error) {
      console.error('Failed to add player:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-base sm:text-lg font-semibold">Add New Player</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Player Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Enter player name"
              required
              minLength={3}
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input-field text-sm sm:text-base"
              required
            >
              {Object.values(PLAYER_ROLES).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Age *</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
              className="input-field text-sm sm:text-base"
              min={15}
              max={50}
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="input-field text-sm sm:text-base"
              placeholder="https://example.com/image.jpg"
            />
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
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 text-sm sm:text-base py-2.5 sm:py-2"
            >
              {loading ? 'Adding...' : 'Add Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
