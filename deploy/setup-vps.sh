#!/usr/bin/env bash
# ==============================================================================
# KMLRI Library System - Automated VPS Setup Script
# Target OS: Ubuntu 22.04 / 24.04 LTS or Debian 11/12
# Stack: Node.js 20 LTS + PostgreSQL 16 + Systemd + Nginx (No Docker, No PM2)
# ==============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}   KMLRI Library System - Production VPS Setup       ${NC}"
echo -e "${BLUE}======================================================${NC}"

# Check root execution
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Error: Please run this script as root or with sudo.${NC}"
  exit 1
fi

APP_DIR="/var/www/kmlri"
DB_NAME="kmlri_db"
DB_USER="kmlri_user"

# Prompt for database password
read -s -p "Enter a secure password for PostgreSQL user '${DB_USER}': " DB_PASS
echo ""
if [ -z "$DB_PASS" ]; then
  echo -e "${RED}Error: Database password cannot be empty.${NC}"
  exit 1
fi

read -p "Enter your primary domain (or VPS public IP, e.g. kmlri.in or 123.45.67.89): " DOMAIN_NAME
if [ -z "$DOMAIN_NAME" ]; then
  DOMAIN_NAME="localhost"
fi

echo -e "\n${YELLOW}[1/7] Updating system packages...${NC}"
apt-get update -y
apt-get upgrade -y
apt-get install -y curl wget git build-essential ufw nginx certbot python3-certbot-nginx postgresql postgresql-contrib

echo -e "\n${YELLOW}[2/7] Installing Node.js 20 LTS...${NC}"
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'.' -f1 | tr -d 'v') -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo -e "${GREEN}Node version: $(node -v)${NC}"
echo -e "${GREEN}NPM version: $(npm -v)${NC}"

echo -e "\n${YELLOW}[3/7] Configuring Local PostgreSQL...${NC}"
systemctl start postgresql
systemctl enable postgresql

# Create Database and User if they don't exist
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
sudo -u postgres psql -d ${DB_NAME} -c "GRANT ALL ON SCHEMA public TO ${DB_USER};"

echo -e "${GREEN}PostgreSQL database '${DB_NAME}' and user '${DB_USER}' configured successfully.${NC}"

echo -e "\n${YELLOW}[4/7] Setting up application files and permissions...${NC}"
mkdir -p /var/www/kmlri
chown -R www-data:www-data /var/www/kmlri

# Generate .env file
cat << ENV_EOF > ${APP_DIR}/.env
# ===============================================
# KMLRI Production Environment Configuration
# ===============================================
PORT=4000
NODE_ENV=production

# PostgreSQL Connection
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public"

# Auth Secrets (Change this in production)
JWT_SECRET="$(openssl rand -hex 32)"
JWT_EXPIRATION="7d"

# Allowed CORS Origins
CORS_ORIGIN="http://${DOMAIN_NAME},https://${DOMAIN_NAME},http://admin.${DOMAIN_NAME},https://admin.${DOMAIN_NAME}"

# Frontend API URL
NEXT_PUBLIC_API_URL="http://${DOMAIN_NAME}/api"
ENV_EOF

chmod 600 ${APP_DIR}/.env
chown www-data:www-data ${APP_DIR}/.env
echo -e "${GREEN}Created production environment file at ${APP_DIR}/.env${NC}"

echo -e "\n${YELLOW}[5/7] Installing Systemd Services...${NC}"
# Copy systemd unit files
cp ${APP_DIR}/deploy/systemd/kmlri-api.service /etc/systemd/system/
cp ${APP_DIR}/deploy/systemd/kmlri-web.service /etc/systemd/system/

systemctl daemon-reload
systemctl enable kmlri-api.service
systemctl enable kmlri-web.service

echo -e "\n${YELLOW}[6/7] Configuring Nginx Web Server...${NC}"
# Setup Nginx configuration
sed "s/YOUR_DOMAIN_OR_IP/${DOMAIN_NAME}/g" ${APP_DIR}/deploy/nginx/kmlri-single-domain.conf > /etc/nginx/sites-available/kmlri.conf

# Enable site
ln -sf /etc/nginx/sites-available/kmlri.conf /etc/nginx/sites-enabled/kmlri.conf
rm -f /etc/nginx/sites-enabled/default

# Test Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

echo -e "\n${YELLOW}[7/7] Configuring Firewall (UFW)...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}   Setup complete! Now build and run your services:  ${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "Run the update script to build and start the apps:"
echo -e "  ${BLUE}sudo bash ${APP_DIR}/deploy/update.sh${NC}\n"
