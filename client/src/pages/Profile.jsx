import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6">
      <div className="relative w-full max-w-sm">
        <ProfileCard user={user} isPreview={true} />
        
        <Link 
          to="/setup" 
          className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-3 rounded-full text-white hover:bg-black/70 transition-colors border border-white/20 shadow-lg"
          title="Edit Profile"
        >
          ✏️
        </Link>
      </div>
      
      <p className="mt-6 text-gray-500 text-sm">
        This is how your profile appears to others.
      </p>
    </div>
  );
};

export default Profile;
