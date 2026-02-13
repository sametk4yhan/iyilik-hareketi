import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CONFIG } from './config';

function getNextRamadanDate() {
  const now = new Date();
  const base = new Date(CONFIG.RAMAZAN_START);
  if (Number.isNaN(base.getTime())) return null;

  const candidate = new Date(base);
  candidate.setFullYear(now.getFullYear());
  if (candidate <= now) candidate.setFullYear(now.getFullYear() + 1);

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

  if (min < 1) return 'simdi';
  if (min < 60) return `${min} dk once`;

  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} sa once`;

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

function getInitials(isim, soyisim) {
  return `${(isim || '').charAt(0)}${(soyisim || '').charAt(0)}`.toUpperCase() || 'IH';
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

      if (!data.success) {
        throw new Error(data.error || 'Liste alinamadi.');
      }

      const sorted = [...(data.data || [])].sort(
        (a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime()
      );

      setItems(sorted);
    } catch (e) {
      setError(e.message || 'Baglanti hatasi.');
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
      setNow(new Date());
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
      setError('Lutfen tum alanlari doldur.');
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
        throw new Error(msg || 'Kayit sirasinda hata olustu.');
      }

      setForm({ isim: '', soyisim: '', iyilik: '' });
      setSuccess(data.pending ? 'Icerik onaya gonderildi.' : 'Iyilik kaydedildi.');
      await fetchItems();
    } catch (e) {
      setError(e.message || 'Baglanti hatasi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,700&display=swap');

        :root {
          --bg: #f3f7fb;
          --ink: #15233a;
          --muted: #5f728f;
          --line: rgba(34, 61, 98, 0.16);
          --panel: rgba(255, 255, 255, 0.88);
          --panel-solid: #ffffff;
          --brand: #0a7a73;
          --brand-dark: #075f5a;
          --accent: #c38b3b;
          --danger: #c43949;
          --ok: #0e8a56;
          --shadow: 0 20px 45px rgba(34, 51, 86, 0.12);
        }

        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }

        .app {
          min-height: 100vh;
          padding: 20px;
          background:
            radial-gradient(900px 420px at -10% -10%, #d9e7ff 0%, transparent 55%),
            radial-gradient(850px 420px at 110% -15%, #ddf1ee 0%, transparent 55%),
            linear-gradient(170deg, #f6f9fe 0%, #f1f6fb 45%, #f6f8fc 100%);
          position: relative;
          overflow-x: hidden;
          color: var(--ink);
          font-family: 'Outfit', sans-serif;
        }

        .app::before,
        .app::after {
          content: '';
          position: fixed;
          pointer-events: none;
          z-index: 0;
          border: 1px solid rgba(71, 99, 139, 0.24);
          background: rgba(255, 255, 255, 0.34);
          clip-path: polygon(50% 0%, 62% 20%, 84% 16%, 80% 38%, 100% 50%, 80% 62%, 84% 84%, 62% 80%, 50% 100%, 38% 80%, 16% 84%, 20% 62%, 0% 50%, 20% 38%, 16% 16%, 38% 20%);
          opacity: 0.42;
        }

        .app::before {
          width: 180px;
          height: 180px;
          left: -48px;
          top: 72px;
        }

        .app::after {
          width: 130px;
          height: 130px;
          right: -28px;
          bottom: 50px;
        }

        .container {
          position: relative;
          z-index: 1;
          max-width: 1240px;
          margin: 0 auto;
          display: grid;
          gap: 14px;
        }

        .card {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 22px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: var(--shadow);
        }

        .hero {
          padding: 16px;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 12px;
        }

        .hero-main {
          border: 1px solid var(--line);
          border-radius: 16px;
          background: var(--panel-solid);
          padding: 14px;
          display: grid;
          gap: 10px;
        }

        .kicker {
          margin: 0;
          font-size: 11px;
          letter-spacing: 0.7px;
          text-transform: uppercase;
          color: var(--muted);
          font-weight: 700;
        }

        .title {
          margin: 0;
          font-family: 'Fraunces', serif;
          font-size: clamp(34px, 4.8vw, 60px);
          line-height: 0.95;
          letter-spacing: 0.2px;
        }

        .lead {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
          font-weight: 500;
          max-width: 58ch;
        }

        .hero-meta {
          border-top: 1px solid var(--line);
          padding-top: 10px;
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 10px;
        }

        .clock {
          font-size: clamp(26px, 3.4vw, 40px);
          line-height: 1;
          font-weight: 800;
          color: var(--ink);
          font-variant-numeric: tabular-nums;
        }

        .date {
          text-align: right;
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
        }

        .hero-side {
          border-radius: 16px;
          border: 1px solid rgba(10, 122, 115, 0.26);
          background: linear-gradient(145deg, #f4fffd, #eaf8f6);
          padding: 14px;
          display: grid;
          align-content: center;
          gap: 8px;
        }

        .hero-side h3 {
          margin: 0;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          color: #2f716b;
          font-weight: 700;
        }

        .hero-side p {
          margin: 0;
          font-family: 'Fraunces', serif;
          font-size: clamp(22px, 2.8vw, 34px);
          line-height: 1.2;
          color: #1f4f4b;
        }

        .hero-side small {
          color: #4a7571;
          font-size: 13px;
          font-weight: 500;
        }

        .countdown {
          padding: 12px;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 12px;
          align-items: center;
        }

        .countdown-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
          white-space: nowrap;
        }

        .countdown-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .count-box {
          border-radius: 12px;
          border: 1px solid var(--line);
          background: #fff;
          text-align: center;
          padding: 8px 4px;
        }

        .count-value {
          font-size: clamp(24px, 3vw, 34px);
          line-height: 1;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
        }

        .count-name {
          margin-top: 3px;
          font-size: 10px;
          letter-spacing: 0.5px;
          color: var(--muted);
          font-weight: 700;
          text-transform: uppercase;
        }

        .body {
          display: grid;
          grid-template-columns: 390px minmax(0, 1fr);
          gap: 14px;
          align-items: start;
        }

        .composer {
          padding: 16px;
          position: sticky;
          top: 14px;
        }

        .section-title {
          margin: 0;
          font-family: 'Fraunces', serif;
          font-size: 36px;
          line-height: 1;
        }

        .section-sub {
          margin: 8px 0 14px;
          font-size: 13px;
          color: var(--muted);
          font-weight: 500;
        }

        .field { margin-bottom: 10px; }

        .label {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          color: #4d607d;
          font-weight: 700;
          letter-spacing: 0.15px;
        }

        .input,
        .textarea {
          width: 100%;
          border-radius: 12px;
          border: 1px solid var(--line);
          background: #fff;
          color: var(--ink);
          font: inherit;
          font-weight: 500;
          padding: 11px 12px;
          outline: none;
          transition: border-color .15s ease, box-shadow .15s ease;
        }

        .input:focus,
        .textarea:focus {
          border-color: rgba(10, 122, 115, 0.45);
          box-shadow: 0 0 0 3px rgba(10, 122, 115, 0.14);
        }

        .textarea {
          min-height: 110px;
          resize: vertical;
        }

        .submit {
          width: 100%;
          border: 0;
          border-radius: 12px;
          padding: 12px;
          background: linear-gradient(135deg, var(--brand), #26a293);
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.2px;
          cursor: pointer;
          transition: transform .15s ease, box-shadow .15s ease;
        }

        .submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 22px rgba(10, 122, 115, 0.26);
        }

        .submit:disabled {
          opacity: 0.72;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .message {
          margin-top: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .message.error { color: var(--danger); }
        .message.success { color: var(--ok); }

        .note {
          margin-top: 11px;
          border-radius: 12px;
          border: 1px solid var(--line);
          background: rgba(195, 139, 59, 0.09);
          color: #70562d;
          font-size: 12px;
          font-weight: 600;
          padding: 9px 10px;
        }

        .feed {
          padding: 14px;
          position: relative;
        }

        .feed-head {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          margin-bottom: 10px;
          align-items: start;
        }

        .feed-count {
          margin-top: 7px;
          font-size: 12px;
          color: var(--muted);
          font-weight: 600;
        }

        .leaders {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          justify-content: flex-end;
          max-width: 58%;
        }

        .leader {
          border-radius: 999px;
          border: 1px solid var(--line);
          background: #fff;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 700;
          color: #566a86;
          white-space: nowrap;
        }

        .leader strong {
          color: var(--brand-dark);
          margin-left: 5px;
        }

        .stream {
          border-top: 1px solid var(--line);
          max-height: 700px;
          overflow-y: auto;
          padding-right: 2px;
        }

        .entry {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          padding: 11px 2px;
          border-bottom: 1px solid var(--line);
        }

        .entry-main {
          display: flex;
          gap: 10px;
          min-width: 0;
        }

        .avatar {
          width: 36px;
          height: 36px;
          flex: 0 0 auto;
          border-radius: 50%;
          border: 1px solid rgba(10, 122, 115, 0.3);
          background: linear-gradient(150deg, #e8f8f5, #d5eee9);
          color: var(--brand-dark);
          font-size: 12px;
          font-weight: 700;
          display: grid;
          place-items: center;
        }

        .name {
          font-size: 14px;
          font-weight: 700;
          color: var(--ink);
        }

        .text {
          margin-top: 3px;
          font-size: 14px;
          color: #3d516c;
          line-height: 1.45;
          word-break: break-word;
        }

        .ago {
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          white-space: nowrap;
          padding-top: 2px;
        }

        .empty {
          padding: 18px 0;
          color: var(--muted);
          font-size: 14px;
          font-weight: 600;
        }

        @media (max-width: 1100px) {
          .hero {
            grid-template-columns: 1fr;
          }

          .countdown {
            grid-template-columns: 1fr;
          }

          .body {
            grid-template-columns: 1fr;
          }

          .composer {
            position: static;
          }

          .leaders {
            max-width: 100%;
            justify-content: flex-start;
          }

          .stream {
            max-height: 540px;
          }
        }
      `}</style>

      <div className="container">
        <header className="card hero">
          <div className="hero-main">
            <p className="kicker">Ramazan Iyilik Platformu</p>
            <h1 className="title">Iyilik Hareketi</h1>
            <p className="lead">Yapilan iyilikleri gorunur hale getirip daha fazla kisinin harekete gecmesini saglayan ortak topluluk akisi.</p>

            <div className="hero-meta">
              <div className="clock">{formatClock(now)}</div>
              <div className="date">{formatDate(now)}</div>
            </div>
          </div>

          <aside className="hero-side">
            <h3>Bugunun Niyeti</h3>
            <p>Iyilik yayildikca guclenir.</p>
            <small>Kisa bir iyi ornek, bir baskasinin gununu degistirebilir.</small>
          </aside>
        </header>

        <section className="card countdown">
          <div className="countdown-label">
            {countdown?.done
              ? 'Ramazan basladi. Hayirli Ramazanlar.'
              : `Ramazan'a kalan sure (${targetDate ? targetDate.toLocaleDateString('tr-TR') : '-'})`}
          </div>

          {!countdown?.done && countdown && (
            <div className="countdown-grid">
              <div className="count-box"><div className="count-value">{String(countdown.d).padStart(2, '0')}</div><div className="count-name">Gun</div></div>
              <div className="count-box"><div className="count-value">{String(countdown.h).padStart(2, '0')}</div><div className="count-name">Saat</div></div>
              <div className="count-box"><div className="count-value">{String(countdown.m).padStart(2, '0')}</div><div className="count-name">Dakika</div></div>
              <div className="count-box"><div className="count-value">{String(countdown.s).padStart(2, '0')}</div><div className="count-name">Saniye</div></div>
            </div>
          )}
        </section>

        <main className="body">
          <section className="card composer">
            <h2 className="section-title">Iyilik Ekle</h2>
            <p className="section-sub">Bugun yaptigin iyiligi kisa ve net yaz.</p>

            <form onSubmit={submit}>
              <div className="field">
                <label className="label">Isim</label>
                <input
                  className="input"
                  value={form.isim}
                  onChange={(e) => setForm((prev) => ({ ...prev, isim: e.target.value }))}
                  placeholder="Adin"
                />
              </div>

              <div className="field">
                <label className="label">Soyisim</label>
                <input
                  className="input"
                  value={form.soyisim}
                  onChange={(e) => setForm((prev) => ({ ...prev, soyisim: e.target.value }))}
                  placeholder="Soyadin"
                />
              </div>

              <div className="field">
                <label className="label">Yapilan Iyilik</label>
                <textarea
                  className="textarea"
                  value={form.iyilik}
                  onChange={(e) => setForm((prev) => ({ ...prev, iyilik: e.target.value }))}
                  maxLength={CONFIG.MAX_IYILIK_LENGTH}
                  placeholder="Ornek: Yasli komsuma market alisverisinde yardim ettim"
                />
              </div>

              <button className="submit" type="submit" disabled={submitting}>
                {submitting ? 'Kaydediliyor...' : 'Kaydet'}
              </button>

              {error ? <div className="message error">{error}</div> : null}
              {success ? <div className="message success">{success}</div> : null}
            </form>

            <div className="note">Not: Uygunsuz icerik filtrelenir. Tekrarlayan spam mesajlar kabul edilmez.</div>
          </section>

          <section className="card feed">
            <div className="feed-head">
              <div>
                <h2 className="section-title">Iyilik Akisi</h2>
                <div className="feed-count">Toplam kayit: {items.length}</div>
              </div>

              <div className="leaders">
                {leaderboard.map((person, i) => (
                  <div className="leader" key={person.name}>
                    {i + 1}. {person.name}
                    <strong>{person.count}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="stream">
              {loading ? (
                <div className="empty">Yukleniyor...</div>
              ) : items.length === 0 ? (
                <div className="empty">Henuz kayit yok. Ilk iyiligi sen ekle.</div>
              ) : (
                items.map((item) => (
                  <article className="entry" key={item.id}>
                    <div className="entry-main">
                      <div className="avatar">{getInitials(item.isim, item.soyisim)}</div>
                      <div>
                        <div className="name">{item.isim} {item.soyisim}</div>
                        <div className="text">{item.iyilik}</div>
                      </div>
                    </div>
                    <div className="ago">{timeAgo(item.tarih)}</div>
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
