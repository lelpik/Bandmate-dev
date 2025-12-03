import React, { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/account', {
        email,
        currentPassword,
        newPassword: newPassword || undefined // Only send if changed
      });
      
      await refreshUser();
      toast.success('Account settings updated!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      console.error('Update failed', error);
      toast.error(error.response?.data?.error || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-8 text-white">Account Settings</h2>
      
      <div className="bg-dark-light p-8 rounded-2xl border border-white/10 shadow-xl">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-white transition-all"
              placeholder="your@email.com"
            />
          </div>

          <div className="pt-4 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-white transition-all"
                  placeholder="Required to make changes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-white transition-all"
                  placeholder="Leave blank to keep current"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
