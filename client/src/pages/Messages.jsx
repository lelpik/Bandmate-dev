import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import ProfileCard from '../components/ProfileCard';
import toast from 'react-hot-toast';

const ChatWindow = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const { user } = useAuth();
  const messagesEndRef = React.useRef(null);

  useEffect(() => {
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


  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-dark border border-white/10 rounded-xl overflow-hidden">
      {/* Simpler Header with Back Button */}
      <div className="flex items-center gap-4 p-4 bg-black border-b border-green-900/30 font-mono">
        <button onClick={() => navigate('/messages')} className="text-gray-500 hover:text-green-400">
          {"< BACK"}
        </button>
        {otherUser && (
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-green-500">Connected to: {otherUser.nickname || otherUser.username}</h3>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-black font-mono text-sm">
        {messages.map(msg => {
          const isMe = msg.sender_id === user.id;
          const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          const senderName = isMe ? "me" : (otherUser?.nickname || "them");
          
          return (
            <div key={msg.id} className="text-gray-300">
              <span className="text-gray-600">[{time}]</span>{" "}
              <span className={`${isMe ? 'text-green-500' : 'text-blue-500'} font-bold`}>
                {"<"}{senderName}{">"}
              </span>{" "}
              <span>{msg.content}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-dark-light border-t border-white/10 flex gap-2 items-center">

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Message..."
          className="flex-1 px-4 py-2 bg-dark border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};

const ConversationList = () => {
  const [conversations, setConversations] = useState([]);

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
  }, []);

  return (
    <div className="bg-dark-light rounded-xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white">Inbox</h2>
      </div>
      <div className="divide-y divide-green-900/30">
        {conversations.map(conv => (
          <Link
            key={conv.id}
            to={`/messages/${conv.id}`}
            className="block p-4 hover:bg-green-900/10 transition-colors font-mono"
          >
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="font-bold text-green-500 text-lg">
                 {conv.nickname || conv.username}
              </h3>
              <span className="text-xs text-gray-600">
                {conv.last_message_time ? new Date(conv.last_message_time).toLocaleDateString() : ''}
              </span>
            </div>
            <p className="text-gray-500 truncate text-sm">
               {">"} {conv.last_message || '...'}
            </p>
          </Link>
        ))}
        {conversations.length === 0 && (
          <div className="p-8 text-center text-gray-600 font-mono">
            [EMPTY INBOX]
          </div>
        )}
      </div>
    </div>
  );
};

const Messages = () => {
  return (
    <Routes>
      <Route path="/" element={<ConversationList />} />
      <Route path="/:userId" element={<ChatWindow />} />
    </Routes>
  );
};

export default Messages;
