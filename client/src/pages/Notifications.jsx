import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      // Filter only matches
      const matches = res.data.filter(n => n.type === 'match');
      setNotifications(matches);
    } catch (error) {
      console.error('Error fetching notifications', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await api.put(`/notifications/${notification.id}/read`);
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, is_read: 1 } : n
        ));
      }
      
      // Navigate to chat
      navigate(`/messages/${notification.related_id}`);
    } catch (error) {
      console.error('Error handling notification click', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 px-4">Matches</h2>
      <div className="flex-1 overflow-y-auto px-4 space-y-3">
        {notifications.map(notification => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`p-4 rounded-xl border transition-colors cursor-pointer ${
              notification.is_read 
                ? 'bg-dark-light border-transparent opacity-60' 
                : 'bg-dark-light border-primary/50 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl shadow-lg">
                💖
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-lg">{notification.content}</p>
                <span className="text-xs text-gray-400">
                  {new Date(notification.created_at).toLocaleDateString()} • Tap to chat
                </span>
              </div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-6xl mb-4 opacity-20">💖</div>
            <p className="text-xl">No matches yet</p>
            <p className="text-sm mt-2">Go swipe to find your bandmates!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
