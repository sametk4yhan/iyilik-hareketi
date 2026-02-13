# 🌙 İyilik Hareketi - Kurulum Rehberi

## 📁 Proje Yapısı

```
iyilik-hareketi/
├── frontend/
│   ├── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── config.js
│   ├── package.json
│   └── vite.config.js
├── worker/
│   ├── index.js
│   ├── wrangler.toml
│   └── package.json
└── README.md
```

---

## 🚀 ADIM 1: Upstash Redis Kurulumu (2 dakika)

1. **https://console.upstash.com** adresine git
2. "Create Database" tıkla
3. Ayarlar:
   - **Name:** `iyilik-hareketi`
   - **Region:** `eu-west-1` (Frankfurt - Türkiye'ye yakın)
   - **Type:** Regional
4. "Create" tıkla
5. **REST API** sekmesinden şunları kopyala:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## 🚀 ADIM 2: Cloudflare Worker Kurulumu (5 dakika)

### 2.1 Wrangler CLI Kurulumu
```bash
npm install -g wrangler
wrangler login
```

### 2.2 Worker Projesini Oluştur
```bash
cd worker
npm install
```

### 2.3 Environment Variables Ekle
```bash
wrangler secret put UPSTASH_REDIS_REST_URL
# Upstash'ten kopyaladığın URL'i yapıştır

wrangler secret put UPSTASH_REDIS_REST_TOKEN
# Upstash'ten kopyaladığın TOKEN'ı yapıştır

wrangler secret put ANTHROPIC_API_KEY
# Claude API key'ini yapıştır (isteğe bağlı - AI moderasyon için)
```

### 2.4 Deploy Et
```bash
wrangler deploy
```

Çıktıda şöyle bir URL göreceksin:
```
https://iyilik-api.YOUR_SUBDOMAIN.workers.dev
```

Bu URL'i not al!

---

## 🚀 ADIM 3: Frontend Kurulumu (3 dakika)

### 3.1 Bağımlılıkları Yükle
```bash
cd frontend
npm install
```

### 3.2 Config Dosyasını Düzenle
`src/config.js` dosyasını aç ve Worker URL'ini yapıştır:

```javascript
export const CONFIG = {
  WORKER_URL: 'https://iyilik-api.YOUR_SUBDOMAIN.workers.dev',
  // ...
};
```

### 3.3 Test Et
```bash
npm run dev
```

Tarayıcıda `http://localhost:5173` adresini aç.

---

## 🚀 ADIM 4: Production Deploy (Vercel/Netlify)

### Vercel ile:
```bash
npm install -g vercel
cd frontend
vercel
```

### Netlify ile:
```bash
npm install -g netlify-cli
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

---

## ✅ Test Checklist

- [ ] Upstash console'da database oluşturuldu
- [ ] Worker deploy edildi ve URL alındı
- [ ] Frontend'de Worker URL güncellendi
- [ ] İyilik ekleme çalışıyor
- [ ] Liste güncelleniyor
- [ ] Leaderboard çalışıyor
- [ ] Küfür filtresi çalışıyor

---

## 🔧 Sorun Giderme

### "CORS Error" alıyorsan:
Worker'da CORS header'ları zaten var, ama sorun devam ederse:
```javascript
// worker/index.js içinde headers'a ekle:
'Access-Control-Allow-Origin': '*'
```

### "Rate Limited" hatası:
Upstash free tier: 10K istek/gün. Yeterli olmalı.

### Veriler görünmüyor:
1. Upstash console'dan "Data Browser" aç
2. `iyilikler` key'ini kontrol et

---

## 📞 Destek

Sorun olursa bana yaz, çözeriz!
