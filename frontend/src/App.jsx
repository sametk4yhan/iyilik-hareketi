import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CONFIG } from './config';

function getNextRamadanDate() {
  const now = new Date();
  const base = new Date(CONFIG.RAMAZAN_START);
  if (Number.isNaN(base.getTime())) return null;

  const candidate = new Date(base);
  candidate.setFullYear(now.getFullYear());

  if (candidate <= now) {
    candidate.setFullYear(now.getFullYear() + 1);
  }

  return candidate;
}

function formatClock(date) {
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatDate(date) {
  return date.toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function timeAgo(value) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'şimdi';
  if (min < 60) return `${min} dk önce`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} sa önce`;
  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
}

function countdownParts(target) {
  if (!target) return null;
  const now = Date.now();
  const diff = target.getTime() - now;
  if (diff <= 0) return { done: true, d: 0, h: 0, m: 0, s: 0 };

  return {
    done: false,
    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
    h: Math.floor((diff / (1000 * 60 * 60)) % 24),
    m: Math.floor((diff / (1000 * 60)) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

export default function App() {
  const [now, setNow] = useState(new Date());
  const [targetDate] = useState(getNextRamadanDate);
  const [countdown, setCountdown] = useState(() => countdownParts(getNextRamadanDate()));

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({ isim: '', soyisim: '', iyilik: '' });

  const leaderboard = useMemo(() => {
    const counts = {};
    for (const item of items) {
      const key = `${item.isim} ${item.soyisim}`;
      counts[key] = (counts[key] || 0) + 1;
    }

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [items]);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`${CONFIG.WORKER_URL}/iyilikler`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Liste alınamadı.');
      const sorted = [...(data.data || [])].sort(
        (a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime()
      );
      setItems(sorted);
    } catch (e) {
      setError(e.message || 'Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    const poll = setInterval(fetchItems, 25000);
    return () => clearInterval(poll);
  }, [fetchItems]);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextNow = new Date();
      setNow(nextNow);
      setCountdown(countdownParts(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const isim = form.isim.trim();
    const soyisim = form.soyisim.trim();
    const iyilik = form.iyilik.trim();

    if (!isim || !soyisim || !iyilik) {
      setError('Lütfen tüm alanları doldur.');
      return;
    }

    if (iyilik.length > CONFIG.MAX_IYILIK_LENGTH) {
      setError(`Maksimum ${CONFIG.MAX_IYILIK_LENGTH} karakter.`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${CONFIG.WORKER_URL}/iyilikler`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isim, soyisim, iyilik }),
      });

      const data = await res.json();
      if (!data.success) {
        const msg = data.detail ? `${data.error} (${data.detail})` : data.error;
        throw new Error(msg || 'Kayıt sırasında hata oluştu.');
      }

      setForm({ isim: '', soyisim: '', iyilik: '' });
      setSuccess(data.pending ? 'İçerik onaya gönderildi.' : 'İyilik kaydedildi.');
      await fetchItems();
    } catch (e) {
      setError(e.message || 'Bağlantı hatası.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Cormorant+Garamond:wght@600;700&display=swap');

        :root {
          --bg: #f4f7fb;
          --card: #ffffff;
          --line: #dbe4f0;
          --text: #1f2c3c;
          --muted: #637289;
          --primary: #2f6ed8;
          --primary-soft: #e8f0ff;
          --danger: #c92d39;
          --ok: #0c8a4d;
        }

        * { box-sizing: border-box; }
        body { margin: 0; }

        .page {
          min-height: 100vh;
          padding: 18px;
          font-family: 'Sora', sans-serif;
          color: var(--text);
          background:
            radial-gradient(900px 400px at 0% 0%, #edf4ff 0%, transparent 60%),
            radial-gradient(700px 380px at 100% 0%, #f8fbff 0%, transparent 55%),
            var(--bg);
        }

        .container {
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          gap: 14px;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 16px;
        }

        .title {
          margin: 0;
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(30px, 4vw, 46px);
          line-height: 1;
        }

        .subtitle {
          margin: 6px 0 0;
          color: var(--muted);
          font-size: 13px;
        }

        .clock {
          text-align: right;
        }

        .clock-time {
          font-weight: 700;
          font-size: clamp(22px, 3.3vw, 34px);
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }

        .clock-date {
          margin-top: 5px;
          color: var(--muted);
          font-size: 12px;
        }

        .countdown {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 14px 16px;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 16px;
        }

        .countdown-label {
          color: var(--muted);
          font-size: 13px;
        }

        .timer {
          display: flex;
          gap: 8px;
        }

        .unit {
          min-width: 74px;
          text-align: center;
          padding: 8px;
          border-radius: 12px;
          border: 1px solid var(--line);
          background: #fbfdff;
        }

        .unit-value {
          font-size: 22px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .unit-name {
          margin-top: 2px;
          font-size: 11px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: .3px;
        }

        .main {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 14px;
        }

        .card {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 14px;
        }

        .card h2 {
          margin: 0 0 12px;
          font-size: 18px;
        }

        .field { margin-bottom: 10px; }
        .field label {
          display: block;
          margin-bottom: 5px;
          font-size: 12px;
          color: var(--muted);
        }

        .input, .textarea {
          width: 100%;
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 10px 11px;
          font: inherit;
          color: var(--text);
          background: #fff;
        }

        .textarea {
          min-height: 96px;
          resize: vertical;
        }

        .btn {
          width: 100%;
          border: 0;
          border-radius: 10px;
          padding: 11px;
          background: var(--primary);
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .btn:disabled { opacity: .7; cursor: not-allowed; }

        .message {
          margin-top: 9px;
          font-size: 12px;
        }

        .message.error { color: var(--danger); }
        .message.success { color: var(--ok); }

        .top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 10px;
        }

        .stats {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .pill {
          border: 1px solid var(--line);
          background: #fff;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 12px;
          white-space: nowrap;
        }

        .pill b { color: var(--primary); margin-left: 5px; }

        .list {
          max-height: 570px;
          overflow-y: auto;
          border-top: 1px solid var(--line);
        }

        .row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          padding: 10px 2px;
          border-bottom: 1px solid var(--line);
        }

        .name {
          font-size: 14px;
          font-weight: 600;
        }

        .text {
          margin-top: 4px;
          color: #2d3f56;
          font-size: 14px;
        }

        .time {
          font-size: 12px;
          color: var(--muted);
          white-space: nowrap;
        }

        .empty {
          padding: 18px 0;
          color: var(--muted);
          font-size: 14px;
        }

        @media (max-width: 960px) {
          .main { grid-template-columns: 1fr; }
          .top { flex-direction: column; }
          .stats { justify-content: flex-start; }
          .header { flex-direction: column; align-items: flex-start; }
          .clock { text-align: left; }
        }
      `}</style>

      <div className="container">
        <header className="header">
          <div>
            <h1 className="title">Iyilik Hareketi</h1>
            <p className="subtitle">Herkese açık iyilik zinciri</p>
          </div>
          <div className="clock">
            <div className="clock-time">{formatClock(now)}</div>
            <div className="clock-date">{formatDate(now)}</div>
          </div>
        </header>

        <section className="countdown">
          <div className="countdown-label">
            {countdown?.done
              ? 'Ramazan başladı. Hayırlı Ramazanlar.'
              : `Ramazan'a kalan süre (${targetDate ? targetDate.toLocaleDateString('tr-TR') : '-'})`}
          </div>

          {!countdown?.done && countdown && (
            <div className="timer">
              <div className="unit"><div className="unit-value">{String(countdown.d).padStart(2, '0')}</div><div className="unit-name">Gün</div></div>
              <div className="unit"><div className="unit-value">{String(countdown.h).padStart(2, '0')}</div><div className="unit-name">Saat</div></div>
              <div className="unit"><div className="unit-value">{String(countdown.m).padStart(2, '0')}</div><div className="unit-name">Dakika</div></div>
              <div className="unit"><div className="unit-value">{String(countdown.s).padStart(2, '0')}</div><div className="unit-name">Saniye</div></div>
            </div>
          )}
        </section>

        <main className="main">
          <section className="card">
            <h2>Iyilik Ekle</h2>
            <form onSubmit={submit}>
              <div className="field">
                <label>İsim</label>
                <input
                  className="input"
                  value={form.isim}
                  onChange={(e) => setForm((p) => ({ ...p, isim: e.target.value }))}
                  placeholder="Adın"
                />
              </div>

              <div className="field">
                <label>Soyisim</label>
                <input
                  className="input"
                  value={form.soyisim}
                  onChange={(e) => setForm((p) => ({ ...p, soyisim: e.target.value }))}
                  placeholder="Soyadın"
                />
              </div>

              <div className="field">
                <label>Yapılan İyilik</label>
                <textarea
                  className="textarea"
                  value={form.iyilik}
                  onChange={(e) => setForm((p) => ({ ...p, iyilik: e.target.value }))}
                  maxLength={CONFIG.MAX_IYILIK_LENGTH}
                  placeholder="Bugün yaptığın iyiliği kısa yaz"
                />
              </div>

              <button className="btn" disabled={submitting} type="submit">
                {submitting ? 'Kaydediliyor...' : 'Kaydet'}
              </button>

              {error ? <div className="message error">{error}</div> : null}
              {success ? <div className="message success">{success}</div> : null}
            </form>
          </section>

          <section className="card">
            <div className="top">
              <h2 style={{ margin: 0 }}>Son İyilikler ({items.length})</h2>
              <div className="stats">
                {leaderboard.map((u, idx) => (
                  <div className="pill" key={u.name}>
                    {idx + 1}. {u.name}<b>{u.count}</b>
                  </div>
                ))}
              </div>
            </div>

            <div className="list">
              {loading ? (
                <div className="empty">Yükleniyor...</div>
              ) : items.length === 0 ? (
                <div className="empty">Henüz kayıt yok. İlk iyiliği sen ekle.</div>
              ) : (
                items.map((item) => (
                  <article className="row" key={item.id}>
                    <div>
                      <div className="name">{item.isim} {item.soyisim}</div>
                      <div className="text">{item.iyilik}</div>
                    </div>
                    <div className="time">{timeAgo(item.tarih)}</div>
                  </article>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
