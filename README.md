# 🛋️ Mebel Evi - Premium Furniture Store

## Quraşdırma (Setup)

### 1. Asılılıqları yüklə
```bash
cd mebel-evi
npm install
```

### 2. MongoDB işlət
MongoDB-nin lokal olaraq işlədiyinə əmin ol (localhost:27017)

### 3. Nümunə məlumatları əlavə et
```bash
node seed.js
```

### 4. Serveri işlət
```bash
npm run dev
# və ya
node server.js
```

### 5. Brauzerdə aç
- 🌐 **Sayt:** http://localhost:3000
- 🔐 **Admin:** http://localhost:3000/admin

## Admin Giriş
- **Email:** admin@mebelevi.az
- **Şifrə:** admin123

## Saytın Özəllikləri
- ✅ AZ/EN dil dəstəyi
- ✅ Admin panel (məhsul, kateqoriya, sifariş)
- ✅ Şəkil yükləmə (local)
- ✅ Səbət sistemi
- ✅ Stripe ödəniş
- ✅ Nağd / Bank köçürməsi ödəniş
- ✅ Sifariş idarəetməsi
- ✅ Responsiv dizayn

## Stripe
.env faylında öz Stripe açarlarını əlavə et:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```
