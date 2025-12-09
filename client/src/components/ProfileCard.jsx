import React from 'react';

const ProfileCard = ({ user, isPreview = false }) => {
  if (!user) return null;

  return (
    <div className={`relative w-full max-w-sm mx-auto bg-dark-light rounded-3xl overflow-hidden shadow-2xl border border-white/10 ${isPreview ? 'h-[600px]' : ''}`}>
      {/* Image Section */}
      <div className="h-3/5 relative">
        <img
          src={user.profile_picture || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
          alt={user.username}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <h2 className="text-3xl font-bold text-white mb-1">
            {user.nickname || user.username}, <span className="text-2xl font-normal opacity-80">{user.age}</span>
          </h2>
          {user.nickname && <p className="text-sm text-gray-300 mb-2">@{user.username}</p>}
          <p className="text-gray-200 line-clamp-2">{user.bio}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4 h-2/5 overflow-y-auto">
        {/* Bio */}
        {user.bio && (
          <p className="text-gray-300 text-sm leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Instruments */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Instruments</h3>
          <div className="flex flex-wrap gap-2">
            {user.instruments?.map(inst => (
              <span key={inst} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium border border-primary/20">
                {inst}
              </span>
            ))}
          </div>
        </div>

        {/* Genres */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Genres</h3>
          <div className="flex flex-wrap gap-2">
            {user.genres?.map(genre => (
              <span key={genre} className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-xs font-medium border border-secondary/20">
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map(item => (
                <span key={item} className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-medium border border-accent/20">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
