import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const INSTRUMENTS = ['Guitar', 'Piano', 'Drums', 'Bass', 'Vocals', 'Violin', 'Saxophone'];
const GENRES = ['Rock', 'Jazz', 'Pop', 'Metal', 'Classical', 'Blues', 'Electronic'];
const INTERESTS = ['Songwriting', 'Jamming', 'Recording', 'Touring', 'Covers', 'Originals', 'Teaching'];

const ProfileSetup = () => {
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedInstruments, setSelectedInstruments] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [location, setLocation] = useState({ lat: null, lon: null });
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setAge(user.age || '');
      setUsername(user.username || '');
      setNickname(user.nickname || '');
      
      const parseList = (list) => {
        if (Array.isArray(list)) return list;
        if (typeof list === 'string') {
          try { return JSON.parse(list); } catch (e) { return []; }
        }
        return [];
      };

      setSelectedInstruments(parseList(user.instruments));
      setSelectedGenres(parseList(user.genres));
      setSelectedInterests(parseList(user.interests));
      setLocation({ lat: user.location_lat, lon: user.location_lon });
      setPreviewImage(user.profile_picture);
    }
  }, [user]);

  const toggleSelection = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      if (list.length < 5) {
        setList([...list, item]);
      }
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location", error);
        }
      );
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    if (!age) {
        toast.error('Age is required');
        return;
      }
      
      if (selectedGenres.length === 0) {
        toast.error('Please select at least one genre');
        return;
      }

      const formData = new FormData();
      formData.append('bio', bio);
      formData.append('age', age);
      formData.append('username', username);
      formData.append('nickname', nickname);
      formData.append('instruments', JSON.stringify(selectedInstruments));
      formData.append('genres', JSON.stringify(selectedGenres));
      formData.append('interests', JSON.stringify(selectedInterests));
      if (location.lat) formData.append('location_lat', location.lat);
      if (location.lon) formData.append('location_lon', location.lon);
      if (profileImage) formData.append('profile_picture', profileImage);

      await api.put('/users/me', formData);
      await refreshUser();
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update profile', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-dark p-8">
      <div className="max-w-2xl mx-auto bg-dark-light rounded-2xl p-8 shadow-xl border border-white/10">
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Edit Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center mb-6">
            <div 
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 cursor-pointer relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              <img 
                src={previewImage || `https://ui-avatars.com/api/?name=${user?.username}&background=random`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-2xl">📷</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
            <p className="text-gray-400 text-sm mt-2">Tap to change photo</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-dark/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nickname (Optional)</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2 bg-dark/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-white"
                placeholder="Display Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-2 bg-dark/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-white"
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
              <button
                type="button"
                onClick={getLocation}
                className="w-full px-4 py-2 bg-dark/50 border border-gray-700 rounded-lg hover:bg-dark/80 text-white flex items-center justify-center gap-2"
              >
                📍 {location.lat ? 'Update Location' : 'Get Location'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2 bg-dark/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary outline-none text-white h-32"
              placeholder="Tell us about your musical journey..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Instruments (Max 5)</label>
            <div className="flex flex-wrap gap-2">
              {INSTRUMENTS.map(inst => (
                <button
                  key={inst}
                  type="button"
                  onClick={() => toggleSelection(selectedInstruments, setSelectedInstruments, inst)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedInstruments.includes(inst)
                      ? 'bg-primary text-white'
                      : 'bg-dark/50 text-gray-400 hover:bg-dark/80'
                  }`}
                >
                  {inst}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Genres (Max 5)</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleSelection(selectedGenres, setSelectedGenres, genre)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedGenres.includes(genre)
                      ? 'bg-secondary text-white'
                      : 'bg-dark/50 text-gray-400 hover:bg-dark/80'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Interests (Max 5)</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleSelection(selectedInterests, setSelectedInterests, item)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedInterests.includes(item)
                      ? 'bg-accent text-white'
                      : 'bg-dark/50 text-gray-400 hover:bg-dark/80'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex-1 py-3 font-bold text-white bg-dark border border-gray-600 rounded-lg hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 font-bold text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:opacity-90 transition-opacity"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
