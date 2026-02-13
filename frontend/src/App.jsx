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

function getRankMedal(rank) {
  if (rank === 0) return '🥇';
  if (rank === 1) return '🥈';
  if (rank === 2) return '🥉';
  return '•';
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
        throw new Error(data.error || 'Liste alınamadı.');
      }

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
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Marcellus&display=swap');

        :root {
          --bg: #eef4ff;
          --ink-900: #17283e;
          --ink-700: #3f536f;
          --ink-500: #637790;
          --line: rgba(39, 64, 98, 0.16);
          --glass: rgba(255, 255, 255, 0.66);
          --glass-strong: rgba(255, 255, 255, 0.86);
          --brand: #2e63c8;
          --brand-2: #5a90eb;
          --ok: #128d54;
          --danger: #bf2e40;
          --shadow: 0 24px 70px rgba(27, 52, 89, 0.13);
        }

        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }

        .page {
          position: relative;
          min-height: 100vh;
          padding: 20px;
          color: var(--ink-900);
          font-family: 'Manrope', sans-serif;
          background:
            radial-gradient(1050px 480px at -5% -10%, #dbe8ff 0%, transparent 58%),
            radial-gradient(900px 420px at 110% -10%, #e8f0ff 0%, transparent 56%),
            linear-gradient(165deg, #f2f7ff 0%, #edf3ff 46%, #f4f8ff 100%);
          overflow-x: hidden;
        }

        .page::before,
        .page::after {
          content: '';
          position: fixed;
          width: 240px;
          aspect-ratio: 1;
          pointer-events: none;
          z-index: 0;
          opacity: 0.25;
          border: 1px solid rgba(84, 122, 186, 0.35);
          background: radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.6), rgba(142, 172, 226, 0.08));
          clip-path: polygon(50% 0%, 63% 20%, 85% 15%, 80% 37%, 100% 50%, 80% 63%, 85% 85%, 63% 80%, 50% 100%, 37% 80%, 15% 85%, 20% 63%, 0% 50%, 20% 37%, 15% 15%, 37% 20%);
          animation: motifFloat 11s ease-in-out infinite;
        }

        .page::before {
          top: 58px;
          left: -70px;
        }

        .page::after {
          width: 170px;
          right: -36px;
          bottom: 42px;
          animation-delay: 1.8s;
          animation-duration: 13s;
        }

        @keyframes motifFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }

        .app {
          position: relative;
          z-index: 1;
          max-width: 1220px;
          margin: 0 auto;
          display: grid;
          gap: 14px;
        }

        .glass {
          border: 1px solid var(--line);
          border-radius: 20px;
          background: var(--glass);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: var(--shadow);
        }

        .hero {
          padding: 18px;
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.9fr);
          gap: 14px;
          align-items: stretch;
        }

        .hero-left {
          display: grid;
          gap: 12px;
        }

        .brand {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px;
          border-radius: 16px;
          background: var(--glass-strong);
          border: 1px solid var(--line);
        }

        .title-wrap h1 {
          margin: 0;
          font-family: 'Marcellus', serif;
          font-size: clamp(32px, 4.2vw, 52px);
          line-height: 0.95;
          letter-spacing: 0.2px;
        }

        .title-wrap p {
          margin: 8px 0 0;
          color: var(--ink-500);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .clock {
          min-width: 230px;
          text-align: right;
          border-left: 1px solid var(--line);
          padding-left: 14px;
        }

        .clock-time {
          font-size: clamp(22px, 3.2vw, 36px);
          font-weight: 800;
          line-height: 1;
          color: var(--ink-900);
          font-variant-numeric: tabular-nums;
        }

        .clock-date {
          margin-top: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-700);
          text-transform: capitalize;
        }

        .countdown {
          position: relative;
          overflow: hidden;
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 16px;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.85), rgba(242, 248, 255, 0.62));
        }

        .countdown::before {
          content: '☾';
          position: absolute;
          right: 16px;
          top: 12px;
          color: rgba(46, 99, 200, 0.16);
          font-size: 30px;
          line-height: 1;
        }

        .countdown-label {
          margin: 0 0 11px;
          color: var(--ink-700);
          font-size: 13px;
          font-weight: 700;
        }

        .timer {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .timer-unit {
          border-radius: 12px;
          border: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.82);
          text-align: center;
          padding: 10px 4px;
          animation: raise .45s ease both;
        }

        .timer-unit:nth-child(2) { animation-delay: .08s; }
        .timer-unit:nth-child(3) { animation-delay: .16s; }
        .timer-unit:nth-child(4) { animation-delay: .24s; }

        @keyframes raise {
          from { opacity: 0; transform: translateY(9px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .timer-value {
          font-size: clamp(20px, 2.5vw, 30px);
          line-height: 1;
          font-weight: 800;
          color: var(--ink-900);
          font-variant-numeric: tabular-nums;
        }

        .timer-name {
          margin-top: 4px;
          font-size: 11px;
          color: var(--ink-500);
          font-weight: 700;
          letter-spacing: 0.4px;
          text-transform: uppercase;
        }

        .hero-right {
          border: 1px solid var(--line);
          border-radius: 16px;
          background: linear-gradient(150deg, rgba(53, 99, 179, 0.93), rgba(33, 70, 136, 0.9));
          color: #f3f8ff;
          padding: 15px;
          display: grid;
          align-content: center;
          gap: 8px;
        }

        .quote-label {
          font-size: 12px;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          opacity: 0.78;
          font-weight: 700;
        }

        .quote {
          font-family: 'Marcellus', serif;
          font-size: clamp(22px, 2.6vw, 33px);
          line-height: 1.2;
          letter-spacing: 0.2px;
          margin: 0;
        }

        .quote-note {
          font-size: 13px;
          color: rgba(234, 243, 255, 0.88);
          margin: 0;
          max-width: 35ch;
        }

        .content {
          display: grid;
          grid-template-columns: 370px minmax(0, 1fr);
          gap: 14px;
          align-items: start;
        }

        .composer {
          position: sticky;
          top: 16px;
          padding: 16px;
        }

        .composer h2,
        .feed-head h2 {
          margin: 0;
          font-family: 'Marcellus', serif;
          font-size: 30px;
          letter-spacing: 0.2px;
        }

        .composer-sub {
          margin: 7px 0 14px;
          font-size: 13px;
          color: var(--ink-700);
          font-weight: 600;
        }

        .field {
          margin-bottom: 10px;
        }

        .field label {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          color: var(--ink-700);
          font-weight: 700;
          letter-spacing: 0.2px;
        }

        .input,
        .textarea {
          width: 100%;
          border-radius: 12px;
          border: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.92);
          color: var(--ink-900);
          font: inherit;
          padding: 11px 12px;
          outline: none;
          transition: border-color .18s ease, box-shadow .18s ease;
        }

        .input:focus,
        .textarea:focus {
          border-color: rgba(46, 99, 200, 0.62);
          box-shadow: 0 0 0 3px rgba(87, 137, 228, 0.18);
        }

        .textarea {
          min-height: 112px;
          resize: vertical;
        }

        .submit {
          width: 100%;
          border: 0;
          border-radius: 12px;
          padding: 11px 14px;
          background: linear-gradient(130deg, var(--brand), var(--brand-2));
          color: #fff;
          font-weight: 800;
          letter-spacing: 0.2px;
          cursor: pointer;
          transition: transform .18s ease, box-shadow .18s ease;
        }

        .submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(34, 81, 156, 0.26);
        }

        .submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .message {
          margin-top: 9px;
          font-size: 12px;
          font-weight: 700;
        }

        .message.error { color: var(--danger); }
        .message.success { color: var(--ok); }

        .feed {
          padding: 14px;
        }

        .feed-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }

        .feed-count {
          margin-top: 8px;
          color: var(--ink-700);
          font-size: 12px;
          font-weight: 700;
        }

        .leaderboard {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 7px;
          max-width: 52%;
        }

        .leader-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.88);
          font-size: 12px;
          font-weight: 700;
          color: var(--ink-700);
          white-space: nowrap;
        }

        .leader-pill strong {
          color: var(--brand);
        }

        .stream {
          border-top: 1px solid var(--line);
          max-height: 645px;
          overflow-y: auto;
        }

        .entry {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          padding: 12px 2px;
          border-bottom: 1px solid var(--line);
          animation: fadeUp .34s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .entry-top {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 3px;
        }

        .dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: rgba(46, 99, 200, 0.7);
          box-shadow: 0 0 0 4px rgba(46, 99, 200, 0.14);
          flex: 0 0 auto;
        }

        .name {
          font-size: 14px;
          font-weight: 800;
          color: var(--ink-900);
        }

        .text {
          color: #334a66;
          font-size: 14px;
          line-height: 1.5;
        }

        .ago {
          font-size: 12px;
          font-weight: 700;
          color: var(--ink-500);
          white-space: nowrap;
          padding-top: 2px;
        }

        .empty {
          padding: 20px 0;
          color: var(--ink-500);
          font-size: 14px;
          font-weight: 600;
        }

        .feed-motif {
          position: absolute;
          right: 16px;
          bottom: 16px;
          width: 78px;
          aspect-ratio: 1;
          border-radius: 999px;
          border: 1px solid rgba(76, 112, 168, 0.24);
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7), rgba(155,184,232,0.15));
          opacity: 0.5;
          pointer-events: none;
        }

        @media (max-width: 1060px) {
          .hero {
            grid-template-columns: 1fr;
          }

          .clock {
            border-left: 0;
            border-top: 1px solid var(--line);
            padding-left: 0;
            padding-top: 10px;
            text-align: left;
            min-width: 0;
          }

          .content {
            grid-template-columns: 1fr;
          }

          .composer {
            position: static;
          }

          .leaderboard {
            max-width: none;
            justify-content: flex-start;
          }

          .stream {
            max-height: 520px;
          }
        }
      `}</style>

      <div className="app">
        <section className="hero glass">
          <div className="hero-left">
            <div className="brand">
              <div className="title-wrap">
                <h1>İyilik Hareketi</h1>
                <p>Ramazan boyunca iyilikleri büyüten ortak akış</p>
              </div>

              <div className="clock">
                <div className="clock-time">{formatClock(now)}</div>
                <div className="clock-date">{formatDate(now)}</div>
              </div>
            </div>

            <div className="countdown">
              <p className="countdown-label">
                {countdown?.done
                  ? 'Ramazan başladı. Hayırlı Ramazanlar.'
                  : `Ramazan'a kalan süre (${targetDate ? targetDate.toLocaleDateString('tr-TR') : '-'})`}
              </p>

              {!countdown?.done && countdown && (
                <div className="timer">
                  <div className="timer-unit">
                    <div className="timer-value">{String(countdown.d).padStart(2, '0')}</div>
                    <div className="timer-name">Gün</div>
                  </div>
                  <div className="timer-unit">
                    <div className="timer-value">{String(countdown.h).padStart(2, '0')}</div>
                    <div className="timer-name">Saat</div>
                  </div>
                  <div className="timer-unit">
                    <div className="timer-value">{String(countdown.m).padStart(2, '0')}</div>
                    <div className="timer-name">Dakika</div>
                  </div>
                  <div className="timer-unit">
                    <div className="timer-value">{String(countdown.s).padStart(2, '0')}</div>
                    <div className="timer-name">Saniye</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="hero-right">
            <div className="quote-label">Niyet</div>
            <p className="quote">Her iyilik yeni bir iyiliğin kapısını açar.</p>
            <p className="quote-note">Bu akış, yapılan güzel işleri görünür kılarak daha fazla insanı harekete geçirmek için var.</p>
          </aside>
        </section>

        <section className="content">
          <article className="composer glass">
            <h2>İyilik Ekle</h2>
            <p className="composer-sub">Kısa, net ve gerçek bir iyilik cümlesi yaz.</p>

            <form onSubmit={submit}>
              <div className="field">
                <label>İsim</label>
                <input
                  className="input"
                  value={form.isim}
                  onChange={(e) => setForm((prev) => ({ ...prev, isim: e.target.value }))}
                  placeholder="Adın"
                />
              </div>

              <div className="field">
                <label>Soyisim</label>
                <input
                  className="input"
                  value={form.soyisim}
                  onChange={(e) => setForm((prev) => ({ ...prev, soyisim: e.target.value }))}
                  placeholder="Soyadın"
                />
              </div>

              <div className="field">
                <label>Yapılan İyilik</label>
                <textarea
                  className="textarea"
                  value={form.iyilik}
                  onChange={(e) => setForm((prev) => ({ ...prev, iyilik: e.target.value }))}
                  maxLength={CONFIG.MAX_IYILIK_LENGTH}
                  placeholder="Bugün yaptığın iyiliği yaz"
                />
              </div>

              <button className="submit" disabled={submitting} type="submit">
                {submitting ? 'Kaydediliyor...' : 'Kaydet'}
              </button>

              {error ? <div className="message error">{error}</div> : null}
              {success ? <div className="message success">{success}</div> : null}
            </form>
          </article>

          <article className="feed glass" style={{ position: 'relative' }}>
            <header className="feed-head">
              <div>
                <h2>İyilik Akışı</h2>
                <div className="feed-count">Toplam kayıt: {items.length}</div>
              </div>

              <div className="leaderboard">
                {leaderboard.map((person, index) => (
                  <div className="leader-pill" key={person.name}>
                    <span>{getRankMedal(index)}</span>
                    <span>{person.name}</span>
                    <strong>{person.count}</strong>
                  </div>
                ))}
              </div>
            </header>

            <div className="stream">
              {loading ? (
                <div className="empty">Yükleniyor...</div>
              ) : items.length === 0 ? (
                <div className="empty">Henüz kayıt yok. İlk iyiliği sen ekle.</div>
              ) : (
                items.map((item) => (
                  <article className="entry" key={item.id}>
                    <div>
                      <div className="entry-top">
                        <span className="dot" />
                        <div className="name">{item.isim} {item.soyisim}</div>
                      </div>
                      <div className="text">{item.iyilik}</div>
                    </div>
                    <div className="ago">{timeAgo(item.tarih)}</div>
                  </article>
                ))
              )}
            </div>

            <div className="feed-motif" />
          </article>
        </section>
      </div>
    </div>
  );
}
