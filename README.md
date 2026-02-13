# Iyilik Hareketi

Ramazan ayının dayanışma ruhunu dijital bir alana taşıyan, topluluk odaklı bir iyilik takip platformu.

İnsanlar yaptıkları iyilikleri isim ve kısa açıklama ile paylaşır; kayıtlar herkese açık listede en yeni üstte görünecek şekilde akar. Amaç yalnızca kayıt tutmak değil, iyiliği görünür kılarak daha fazla kişiyi harekete geçirmektir.

## Neden önemli?

- İyilik davranışını görünür hale getirir.
- Topluluk içinde olumlu örnek etkisi oluşturur.
- Ramazan ruhuna uygun şekilde yardımlaşmayı teşvik eder.
- Küçük adımların birikerek büyük sosyal etki üretebileceğini hatırlatır.

## Özellikler

- Dijital saat ve Ramazan geri sayımı
- İsim, soyisim ve iyilik metni ile kayıt
- En yeni kaydın üstte kaldığı akış listesi
- En çok iyilik yapanlar leaderboard alanı
- Basit anti-spam koruması
- Uygunsuz içerik için temel filtreleme

## Teknoloji

- Frontend: React + Vite
- API: Cloudflare Worker
- Veri katmanı: Upstash Redis

## Proje yapısı

```text
iyilik-hareketi/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── config.js
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── worker/
│   ├── index.js
│   ├── wrangler.toml
│   └── package.json
└── README.md
```

## Hızlı kurulum

### 1) Upstash Redis

1. [Upstash Console](https://console.upstash.com) üzerinden Redis DB oluştur.
2. `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` değerlerini al.

### 2) Cloudflare Worker

```bash
cd worker
npm install
wrangler login
wrangler secret put UPSTASH_REDIS_REST_URL
wrangler secret put UPSTASH_REDIS_REST_TOKEN
wrangler deploy
```

Deploy sonrası Worker URL’i örneği:

```text
https://iyilik-api.<subdomain>.workers.dev
```

### 3) Frontend ayarı

```bash
cd frontend
npm install
```

`frontend/src/config.js` içinde Worker URL’ini güncelle:

```js
WORKER_URL: 'https://iyilik-api.<subdomain>.workers.dev'
```

Lokal çalıştırma:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Deploy

### Netlify (önerilen hızlı yol)

- `frontend/dist` klasörünü [Netlify Drop](https://app.netlify.com/drop) sayfasına sürükle-bırak.

### Git tabanlı deploy

- Netlify üzerinde repo bağla.
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`

## Güvenlik notları

- Secret değerleri (`UPSTASH_REDIS_REST_TOKEN` vb.) repoya push edilmemelidir.
- Secret’ları yalnızca `wrangler secret put` ile tanımlayın.
- `.env` ve benzeri hassas dosyaları versiyonlamayın.

## Yol haritası

- Admin onay paneli
- Gelişmiş moderasyon (opsiyonel AI kontrol)
- Günlük kişi bazlı limit yönetimi
- İleri seviye raporlama ve istatistikler

## Lisans

Bu proje kişisel/deneysel kullanım için hazırlanmıştır. Üretim kullanımında uygun lisans ve KVKK gereksinimlerini ayrıca değerlendirin.
