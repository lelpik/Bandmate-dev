import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Allowed Domains Check
    const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'proton.me', 'aol.com'];
    const domain = email.split('@')[1];
    if (!allowedDomains.includes(domain)) {
        setError(`Email provider not allowed. Please use a major provider (e.g., Gmail, Yahoo, Outlook).`);
        return;
    }

    // Password Strength Validation
    if (password.length < 7) {
      setError('Password must be at least 7 characters long');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    try {
      await register(username, email, password);
      navigate('/setup');
    } catch (err) {
      setError('Registration failed. Email or username may be taken.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark">
      <div className="w-full max-w-md p-8 space-y-6 bg-dark-light rounded-2xl shadow-xl border border-white/10">
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Bandmate
        </h2>
        <h3 className="text-xl text-center text-gray-400">Create Account</h3>
        
        {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 mt-1 bg-dark/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 bg-dark/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 bg-dark/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 font-bold text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:opacity-90 transition-opacity"
          >
            Sign Up
          </button>
        </form>
        
        <p className="text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
