#!/bin/bash
# ================================================
# Saytı yenilə (yeni ZIP yükləyəndə)
# İstifadə: bash update.sh
# ================================================
cd /var/www/mebel-evi

if [ -f /root/mebel-evi.zip ]; then
  echo "ZIP tapıldı, açılır..."
  unzip -o /root/mebel-evi.zip -d /var/www/
fi

npm install --production
pm2 restart mebel-evi
echo "✅ Sayt yeniləndi!"
pm2 status
