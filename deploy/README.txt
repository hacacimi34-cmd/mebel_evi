================================================
  MEBEL EVİ - VPS QURAŞDIRMA TƏLİMATI
================================================

=== TƏLƏBLƏR ===
- VPS: Ubuntu 22.04 (minimum 1GB RAM, 20GB disk)
- Domain: DNS A record → VPS IP-si

=== ADDIM 1: ZIP-i VPS-ə yüklə ===

Windows-da CMD aç:
  scp mebel-evi.zip root@VPS_IP:/root/

=== ADDIM 2: VPS-ə qoşul ===

  ssh root@VPS_IP

=== ADDIM 3: Quraşdırma skriptini işlət ===

  bash /root/setup.sh

(Bu ~5 dəqiqə çəkir. Node.js, MongoDB, PM2, Nginx hamısını quraşdırır)

=== ADDIM 4: .env faylını doldur ===

  nano /var/www/mebel-evi/.env

  (env.production faylındakı şablonu istifadə et)

=== ADDIM 5: Seed data əlavə et ===

  cd /var/www/mebel-evi
  node seed.js

=== ADDIM 6: Domain bağla ===

Əvvəlcə domain-in DNS ayarlarında:
  A record: @ → VPS_IP
  A record: www → VPS_IP
  (Yayılması 10-60 dəqiqə çəkir)

Sonra VPS-də:
  bash /root/domain.sh mebelevi.az

(Bu Nginx + SSL sertifikatı quraşdırır)

=== ADDIM 7: Hazır! ===

  https://mebelevi.az        ← Sayt
  https://mebelevi.az/admin  ← Admin panel

=== YENİLƏMƏ (yeni versiya yükləyəndə) ===

  scp mebel-evi.zip root@VPS_IP:/root/
  ssh root@VPS_IP
  bash /root/update.sh

=== FAYDALİ ƏMRLƏR ===

  pm2 status              ← Server vəziyyəti
  pm2 logs mebel-evi      ← Log-lar
  pm2 restart mebel-evi   ← Yenidən başlat
  pm2 stop mebel-evi      ← Dayandır

================================================
