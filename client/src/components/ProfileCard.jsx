import React from 'react';

const ProfileCard = ({ user, isPreview = false }) => {
  if (!user) return null;

  return (
    <div className="w-full max-w-sm mx-auto border border-green-500/50 p-4 font-mono text-sm bg-black">
      <div className="border-b border-green-500/30 pb-2 mb-4">
        <h2 className="text-xl font-bold text-green-500">
          [{user.username}]
        </h2>
        <p className="text-gray-500">AGE: {user.age}</p>
        {user.nickname && <p className="text-gray-500">AKA: {user.nickname}</p>}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-green-600 font-bold mb-1">BIO:</h3>
          <p className="text-gray-300 whitespace-pre-wrap font-mono">
             {">"} {user.bio || "No bio."}
          </p>
        </div>

        <div>
          <h3 className="text-green-600 font-bold mb-1">INSTRUMENTS:</h3>
          <div className="flex flex-wrap gap-2">
            {user.instruments?.map(inst => (
              <span key={inst} className="border border-green-800 text-green-400 px-2 py-0.5 text-xs">
                {inst}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-green-600 font-bold mb-1">GENRES:</h3>
          <div className="flex flex-wrap gap-2">
            {user.genres?.map(genre => (
              <span key={genre} className="border border-green-800 text-green-400 px-2 py-0.5 text-xs">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
