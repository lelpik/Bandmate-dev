import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import ProfileCard from '../components/ProfileCard';
import toast from 'react-hot-toast';



const ChatWindow = () => {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const { user } = useAuth();
  const messagesEndRef = React.useRef(null);
  const fileInputRef = React.useRef(null);

  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Fetch user details for header
    const fetchUser = async () => {
      try {
        const res = await api.get('/messages/conversations');
        const found = res.data.find(c => c.id === parseInt(userId));
        if (found) setOtherUser(found);
      } catch (error) {
        console.error('Error fetching user details', error);
      }
    };
    fetchUser();
    
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data);
    } catch (error) {
      console.error('Error fetching messages', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await api.post('/messages', {
        receiver_id: userId,
        content: newMessage,
        type: 'text'
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('receiver_id', userId);
    formData.append('type', 'audio');

    try {
      const res = await api.post('/messages', formData);
      setMessages([...messages, res.data]);
    } catch (error) {
      console.error('Error uploading audio', error);
      toast.error('Failed to upload audio');
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark relative">
      {/* Profile Modal */}
      {showProfile && otherUser && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowProfile(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm">
            <ProfileCard user={otherUser} isPreview={true} />
            <button 
              onClick={() => setShowProfile(false)}
              className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp-style Header */}
      {otherUser && (
        <div 
          className="flex items-center gap-4 p-3 bg-dark-light border-b border-white/10 shadow-sm cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => setShowProfile(true)}
        >
          <img
            src={otherUser.profile_picture || `https://ui-avatars.com/api/?name=${otherUser.username}&background=random`}
            alt={otherUser.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-bold text-white">{otherUser.nickname || otherUser.username}</h3>
             {/* Online status could go here */}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20">
        {messages.map(msg => {
          const isMe = msg.sender_id === user.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                isMe ? 'bg-primary text-white rounded-br-none' : 'bg-dark-light text-gray-200 rounded-bl-none'
              }`}>
                {msg.type === 'audio' ? (
                   <div className="flex items-center gap-2">
                     <span className="text-2xl">🎵</span>
                     <audio controls src={`http://localhost:3000/uploads/${msg.content}`} className="w-48 h-8" />
                   </div>
                ) : (
                  <p>{msg.content}</p>
                )}
                <span className="text-[10px] opacity-70 block text-right mt-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-dark-light border-t border-white/10 flex gap-2 items-center">
        <input
          type="file"
          accept="audio/*"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
          title="Send Audio File"
        >
          📎
        </button>
        
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-dark border border-gray-700 rounded-full focus:ring-2 focus:ring-primary outline-none text-white"
        />
        <button
          type="submit"
          className="p-2 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors w-10 h-10 flex items-center justify-center shadow-lg"
        >
          ➤
        </button>
      </form>
    </div>
  );
};

const MessagesLayout = () => {
  const { userId } = useParams();
  const [conversations, setConversations] = useState([]);
  const { user } = useAuth();

  // Poll for conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/messages/conversations');
        setConversations(res.data);
      } catch (error) {
        console.error('Error fetching conversations', error);
      }
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-dark overflow-hidden">
      {/* Sidebar - Conversation List */}
      <div className="w-1/4 min-w-[250px] border-r border-white/10 flex flex-col bg-dark-light/50">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <Link
              key={conv.id}
              to={`/messages/${conv.id}`}
              className={`flex items-center gap-3 p-3 hover:bg-white/5 border-b border-white/5 transition-colors ${
                parseInt(userId) === conv.id ? 'bg-white/10' : ''
              }`}
            >
              <img
                src={conv.profile_picture || `https://ui-avatars.com/api/?name=${conv.username}&background=random`}
                alt={conv.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold truncate text-white text-sm">{conv.nickname || conv.username}</h3>
                  <span className="text-[10px] text-gray-500">
                    {conv.last_message_time ? new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">{conv.last_message || 'Start a conversation'}</p>
              </div>
            </Link>
          ))}
          {conversations.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>No matches yet.</p>
              <Link to="/" className="text-primary hover:underline mt-2 block">Go swipe!</Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Chat Window */}
      <div className="flex-1 flex flex-col min-w-0 bg-dark">
        {userId ? (
          <ChatWindow key={userId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-xl">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Messages = () => {
  return (
    <Routes>
      <Route path="/" element={<MessagesLayout />} />
      <Route path="/:userId" element={<MessagesLayout />} />
    </Routes>
  );
};

export default Messages;
