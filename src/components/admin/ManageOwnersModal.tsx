'use client';

import { useState } from 'react';
import { X, UserPlus, Edit2, Trash2, Save, Eye, EyeOff } from 'lucide-react';
import { Owner } from '@/types';
import toast from 'react-hot-toast';

interface ManageOwnersModalProps {
  owners: Owner[];
  onClose: () => void;
  onAdd: (owner: Omit<Owner, 'id' | 'createdAt'>) => Promise<void>;
  onUpdate: (ownerId: string, data: Partial<Owner>) => Promise<void>;
  onDelete: (ownerId: string) => Promise<void>;
}

export default function ManageOwnersModal({
  owners,
  onClose,
  onAdd,
  onUpdate,
  onDelete,
}: ManageOwnersModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOwner, setNewOwner] = useState({ name: '', username: '', password: '' });
  const [editingOwner, setEditingOwner] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Owner>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});

  const handleAdd = async () => {
    if (!newOwner.name || !newOwner.username || !newOwner.password) {
      toast.error('All fields are required');
      return;
    }

    // Check for duplicate username
    if (owners.some((o) => o.username === newOwner.username)) {
      toast.error('Username already exists');
      return;
    }

    setLoading(true);
    try {
      await onAdd(newOwner);
      toast.success('Owner added successfully!');
      setNewOwner({ name: '', username: '', password: '' });
      setShowAddForm(false);
    } catch (error) {
      toast.error('Failed to add owner');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (owner: Owner) => {
    setEditingOwner(owner.id);
    setEditData({
      name: owner.name,
      username: owner.username,
      password: owner.password,
    });
  };

  const handleSave = async (ownerId: string) => {
    setLoading(true);
    try {
      await onUpdate(ownerId, editData);
      toast.success('Owner updated successfully!');
      setEditingOwner(null);
    } catch (error) {
      toast.error('Failed to update owner');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (owner: Owner) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete owner "${owner.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      await onDelete(owner.id);
      toast.success('Owner deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete owner');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Manage Owners
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {/* Add New Owner Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-3 sm:mb-4 py-2.5 sm:py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              Add New Owner
            </button>
          )}

          {/* Add Owner Form */}
          {showAddForm && (
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Add New Owner</h4>
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                  <input
                    type="text"
                    value={newOwner.name}
                    onChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })}
                    className="input-field text-sm sm:text-base"
                    placeholder="e.g., Rajesh Kumar"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input
                    type="text"
                    value={newOwner.username}
                    onChange={(e) => setNewOwner({ ...newOwner, username: e.target.value })}
                    className="input-field text-sm sm:text-base"
                    placeholder="e.g., rajesh123"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="text"
                    value={newOwner.password}
                    onChange={(e) => setNewOwner({ ...newOwner, password: e.target.value })}
                    className="input-field text-sm sm:text-base"
                    placeholder="Enter password"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={loading}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-primary text-white rounded hover:bg-primary/90"
                  >
                    {loading ? 'Adding...' : 'Add Owner'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Owners List */}
          {owners.length === 0 ? (
            <div className="text-center py-8 sm:py-10 text-gray-500">
              <UserPlus className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm sm:text-base">No owners added yet</p>
              <p className="text-xs sm:text-sm">Add owners first, then assign them to teams</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {owners.map((owner) => (
                <div key={owner.id} className="border rounded-lg p-3 sm:p-4">
                  {editingOwner === owner.id ? (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
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
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Username</label>
                          <input
                            type="text"
                            value={editData.username || ''}
                            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                            className="input-field text-sm sm:text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Password</label>
                          <input
                            type="text"
                            value={editData.password || ''}
                            onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                            className="input-field text-sm sm:text-base"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingOwner(null)}
                          className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSave(owner.id)}
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
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                          <span className="text-xs sm:text-sm text-gray-600">Name</span>
                          <p className="font-medium text-sm sm:text-base truncate">{owner.name}</p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm text-gray-600">Username</span>
                          <p className="font-medium text-sm sm:text-base truncate">{owner.username}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-xs sm:text-sm text-gray-600">Password</span>
                          <div className="flex items-center gap-2">
                            <p className="font-medium font-mono text-sm sm:text-base">
                              {showPassword[owner.id] ? owner.password : '••••••••'}
                            </p>
                            <button
                              onClick={() => togglePasswordVisibility(owner.id)}
                              className="text-gray-400 hover:text-gray-600 p-1"
                            >
                              {showPassword[owner.id] ? (
                                <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                              ) : (
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:ml-4 justify-end">
                        <button
                          onClick={() => handleEdit(owner)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit owner"
                        >
                          <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(owner)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete owner"
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
