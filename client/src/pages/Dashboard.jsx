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

import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { user } = useAuth();
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
            const isViewingChat = location.pathname === `/messages/${conv.id}`;
            
            if (oldConv && conv.last_message !== oldConv.last_message && !isViewingChat) {
              toast.success(`New message from ${conv.nickname || conv.username}: ${conv.last_message}`, {
                icon: '💬',
                duration: 4000,
                onClick: () => window.location.href = `/messages/${conv.id}`
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
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto p-4 md:p-6">
        <Routes>
          <Route path="/" element={<Matching />} />
          <Route path="/messages/*" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
