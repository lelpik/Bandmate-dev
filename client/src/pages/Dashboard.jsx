import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Matching from './Matching';
import Messages from './Messages';
import Notifications from './Notifications';
import Profile from './Profile';
import Settings from './Settings';
import api from '../api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Global Notification Polling
  useEffect(() => {
    let lastData = [];
    const fetchConversations = async () => {
      try {
        const res = await api.get('/messages/conversations');
        const newData = res.data;
        
        if (lastData.length > 0) {
          newData.forEach(conv => {
            const oldConv = lastData.find(c => c.id === conv.id);
            // Check if there is a new message AND we are not currently viewing this conversation
            // We check location.pathname to see if we are in this specific chat
            const isViewingChat = location.pathname === `/messages/${conv.id}`;
            
            if (oldConv && conv.last_message !== oldConv.last_message && !isViewingChat) {
              toast.success(`New message from ${conv.nickname || conv.username}: ${conv.last_message}`, {
                icon: '💬',
                duration: 4000,
                onClick: () => window.location.href = `/messages/${conv.id}` // Simple redirect
              });
            }
          });
        }
        
        lastData = newData;
      } catch (error) {
        console.error('Error fetching conversations', error);
      }
    };

    // Initial fetch
    fetchConversations();
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, [location.pathname]); // Re-run check when path changes to update "isViewingChat" logic

  const navItems = [
    { path: '/', label: 'Discover', icon: '🎵' },
    { path: '/messages', label: 'Messages', icon: '💬' },
    { path: '/notifications', label: 'Matches', icon: '💖' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="flex h-screen bg-dark">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-dark-light border-r border-white/10 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Bandmate
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                (item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path))
                  ? 'bg-primary/10 text-primary' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3 px-2">
            <img 
              src={user?.profile_picture || `https://ui-avatars.com/api/?name=${user?.username}&background=random`} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover border border-white/10"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.nickname || user?.username}</p>
              <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
            </div>
          </div>

          {/* Settings & Logout */}
          <div className="space-y-1">
            <Link 
              to="/settings"
              className={`w-full px-4 py-2 text-sm rounded-lg transition-colors text-left flex items-center gap-3 ${
                location.pathname === '/settings' ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>⚙️</span>
              Settings
            </Link>
            <button 
              onClick={logout} 
              className="w-full px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left flex items-center gap-3"
            >
              <span>🚪</span>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Matching />} />
            <Route path="/messages/*" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
