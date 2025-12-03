const { db } = require('./db');
const bcrypt = require('bcrypt');

const seed = () => {
  console.log('Seeding database...');

  // Clear existing data
  db.exec('DELETE FROM messages');
  db.exec('DELETE FROM notifications');
  db.exec('DELETE FROM swipes');
  db.exec('DELETE FROM users');

  const users = [
    {
      username: 'jimi_hendrix',
      nickname: 'Jimi',
      email: 'jimi@example.com',
      bio: 'Guitar legend. Looking for a band to change the world.',
      instruments: JSON.stringify(['Guitar', 'Vocals']),
      genres: JSON.stringify(['Rock', 'Blues']),
      interests: JSON.stringify(['Vinyl Collecting', 'Meditation']),
      age: 27,
      profile_picture: 'https://ui-avatars.com/api/?name=Jimi+Hendrix&background=0D8ABC&color=fff'
    },
    {
      username: 'freddie_mercury',
      nickname: 'Freddie',
      email: 'freddie@example.com',
      bio: 'I want to break free! Vocalist with a range.',
      instruments: JSON.stringify(['Vocals', 'Piano']),
      genres: JSON.stringify(['Rock', 'Opera']),
      interests: JSON.stringify(['Cats', 'Fashion']),
      age: 45,
      profile_picture: 'https://ui-avatars.com/api/?name=Freddie+Mercury&background=FFD700&color=fff'
    },
    {
      username: 'flea',
      nickname: 'Flea',
      email: 'flea@example.com',
      bio: 'Slapping da bass. Funk rock enthusiast.',
      instruments: JSON.stringify(['Bass', 'Trumpet']),
      genres: JSON.stringify(['Funk', 'Rock']),
      interests: JSON.stringify(['Surfing', 'Beekeeping']),
      age: 50,
      profile_picture: 'https://ui-avatars.com/api/?name=Flea&background=FF0000&color=fff'
    },
    {
      username: 'dave_grohl',
      nickname: 'Dave',
      email: 'dave@example.com',
      bio: 'I play everything. Lets make some noise.',
      instruments: JSON.stringify(['Drums', 'Guitar', 'Vocals']),
      genres: JSON.stringify(['Rock', 'Grunge']),
      interests: JSON.stringify(['Coffee', 'BBQ']),
      age: 52,
      profile_picture: 'https://ui-avatars.com/api/?name=Dave+Grohl&background=000000&color=fff'
    },
    {
      username: 'stevie_nicks',
      nickname: 'Stevie',
      email: 'stevie@example.com',
      bio: 'Thunder only happens when its raining. Gypsy soul.',
      instruments: JSON.stringify(['Vocals', 'Tambourine']),
      genres: JSON.stringify(['Rock', 'Pop']),
      interests: JSON.stringify(['Poetry', 'Witchcraft']),
      age: 70,
      profile_picture: 'https://ui-avatars.com/api/?name=Stevie+Nicks&background=800080&color=fff'
    },
    {
      username: 'prince',
      nickname: 'The Artist',
      email: 'prince@example.com',
      bio: 'Dearly beloved, we are gathered here today to get through this thing called life.',
      instruments: JSON.stringify(['Guitar', 'Vocals', 'Piano', 'Bass', 'Drums']),
      genres: JSON.stringify(['Funk', 'Pop', 'Rock']),
      interests: JSON.stringify(['Purple', 'Motorcycles']),
      age: 57,
      profile_picture: 'https://ui-avatars.com/api/?name=Prince&background=4B0082&color=fff'
    },
    {
      username: 'kurt_cobain',
      nickname: 'Kurt',
      email: 'kurt@example.com',
      bio: 'Come as you are.',
      instruments: JSON.stringify(['Guitar', 'Vocals']),
      genres: JSON.stringify(['Grunge', 'Rock']),
      interests: JSON.stringify(['Art', 'Writing']),
      age: 27,
      profile_picture: 'https://ui-avatars.com/api/?name=Kurt+Cobain&background=556B2F&color=fff'
    },
    {
      username: 'janis_joplin',
      nickname: 'Pearl',
      email: 'janis@example.com',
      bio: 'Take another little piece of my heart.',
      instruments: JSON.stringify(['Vocals']),
      genres: JSON.stringify(['Blues', 'Rock', 'Soul']),
      interests: JSON.stringify(['Feathers', 'Cars']),
      age: 27,
      profile_picture: 'https://ui-avatars.com/api/?name=Janis+Joplin&background=FF69B4&color=fff'
    },
    {
      username: 'bb_king',
      nickname: 'B.B.',
      email: 'bb@example.com',
      bio: 'The thrill is gone.',
      instruments: JSON.stringify(['Guitar', 'Vocals']),
      genres: JSON.stringify(['Blues']),
      interests: JSON.stringify(['Lucille', 'Touring']),
      age: 80,
      profile_picture: 'https://ui-avatars.com/api/?name=BB+King&background=000080&color=fff'
    },
    {
      username: 'miles_davis',
      nickname: 'Miles',
      email: 'miles@example.com',
      bio: 'So What.',
      instruments: JSON.stringify(['Trumpet']),
      genres: JSON.stringify(['Jazz', 'Fusion']),
      interests: JSON.stringify(['Boxing', 'Painting']),
      age: 65,
      profile_picture: 'https://ui-avatars.com/api/?name=Miles+Davis&background=000000&color=fff'
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO users (username, nickname, email, password_hash, bio, instruments, genres, interests, age, profile_picture)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Reset sequence
  db.prepare("DELETE FROM sqlite_sequence WHERE name='users'").run();

  users.forEach(user => {
    stmt.run(
      user.username,
      user.nickname,
      user.email,
      bcrypt.hashSync('password123', 10),
      user.bio,
      user.instruments,
      user.genres,
      user.interests,
      user.age,
      user.profile_picture
    );
  });

  console.log('Database seeded!');
};

seed();
