const mariadb = require('mariadb');
const dotenv = require('dotenv');

dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost', 
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

async function setup() {
  let conn;
  try {
    conn = await mariadb.createConnection(config);
    console.log("Connected to MariaDB");

    await conn.query("CREATE DATABASE IF NOT EXISTS BandmateRAU");
    console.log("Created Database BandmateRAU");

    await conn.query("USE BandmateRAU");

    await conn.query("DROP TABLE IF EXISTS notifications");
    await conn.query("DROP TABLE IF EXISTS messages");
    await conn.query("DROP TABLE IF EXISTS matches");
    await conn.query("DROP TABLE IF EXISTS swipes");
    await conn.query("DROP TABLE IF EXISTS users");
    console.log("Dropped existing tables");

    const schema = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        nickname VARCHAR(255),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        bio TEXT,
        instruments JSON,
        genres JSON,
        interests JSON,
        age INT,
        social_links JSON,
        profile_picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS swipes (
        liker_id INT NOT NULL,
        likee_id INT NOT NULL,
        action ENUM('like', 'pass') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (liker_id, likee_id),
        FOREIGN KEY (liker_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (likee_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS matches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user1_id INT NOT NULL,
        user2_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_match (user1_id, user2_id),
        FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        content TEXT,
        type ENUM('text', 'audio') DEFAULT 'text',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        content TEXT,
        related_id INT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    await conn.query(schema);
    console.log("Tables created");

    const rows = await conn.query("SELECT COUNT(*) as count FROM users");
    if (rows[0].count < 10) {
        console.log("Seeding users...");
        const seedQuery = "INSERT INTO users (username, nickname, email, password_hash, bio, instruments, genres, interests, age, profile_picture) VALUES ('jimi_hendrix', 'Jimi', 'jimi@example.com', 'password123', 'Guitar legend. Looking for a band to change the world.', '[\"Guitar\", \"Vocals\"]', '[\"Rock\", \"Blues\"]', '[\"Vinyl Collecting\", \"Meditation\"]', 27, 'https://ui-avatars.com/api/?name=Jimi+Hendrix&background=0D8ABC&color=fff'), ('freddie_mercury', 'Freddie', 'freddie@example.com', 'password123', 'I want to break free! Vocalist with a range.', '[\"Vocals\", \"Piano\"]', '[\"Rock\", \"Opera\"]', '[\"Cats\", \"Fashion\"]', 45, 'https://ui-avatars.com/api/?name=Freddie+Mercury&background=FFD700&color=fff'), ('flea', 'Flea', 'flea@example.com', 'password123', 'Slapping da bass. Funk rock enthusiast.', '[\"Bass\", \"Trumpet\"]', '[\"Funk\", \"Rock\"]', '[\"Surfing\", \"Beekeeping\"]', 50, 'https://ui-avatars.com/api/?name=Flea&background=FF0000&color=fff'), ('dave_grohl', 'Dave', 'dave@example.com', 'password123', 'I play everything. Lets make some noise.', '[\"Drums\", \"Guitar\", \"Vocals\"]', '[\"Rock\", \"Grunge\"]', '[\"Coffee\", \"BBQ\"]', 52, 'https://ui-avatars.com/api/?name=Dave+Grohl&background=000000&color=fff'), ('stevie_nicks', 'Stevie', 'stevie@example.com', 'password123', 'Thunder only happens when its raining. Gypsy soul.', '[\"Vocals\", \"Tambourine\"]', '[\"Rock\", \"Pop\"]', '[\"Poetry\", \"Witchcraft\"]', 70, 'https://ui-avatars.com/api/?name=Stevie+Nicks&background=800080&color=fff'), ('prince', 'The Artist', 'prince@example.com', 'password123', 'Dearly beloved, we are gathered here today to get through this thing called life.', '[\"Guitar\", \"Vocals\", \"Piano\", \"Bass\", \"Drums\"]', '[\"Funk\", \"Pop\", \"Rock\"]', '[\"Purple\", \"Motorcycles\"]', 57, 'https://ui-avatars.com/api/?name=Prince&background=4B0082&color=fff'), ('kurt_cobain', 'Kurt', 'kurt@example.com', 'password123', 'Come as you are.', '[\"Guitar\", \"Vocals\"]', '[\"Grunge\", \"Rock\"]', '[\"Art\", \"Writing\"]', 27, 'https://ui-avatars.com/api/?name=Kurt+Cobain&background=556B2F&color=fff'), ('janis_joplin', 'Pearl', 'janis@example.com', 'password123', 'Take another little piece of my heart.', '[\"Vocals\"]', '[\"Blues\", \"Rock\", \"Soul\"]', '[\"Feathers\", \"Cars\"]', 27, 'https://ui-avatars.com/api/?name=Janis+Joplin&background=FF69B4&color=fff'), ('bb_king', 'B.B.', 'bb@example.com', 'password123', 'The thrill is gone.', '[\"Guitar\", \"Vocals\"]', '[\"Blues\"]', '[\"Lucille\", \"Touring\"]', 80, 'https://ui-avatars.com/api/?name=BB+King&background=000080&color=fff'), ('miles_davis', 'Miles', 'miles@example.com', 'password123', 'So What.', '[\"Trumpet\"]', '[\"Jazz\", \"Fusion\"]', '[\"Boxing\", \"Painting\"]', 65, 'https://ui-avatars.com/api/?name=Miles+Davis&background=000000&color=fff'), ('john_bonham', 'Bonzo', 'john@example.com', 'password123', 'Heavy drums.', '[\"Drums\"]', '[\"Rock\"]', '[\"Cars\"]', 32, 'https://ui-avatars.com/api/?name=John+Bonham&background=555&color=fff'), ('robert_plant', 'Robert', 'robert@example.com', 'password123', 'Golden god.', '[\"Vocals\"]', '[\"Rock\", \"Folk\"]', '[\"Fantasy\"]', 70, 'https://ui-avatars.com/api/?name=Robert+Plant&background=777&color=fff'), ('jimmy_page', 'Jimmy', 'jimmy@example.com', 'password123', 'Riffs.', '[\"Guitar\"]', '[\"Rock\"]', '[\"Occult\"]', 75, 'https://ui-avatars.com/api/?name=Jimmy+Page&background=333&color=fff'), ('john_paul_jones', 'JPJ', 'jpj@example.com', 'password123', 'Multi-instrumentalist.', '[\"Bass\", \"Keys\"]', '[\"Rock\"]', '[\"Arranging\"]', 75, 'https://ui-avatars.com/api/?name=JPJ&background=444&color=fff'), ('axl_rose', 'Axl', 'axl@example.com', 'password123', 'Welcome to the jungle.', '[\"Vocals\"]', '[\"Rock\"]', '[\"Bandanas\"]', 60, 'https://ui-avatars.com/api/?name=Axl+Rose&background=900&color=fff'), ('slash', 'Slash', 'slash@example.com', 'password123', 'Top hat.', '[\"Guitar\"]', '[\"Rock\"]', '[\"Snakes\"]', 58, 'https://ui-avatars.com/api/?name=Slash&background=000&color=fff'), ('tom_petty', 'Tom', 'tom@example.com', 'password123', 'Free fallin.', '[\"Guitar\", \"Vocals\"]', '[\"Rock\"]', '[\"Driving\"]', 66, 'https://ui-avatars.com/api/?name=Tom+Petty&background=999&color=fff'), ('david_bowie', 'Bowie', 'bowie@example.com', 'password123', 'Starman.', '[\"Vocals\"]', '[\"Rock\", \"Pop\"]', '[\"Space\"]', 69, 'https://ui-avatars.com/api/?name=David+Bowie&background=f0f&color=fff'), ('elton_john', 'Elton', 'elton@example.com', 'password123', 'Rocket man.', '[\"Piano\", \"Vocals\"]', '[\"Pop\", \"Rock\"]', '[\"Glasses\"]', 75, 'https://ui-avatars.com/api/?name=Elton+John&background=ff0&color=000'), ('ozzy_osbourne', 'Ozzy', 'ozzy@example.com', 'password123', 'Prince of darkness.', '[\"Vocals\"]', '[\"Metal\"]', '[\"Reality TV\"]', 74, 'https://ui-avatars.com/api/?name=Ozzy+Osbourne&background=222&color=fff') ";
        await conn.query(seedQuery);
        console.log("Seeded 20 users");
    } else {
        console.log("Database already has users");
    }

  } catch (err) {
    console.error("Setup failed:", err);
    process.exit(1);
  } finally {
    if (conn) conn.end();
  }
}

setup();
