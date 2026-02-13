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
    <div className="scene">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');

        :root {
          --bg: #f8f5ee;
          --paper: rgba(255, 254, 251, 0.87);
          --paper-strong: rgba(255, 255, 255, 0.95);
          --ink: #1f2b3d;
          --muted: #5f6f86;
          --line: rgba(46, 68, 97, 0.17);
          --brand: #0f7f72;
          --brand-soft: rgba(15, 127, 114, 0.13);
          --accent: #d1a25a;
          --danger: #c33a4f;
          --ok: #0f8f59;
          --shadow: 0 22px 50px rgba(42, 50, 71, 0.13);
        }

        * { box-sizing: border-box; }

        html, body {
          margin: 0;
          padding: 0;
        }

        .scene {
          min-height: 100vh;
          padding: 20px;
          background:
            radial-gradient(900px 420px at -5% -10%, #f2ecd9 0%, transparent 55%),
            radial-gradient(900px 420px at 105% -10%, #e4f3ef 0%, transparent 52%),
            var(--bg);
          color: var(--ink);
          font-family: 'Outfit', sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .scene::before,
        .scene::after {
          content: '';
          position: fixed;
          pointer-events: none;
          border: 1px solid rgba(71, 102, 133, 0.24);
          background: rgba(255, 255, 255, 0.32);
          z-index: 0;
          opacity: 0.5;
          clip-path: polygon(50% 0%, 60% 20%, 82% 18%, 80% 40%, 100% 50%, 80% 60%, 82% 82%, 60% 80%, 50% 100%, 40% 80%, 18% 82%, 20% 60%, 0% 50%, 20% 40%, 18% 18%, 40% 20%);
        }

        .scene::before {
          width: 170px;
          height: 170px;
          left: -45px;
          top: 80px;
        }

        .scene::after {
          width: 120px;
          height: 120px;
          right: -25px;
          bottom: 70px;
        }

        .layout {
          position: relative;
          z-index: 1;
          max-width: 1240px;
          margin: 0 auto;
          display: grid;
          gap: 14px;
        }

        .glass {
          background: var(--paper);
          border: 1px solid var(--line);
          border-radius: 20px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: var(--shadow);
        }

        .hero {
          padding: 16px;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 12px;
          align-items: stretch;
        }

        .title-card {
          border: 1px solid var(--line);
          border-radius: 15px;
          background: var(--paper-strong);
          padding: 14px;
          display: grid;
          gap: 10px;
          align-content: start;
        }

        .eyebrow {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--muted);
        }

        .main-title {
          margin: 0;
          font-family: 'DM Serif Display', serif;
          font-size: clamp(34px, 5vw, 60px);
          line-height: 0.95;
          letter-spacing: 0.2px;
          color: var(--ink);
        }

        .main-sub {
          margin: 0;
          font-size: 14px;
          color: var(--muted);
          font-weight: 500;
          max-width: 50ch;
        }

        .clock-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-top: 1px solid var(--line);
          padding-top: 10px;
        }

        .clock-now {
          font-size: clamp(24px, 3.4vw, 38px);
          line-height: 1;
          font-weight: 700;
          color: var(--ink);
          font-variant-numeric: tabular-nums;
        }

        .clock-date {
          text-align: right;
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
        }

        .hero-note {
          border-radius: 15px;
          border: 1px solid rgba(13, 93, 83, 0.27);
          background: linear-gradient(145deg, #f6fffd, #eefaf7);
          padding: 14px;
          display: grid;
          align-content: center;
          gap: 8px;
        }

        .note-title {
          margin: 0;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #2b6f66;
          font-weight: 700;
        }

        .note-text {
          margin: 0;
          font-size: clamp(20px, 2.6vw, 32px);
          line-height: 1.2;
          font-family: 'DM Serif Display', serif;
          color: #1f4b45;
        }

        .note-small {
          margin: 0;
          font-size: 13px;
          color: #406e69;
        }

        .countdown {
          padding: 12px;
          display: grid;
          gap: 10px;
          grid-template-columns: auto 1fr;
          align-items: center;
        }

        .count-label {
          font-size: 13px;
          color: var(--muted);
          font-weight: 600;
          white-space: nowrap;
        }

        .count-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .box {
          border-radius: 12px;
          border: 1px solid var(--line);
          background: #fff;
          text-align: center;
          padding: 8px 4px;
        }

        .box-value {
          font-size: clamp(22px, 3vw, 32px);
          line-height: 1;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .box-name {
          font-size: 10px;
          margin-top: 4px;
          color: var(--muted);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .body {
          display: grid;
          grid-template-columns: 390px minmax(0, 1fr);
          gap: 14px;
          align-items: start;
        }

        .compose {
          padding: 16px;
          position: sticky;
          top: 14px;
        }

        .section-title {
          margin: 0;
          font-family: 'DM Serif Display', serif;
          font-size: 34px;
          line-height: 1;
        }

        .section-sub {
          margin: 7px 0 14px;
          color: var(--muted);
          font-size: 13px;
          font-weight: 500;
        }

        .field {
          margin-bottom: 10px;
        }

        .label {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          color: #4e5f79;
          letter-spacing: 0.2px;
          font-weight: 600;
        }

        .input,
        .textarea {
          width: 100%;
          font: inherit;
          font-weight: 500;
          color: var(--ink);
          border: 1px solid var(--line);
          border-radius: 12px;
          background: #fff;
          padding: 11px 12px;
          outline: none;
          transition: border-color .15s ease, box-shadow .15s ease;
        }

        .input:focus,
        .textarea:focus {
          border-color: rgba(15, 127, 114, 0.45);
          box-shadow: 0 0 0 3px rgba(15, 127, 114, 0.14);
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
          background: linear-gradient(135deg, #0f7f72, #2ca392);
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.2px;
          cursor: pointer;
          transition: transform .15s ease, box-shadow .15s ease;
        }

        .submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 22px rgba(12, 116, 104, 0.26);
        }

        .submit:disabled {
          opacity: 0.7;
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

        .tip {
          margin-top: 11px;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: var(--brand-soft);
          padding: 9px 10px;
          color: #295f57;
          font-size: 12px;
          font-weight: 600;
        }

        .feed {
          padding: 14px;
          position: relative;
        }

        .feed-head {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items: start;
          margin-bottom: 10px;
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

        .leader-pill {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 12px;
          color: #51617a;
          font-weight: 600;
          white-space: nowrap;
        }

        .leader-pill strong {
          color: #0f7f72;
          margin-left: 5px;
        }

        .stream {
          border-top: 1px solid var(--line);
          max-height: 700px;
          overflow-y: auto;
          padding-right: 2px;
        }

        .item {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          padding: 11px 2px;
          border-bottom: 1px solid var(--line);
          animation: fadeIn .28s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .item-main {
          display: flex;
          gap: 10px;
          min-width: 0;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(150deg, #e8f8f5, #d3eeea);
          border: 1px solid rgba(15, 127, 114, 0.3);
          display: grid;
          place-items: center;
          color: #0f6f64;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .name {
          font-size: 14px;
          font-weight: 700;
          color: #21324a;
        }

        .text {
          margin-top: 3px;
          font-size: 14px;
          color: #3a4d66;
          line-height: 1.45;
          word-break: break-word;
        }

        .ago {
          font-size: 12px;
          color: var(--muted);
          font-weight: 600;
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

          .compose {
            position: static;
          }

          .leaders {
            max-width: none;
            justify-content: flex-start;
          }

          .stream {
            max-height: 540px;
          }
        }
      `}</style>

      <div className="layout">
        <section className="hero glass">
          <article className="title-card">
            <div className="eyebrow">Topluluk Panosu</div>
            <h1 className="main-title">Iyilik Hareketi</h1>
            <p className="main-sub">Herkesin gorebildigi, gercek iyiliklerden olusan ortak bir akisa hos geldin.</p>

            <div className="clock-strip">
              <div className="clock-now">{formatClock(now)}</div>
              <div className="clock-date">{formatDate(now)}</div>
            </div>
          </article>

          <aside className="hero-note">
            <h2 className="note-title">Bugunun Niyeti</h2>
            <p className="note-text">Iyilik gorundukce buyur.</p>
            <p className="note-small">Kisa bir not birak, bir baskasina ilham olsun.</p>
          </aside>
        </section>

        <section className="countdown glass">
          <div className="count-label">
            {countdown?.done
              ? 'Ramazan basladi. Hayirli Ramazanlar.'
              : `Ramazan'a kalan sure (${targetDate ? targetDate.toLocaleDateString('tr-TR') : '-'})`}
          </div>

          {!countdown?.done && countdown && (
            <div className="count-grid">
              <div className="box"><div className="box-value">{String(countdown.d).padStart(2, '0')}</div><div className="box-name">Gun</div></div>
              <div className="box"><div className="box-value">{String(countdown.h).padStart(2, '0')}</div><div className="box-name">Saat</div></div>
              <div className="box"><div className="box-value">{String(countdown.m).padStart(2, '0')}</div><div className="box-name">Dakika</div></div>
              <div className="box"><div className="box-value">{String(countdown.s).padStart(2, '0')}</div><div className="box-name">Saniye</div></div>
            </div>
          )}
        </section>

        <main className="body">
          <section className="compose glass">
            <h2 className="section-title">Iyilik Ekle</h2>
            <p className="section-sub">Bugun ne yaptigini net ve kisa yaz.</p>

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
                  placeholder="Ornek: Yasli komsuma alisveriste yardim ettim"
                />
              </div>

              <button type="submit" className="submit" disabled={submitting}>
                {submitting ? 'Kaydediliyor...' : 'Kaydet'}
              </button>

              {error ? <div className="message error">{error}</div> : null}
              {success ? <div className="message success">{success}</div> : null}
            </form>

            <div className="tip">Not: Uygunsuz metinler filtrelenir, tekrar eden gonderiler engellenir.</div>
          </section>

          <section className="feed glass">
            <div className="feed-head">
              <div>
                <h2 className="section-title">Iyilik Akisi</h2>
                <div className="feed-count">Toplam kayit: {items.length}</div>
              </div>

              <div className="leaders">
                {leaderboard.map((person, i) => (
                  <div className="leader-pill" key={person.name}>
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
                  <article className="item" key={item.id}>
                    <div className="item-main">
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
