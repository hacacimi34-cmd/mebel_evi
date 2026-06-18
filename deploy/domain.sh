#!/bin/bash
# ================================================
# Domain + SSL quraşdırma
# İstifadə: sudo bash domain.sh mebelevi.az
# ================================================

DOMAIN=$1
if [ -z "$DOMAIN" ]; then
  echo "İstifadə: bash domain.sh DOMAIN_ADIN"
  echo "Misal:    bash domain.sh mebelevi.az"
  exit 1
fi

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Domain: $DOMAIN üçün Nginx konfiqurası yazılır...${NC}"

# Nginx konfiq
cat > /etc/nginx/sites-available/mebel-evi << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    client_max_body_size 20M;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_cache_bypass \$http_upgrade;
    }

    # Statik fayllar birbaşa Nginx-dən
    location /uploads/ {
        alias /var/www/mebel-evi/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    location /css/ {
        alias /var/www/mebel-evi/public/css/;
        expires 7d;
    }
    location /js/ {
        alias /var/www/mebel-evi/public/js/;
        expires 7d;
    }
}
EOF

ln -sf /etc/nginx/sites-available/mebel-evi /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo -e "${YELLOW}SSL sertifikatı alınır...${NC}"
apt install -y certbot python3-certbot-nginx
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN

systemctl reload nginx

echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}  Sayt hazırdır!                     ${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "🌐 https://$DOMAIN"
echo -e "🔐 https://$DOMAIN/admin"
