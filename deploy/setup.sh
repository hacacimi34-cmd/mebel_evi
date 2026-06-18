#!/bin/bash
# ================================================
# Mebel Evi - VPS Quraşdırma Skripti (Ubuntu 22.04)
# İstifadə: sudo bash setup.sh
# ================================================

set -e
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}   Mebel Evi - VPS Setup Başladı    ${NC}"
echo -e "${GREEN}=====================================${NC}\n"

# ---- 1. Sistemi yenilə ----
echo -e "${YELLOW}[1/7] Sistem yenilənir...${NC}"
apt update -y && apt upgrade -y
apt install -y curl wget git unzip nano ufw

# ---- 2. Node.js 20 ----
echo -e "${YELLOW}[2/7] Node.js quraşdırılır...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "Node: $(node -v) | NPM: $(npm -v)"

# ---- 3. MongoDB ----
echo -e "${YELLOW}[3/7] MongoDB quraşdırılır...${NC}"
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update -y
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod
echo "MongoDB: $(mongod --version | head -1)"

# ---- 4. PM2 ----
echo -e "${YELLOW}[4/7] PM2 quraşdırılır...${NC}"
npm install -g pm2
pm2 startup systemd -u root --hp /root | tail -1 | bash

# ---- 5. Nginx ----
echo -e "${YELLOW}[5/7] Nginx quraşdırılır...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# ---- 6. Firewall ----
echo -e "${YELLOW}[6/7] Firewall tənzimlənir...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ---- 7. Layihəni quraşdır ----
echo -e "${YELLOW}[7/7] Mebel Evi quraşdırılır...${NC}"
mkdir -p /var/www/mebel-evi
cd /var/www/mebel-evi

# Əgər zip varsa açaq
if [ -f /root/mebel-evi.zip ]; then
  unzip -o /root/mebel-evi.zip -d /var/www/
fi

npm install --production

# PM2 ilə başlat
pm2 delete mebel-evi 2>/dev/null || true
pm2 start server.js --name mebel-evi
pm2 save

echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}  Quraşdırma tamamlandı!             ${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "Server işləyir: http://$(curl -s ifconfig.me):3000"
echo -e "\nİndi domain.sh skriptini işlət:"
echo -e "  bash /root/domain.sh DOMAIN_ADIN"
