# 🚀 KMLRI Production VPS Deployment Guide
### Native Linux Architecture: Local PostgreSQL + Systemd + Nginx (No PM2, No Docker)

This guide walks you through deploying the **KMLRI Library & Research Institute** platform directly on an Ubuntu (22.04 / 24.04 LTS) or Debian VPS (DigitalOcean, AWS EC2, Linode, Hetzner, Vultr, etc.).

---

## 🏛️ System Architecture

```
Internet (Port 80 / 443)
        │
        ▼
   [ Nginx Reverse Proxy ]
        │
        ├─── /api/* ──────────► [ NestJS API ] (Port 4000) ──► [ Local PostgreSQL ] (Port 5432)
        │                             ▲ (systemd: kmlri-api)
        │
        └─── /* ──────────────► [ Next.js Web ] (Port 3000)
                                      ▲ (systemd: kmlri-web)
```

- **Process Manager**: Native Linux **Systemd** services (`systemctl`) with auto-restart on failure and boot-up persistence.
- **Database**: Local **PostgreSQL 16** server with dedicated database and user.
- **Web Server / Reverse Proxy**: **Nginx** with Gzip, HTTP/2, WebSocket support, and Certbot SSL.

---

## ⚡ Option A: Automated Quick Setup (Recommended)

Run the included automated setup script on your VPS:

```bash
# 1. SSH into your VPS as root
ssh root@YOUR_VPS_IP

# 2. Clone repository to /var/www/kmlri
mkdir -p /var/www
git clone <YOUR_GIT_REPO_URL> /var/www/kmlri
cd /var/www/kmlri

# 3. Run the automated VPS setup script
sudo bash deploy/setup-vps.sh

# 4. Build and start services
sudo bash deploy/update.sh
```

---

## 🛠️ Option B: Step-by-Step Manual Setup

### 1. Update Server & Install Prerequisites

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential ufw nginx certbot python3-certbot-nginx postgresql postgresql-contrib
```

### 2. Install Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify versions
node -v   # Should be v20.x or higher
npm -v
```

### 3. Setup Local PostgreSQL Database

```bash
# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user and create database & user
sudo -u postgres psql
```

Inside the PostgreSQL prompt (`psql`):

```sql
-- Create user with secure password
CREATE USER kmlri_user WITH PASSWORD 'YourStrongPassword123!';

-- Create database owned by user
CREATE DATABASE kmlri_db OWNER kmlri_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE kmlri_db TO kmlri_user;

-- Exit psql
\q
```

### 4. Clone Project & Configure Environment

```bash
sudo mkdir -p /var/www/kmlri
sudo chown -R $USER:$USER /var/www/kmlri
cd /var/www/kmlri

# Clone repository
git clone <YOUR_REPO_URL> .

# Create production .env file
nano .env
```

Paste and customize the `.env` file:

```ini
# ===============================================
# Production Environment Configuration
# ===============================================
PORT=4000
NODE_ENV=production

# PostgreSQL Connection String
DATABASE_URL="postgresql://kmlri_user:YourStrongPassword123!@localhost:5432/kmlri_db?schema=public"

# Auth Secrets
JWT_SECRET="generate-a-secure-random-secret-key-here"
JWT_EXPIRATION="7d"

# Allowed CORS Origins (comma-separated)
CORS_ORIGIN="http://yourdomain.com,https://yourdomain.com,http://admin.yourdomain.com,https://admin.yourdomain.com"

# Public API URL for Next.js
NEXT_PUBLIC_API_URL="https://yourdomain.com/api"
```

### 5. Install Dependencies, Migrate Database & Build

```bash
# Install workspace dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Push database schema migrations to PostgreSQL
npx prisma db push --schema=apps/api/prisma/schema.prisma --accept-data-loss

# (Optional) Seed initial records, users, and admin credentials
npm run prisma:seed

# Build NestJS Backend & Next.js Frontend
npm run build:api
npm run build:web
```

### 6. Setup Systemd Services (Without PM2 / Docker)

Copy service unit files to `/etc/systemd/system/`:

```bash
sudo cp deploy/systemd/kmlri-api.service /etc/systemd/system/
sudo cp deploy/systemd/kmlri-web.service /etc/systemd/system/

# Reload systemd daemon
sudo systemctl daemon-reload

# Enable services to launch on server boot
sudo systemctl enable kmlri-api
sudo systemctl enable kmlri-web

# Start services
sudo systemctl start kmlri-api
sudo systemctl start kmlri-web

# Verify service status
sudo systemctl status kmlri-api
sudo systemctl status kmlri-web
```

### 7. Configure Nginx Web Server

#### For Single Domain or VPS IP:

```bash
# Edit server_name in the template
sudo cp deploy/nginx/kmlri-single-domain.conf /etc/nginx/sites-available/kmlri.conf
sudo nano /etc/nginx/sites-available/kmlri.conf
```
*Change `YOUR_DOMAIN_OR_IP` to your domain or server IP.*

#### For Multi-Subdomain Setup (`kmlri.in`, `admin.kmlri.in`, `api.kmlri.in`):

```bash
sudo cp deploy/nginx/kmlri-subdomains.conf /etc/nginx/sites-available/kmlri.conf
sudo nano /etc/nginx/sites-available/kmlri.conf
```

#### Enable site and test Nginx:

```bash
# Enable site configuration
sudo ln -sf /etc/nginx/sites-available/kmlri.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test syntax and reload
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Configure Firewall (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 9. Setup Free SSL (HTTPS) with Certbot

Once your domain DNS A records point to your VPS IP:

```bash
# For single domain:
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# For subdomains:
sudo certbot --nginx -d kmlri.in -d www.kmlri.in -d admin.kmlri.in -d api.kmlri.in
```

Certbot will automatically modify `/etc/nginx/sites-available/kmlri.conf` with HTTPS redirection and SSL certificates, and set up automatic renewal cron jobs.

---

## 🔄 Daily Operations & Useful Commands

### Viewing Live Service Logs (Native journalctl)

```bash
# View backend API logs live
sudo journalctl -u kmlri-api -f

# View frontend web logs live
sudo journalctl -u kmlri-web -f

# View combined logs
sudo journalctl -u kmlri-api -u kmlri-web -f
```

### Service Controls

```bash
# Restart services
sudo systemctl restart kmlri-api
sudo systemctl restart kmlri-web

# Stop services
sudo systemctl stop kmlri-api kmlri-web

# Check running status
sudo systemctl is-active kmlri-api kmlri-web
```

### Database Backup & Restore

```bash
# Backup PostgreSQL database to file
pg_dump -U kmlri_user -d kmlri_db -h localhost > kmlri_backup_$(date +%F).sql

# Restore from backup
psql -U kmlri_user -d kmlri_db -h localhost < kmlri_backup.sql
```

### Updating to Latest Version

When you make changes or push updates to your git repository:

```bash
cd /var/www/kmlri
sudo bash deploy/update.sh
```
