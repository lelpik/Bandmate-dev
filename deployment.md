# Bandmate Deployment Guide (Debian 12)

This guide covers setting up the Bandmate application on a fresh Debian 12 server using **Nginx**, **MariaDB**, and **Node.js**.

## 1. System Preparation

First, update your system and install essential tools.

```bash
# Update package list and upgrade
sudo apt update && sudo apt upgrade -y

# Install curl, git, and build essentials
sudo apt install -y curl git build-essential unzip ufw
```

### Configure Firewall (UFW)

Secure the server by allowing only SSH and Web traffic.

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 2. Install Dependencies

### Node.js (v20 LTS)

We will use the official NodeSource repository.

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify install
node -v
npm -v
```

### Process Manager (PM2)

PM2 keeps your Node.js backend running in the background.

```bash
sudo npm install -g pm2
```

### MariaDB Database

```bash
sudo apt install -y mariadb-server

# Secure the installation (Set root password, remove anon users)
sudo mysql_secure_installation
```

---

## 3. Database Setup

Log into MariaDB and create the database and user.

```bash
sudo mariadb -u root -p
```

Inside the SQL shell:

```sql
-- Create Database
CREATE DATABASE bandmate;

-- Create User (Replace 'secure_password' with a real password)
CREATE USER 'bandmate_user'@'localhost' IDENTIFIED BY 'secure_password';

-- Grant Privileges
GRANT ALL PRIVILEGES ON bandmate.* TO 'bandmate_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 4. Application Setup

### Clone Repository

```bash
cd /var/www
sudo mkdir bandmate
sudo chown -R $USER:$USER bandmate
cd bandmate

# Clone your repo (Use your actual URL)
git clone https://github.com/lelpik/Bandmate-dev .
```

### Backend Setup

```bash
cd server
npm install

# Create .env file
nano .env
```

**File content (`server/.env`):**

```env
PORT=3000
DB_HOST=localhost
DB_USER=bandmate_user
DB_PASSWORD=secure_password
DB_NAME=bandmate
```

**Start Backend:**

```bash
pm2 start index.js --name "bandmate-server"
pm2 save
pm2 startup
```

### Frontend Setup (Production Build)

Instead of running `vite` (dev mode), we will **build** the app into static HTML/CSS/JS files for Nginx to serve remarkably fast.

```bash
cd ../client
npm install

# Build the project
npm run build
```

_This creates a `dist` folder containing your website._

---

## 5. Nginx Configuration

Install Nginx if you haven't yet:

```bash
sudo apt install -y nginx
```

Create the site configuration:

```bash
sudo nano /etc/nginx/sites-available/bandmate
```

**Configuration Content:**

```nginx
server {
    listen 80;
    server_name bandmate.afterdarknetwork.ro; # Your Domain

    # 1. Serve Frontend (Static Build)
    location / {
        root /var/www/bandmate/client/dist; # Path to build folder
        index index.html;
        try_files $uri $uri/ /index.html; # Handle React Routing
    }

    # 2. Proxy API Requests to Node.js Backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Allow large uploads
        client_max_body_size 10M;
    }

    # 3. Proxy Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 4. Serve Uploaded Files (Directly for speed)
    location /uploads/ {
        alias /var/www/bandmate/server/uploads/;
    }
}
```

**Enable Site & Restart:**

```bash
sudo ln -s /etc/nginx/sites-available/bandmate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. SSL Certificate (HTTPS)

Secure your site with Let's Encrypt.

```bash
sudo apt install -y certbot python3-certbot-nginx

# Request and Install Certificate
sudo certbot --nginx -d bandmate.afterdarknetwork.ro
```

---

## 7. Updates & Maintenance

**To update your code:**

```bash
cd /var/www/bandmate
git pull

# Update Backend
cd server
npm install
pm2 restart bandmate-server

# Update Frontend
cd ../client
npm install
# No restart needed for frontend (Nginx serves the new files immediately)
```

## 8. Security Enhancements

### Block Direct IP Access

Prevent users from bypassing your domain name by adding this "catch-all" block at the top of your Nginx config:

```nginx
server {
    listen 80 default_server;
    listen 443 ssl default_server;
    server_name _;
    ssl_certificate /etc/letsencrypt/live/bandmate.afterdarknetwork.ro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bandmate.afterdarknetwork.ro/privkey.pem;
    return 444; # Drop connection
}
```

### Bind Node.js to Localhost

Prevent direct access to port 3000 by modifying `server/index.js`:

```javascript
// Change listen to bind ONLY to localhost
httpServer.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 9. Troubleshooting

- **500 Internal Server Error**: Usually permissions. Ensure Nginx (`www-data`) can read the files.
  ```bash
  sudo chown -R $USER:www-data /var/www/bandmate
  sudo chmod -R 755 /var/www/bandmate
  ```
- **502 Bad Gateway**: Node.js server is down. Check `pm2 status` or `pm2 logs`.
- **Changes not applying**: You must reload Nginx.
  ```bash
  sudo nginx -t && sudo systemctl reload nginx
  ```
