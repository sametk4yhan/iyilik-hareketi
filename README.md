# 🌙 İyilik Hareketi

<p align="center">
  <img src="https://img.shields.io/badge/Ramazan-2026-gold?style=for-the-badge" alt="Ramazan 2026" />
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Cloudflare-Workers-orange?style=for-the-badge&logo=cloudflare" alt="Cloudflare Workers" />
  <img src="https://img.shields.io/badge/Upstash-Redis-red?style=for-the-badge" alt="Upstash Redis" />
</p>

<p align="center">
  <b>Ramazan'da iyilik hareketi başlat. Yaptığın iyilikleri kaydet, başkalarına ilham ver.</b>
</p>

<p align="center">
  <a href="https://iyilikhareketi.online">🔗 iyilikhareketi.online</a>
</p>

---

## ✨ Özellikler

- 🕐 **Ramazan'a Geri Sayım** - Canlı geri sayım sayacı
- 📝 **İyilik Kaydet** - Yaptığın iyilikleri kolayca kaydet
- 🌊 **İyilik Akışı** - Topluluktan gelen iyilikleri gerçek zamanlı gör
- 🏆 **Liderlik Tablosu** - En çok iyilik yapanlar
- 📊 **Canlı İstatistikler** - Bugün, bu hafta, toplam iyilik sayıları
- 🌙 **Günün Niyeti** - Her gün yeni bir ilham verici söz
- ⭐ **Yıldız Animasyonları** - Gece temalı atmosferik tasarım
- 🎉 **Confetti Efekti** - İyilik ekleyince kutlama
- 🛡️ **Spam Koruması** - Küfür filtresi + rate limiting
- 📱 **Mobil Uyumlu** - Tüm cihazlarda çalışır

---

## 🛠️ Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| **Frontend** | React 18 + Vite |
| **Backend** | Cloudflare Workers |
| **Database** | Upstash Redis |
| **Hosting** | Cloudflare Pages |
| **Domain** | Cloudflare DNS |

---

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn
- Cloudflare hesabı
- Upstash hesabı

### 1. Repo'yu Klonla

```bash
git clone https://github.com/sametk4yhan/iyilik-hareketi.git
cd iyilik-hareketi
```

### 2. Upstash Redis Kur

1. [console.upstash.com](https://console.upstash.com) adresine git
2. Yeni database oluştur (Region: `eu-west-1`)
3. REST API bilgilerini kopyala

### 3. Cloudflare Worker Kur

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put UPSTASH_REDIS_REST_URL
npx wrangler secret put UPSTASH_REDIS_REST_TOKEN
npx wrangler deploy
```

### 4. Frontend Kur

```bash
cd frontend
npm install
```

`src/config.js` dosyasında Worker URL'ini güncelle:

```javascript
export const CONFIG = {
  WORKER_URL: 'https://iyilik-api.YOUR_SUBDOMAIN.workers.dev',
  // ...
};
```

### 5. Çalıştır

```bash
npm run dev
```

Tarayıcıda `http://localhost:5173` adresini aç.

---

## 📁 Proje Yapısı

```
iyilik-hareketi/
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Ana uygulama
│   │   ├── config.js        # Konfigürasyon
│   │   └── main.jsx         # Entry point
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── worker/
│   ├── index.js             # Cloudflare Worker API
│   ├── wrangler.toml        # Worker config
│   └── package.json
└── README.md
```

---

## 🔒 Güvenlik

- **Küfür Filtresi**: Türkçe küfür ve hakaret kalıpları otomatik engellenir
- **Rate Limiting**: IP başına istek limiti
- **Duplicate Check**: Aynı içeriğin tekrar gönderilmesi engellenir
- **Input Validation**: Tüm girişler doğrulanır

---

## 🤝 Katkıda Bulun

Katkılarınızı bekliyoruz! 

1. Fork'la
2. Feature branch oluştur (`git checkout -b feature/yeni-ozellik`)
3. Commit'le (`git commit -m 'Yeni özellik eklendi'`)
4. Push'la (`git push origin feature/yeni-ozellik`)
5. Pull Request aç

---

## 📝 Lisans

MIT License - Dilediğiniz gibi kullanabilirsiniz.

---

## 💬 İletişim

- **Twitter/X**: [@sametk4yhan](https://twitter.com/sametk4yhan)
- **Website**: [iyilikhareketi.online](https://iyilikhareketi.online)

---

<p align="center">
  <b>Her iyilik bir ışıktır 🌙</b>
</p>

<p align="center">
  Made with ❤️ for Ramazan 2026
</p>