import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import ProfileCard from '../components/ProfileCard';

const Matching = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPreferences, setShowPreferences] = useState(true);
  const [preferences, setPreferences] = useState({
    instruments: [],
    genres: []
  });

  const availableInstruments = ['Guitar', 'Bass', 'Drums', 'Vocals', 'Piano', 'Keys', 'Saxophone', 'Trumpet'];
  const availableGenres = ['Rock', 'Jazz', 'Blues', 'Funk', 'Metal', 'Pop', 'Indie', 'Folk'];

  useEffect(() => {
    if (!showPreferences) {
      fetchProfiles();
    }
  }, [showPreferences]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/discover');
      let filteredProfiles = res.data;

      // Apply client-side filtering based on preferences
      if (preferences.instruments.length > 0) {
        filteredProfiles = filteredProfiles.filter(p => 
          p.instruments && p.instruments.some(i => preferences.instruments.includes(i))
        );
      }
      if (preferences.genres.length > 0) {
        filteredProfiles = filteredProfiles.filter(p => 
          p.genres && p.genres.some(g => preferences.genres.includes(g))
        );
      }

      setProfiles(filteredProfiles);
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
      
      // Log Analytics
      api.logEvent('swipe', { likee_id: currentProfile.id, action });
      
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

  const togglePreference = (type, value) => {
    setPreferences(prev => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  if (showPreferences) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <div className="bg-dark-light p-8 rounded-3xl max-w-md w-full border border-white/10 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">What are you looking for?</h2>
          
          <div className="mb-6">
            <h3 className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wider">Instruments</h3>
            <div className="flex flex-wrap gap-2">
              {availableInstruments.map(inst => (
                <button
                  key={inst}
                  onClick={() => togglePreference('instruments', inst)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    preferences.instruments.includes(inst)
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'bg-dark border border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {inst}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wider">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {availableGenres.map(genre => (
                <button
                  key={genre}
                  onClick={() => togglePreference('genres', genre)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    preferences.genres.includes(genre)
                      ? 'bg-secondary text-white shadow-lg shadow-secondary/25'
                      : 'bg-dark border border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowPreferences(false)}
            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            Start Matching
          </button>
        </div>
      </div>
    );
  }

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
            setShowPreferences(true);
          }}
          className="px-6 py-2 bg-dark-light border border-gray-700 rounded-lg text-white hover:bg-dark-light/80"
        >
          Update Preferences
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

      <div className="flex gap-6">
        <button
          onClick={() => handleSwipe('pass')}
          className="w-16 h-16 rounded-full bg-dark-light border-2 border-red-500 text-red-500 text-3xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg hover:scale-110"
        >
          ✕
        </button>
        <button
          onClick={() => handleSwipe('like')}
          className="w-16 h-16 rounded-full bg-dark-light border-2 border-green-500 text-green-500 text-3xl flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-lg hover:scale-110"
        >
          ♥
        </button>
      </div>
    </div>
  );
};

export default Matching;
