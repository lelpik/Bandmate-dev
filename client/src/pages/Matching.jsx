import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import ProfileCard from '../components/ProfileCard';

const Matching = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/discover');
      setProfiles(res.data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action) => {
    if (currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    try {
      const res = await api.post('/matches/swipe', {
        likee_id: currentProfile.id,
        action
      });
      
      if (res.data.isMatch) {
        toast.success(`You matched with ${currentProfile.nickname || currentProfile.username}!`, {
          duration: 4000,
          icon: '🎉',
        });
      }

      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error swiping', error);
      toast.error('Failed to swipe');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full text-white">Loading...</div>;

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="text-6xl mb-4">🎵</div>
        <h2 className="text-2xl font-bold text-white mb-2">No more profiles!</h2>
        <p className="text-gray-400 mb-6">Check back later for more musicians.</p>
        <button 
          onClick={() => {
            setCurrentIndex(0);
            fetchProfiles();
          }}
          className="px-6 py-2 bg-dark-light border border-gray-700 rounded-lg text-white hover:bg-dark-light/80"
        >
          Refresh
        </button>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="w-full max-w-sm mb-6">
        <ProfileCard user={currentProfile} isPreview={true} />
      </div>

      <div className="flex gap-6 w-full max-w-sm">
        <button
          onClick={() => handleSwipe('pass')}
          className="flex-1 py-4 border border-red-900 text-red-500 hover:bg-red-900/20 font-mono font-bold"
        >
          [PASS]
        </button>
        <button
          onClick={() => handleSwipe('like')}
          className="flex-1 py-4 border border-green-900 text-green-500 hover:bg-green-900/20 font-mono font-bold"
        >
          [LIKE]
        </button>
      </div>
    </div>
  );
};

export default Matching;
