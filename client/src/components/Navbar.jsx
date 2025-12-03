import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Discover', icon: '🎵' },
    { path: '/messages', label: 'Messages', icon: '💬' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="bg-black border-b border-green-900 px-4 py-3 flex items-center justify-between font-mono">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold text-green-500">
          bandmate_alpha
        </h1>
        
        <div className="flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm ${
                (item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path))
                  ? 'text-green-400 underline decoration-green-500' 
                  : 'text-gray-500 hover:text-green-300'
              }`}
            >
              [{item.label.toUpperCase()}]
            </Link>
          ))}
        </div>
      </div>

      <div>
        <button 
          onClick={logout} 
          className="text-sm text-red-500 hover:text-red-400 hover:underline"
        >
          [LOGOUT]
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
