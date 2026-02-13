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

function initials(name, surname) {
  const n = (name || '').trim().charAt(0);
  const s = (surname || '').trim().charAt(0);
  return `${n}${s}`.toUpperCase() || 'IH';
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
    <div className="screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        :root {
          --bg: #eef5ff;
          --ink: #12253f;
          --muted: #5f7491;
          --line: rgba(36, 68, 111, 0.16);
          --panel: rgba(255, 255, 255, 0.82);
          --panel-strong: rgba(255, 255, 255, 0.94);
          --brand: #2f69d8;
          --brand-soft: rgba(47, 105, 216, 0.12);
          --ok: #13864f;
          --danger: #c73545;
          --shadow: 0 20px 55px rgba(27, 57, 99, 0.14);
        }

        * {
          box-sizing: border-box;
        }

        html, body {
          margin: 0;
          padding: 0;
        }

        .screen {
          min-height: 100vh;
          padding: 18px;
          color: var(--ink);
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          background:
            radial-gradient(900px 420px at -10% -10%, #dce9ff 0%, transparent 60%),
            radial-gradient(980px 430px at 110% -15%, #eaf1ff 0%, transparent 56%),
            linear-gradient(165deg, #f5f9ff 0%, #ecf3ff 55%, #f3f7ff 100%);
          position: relative;
          overflow-x: hidden;
        }

        .screen::before,
        .screen::after {
          content: '';
          position: fixed;
          border-radius: 999px;
          pointer-events: none;
          border: 1px solid rgba(67, 106, 169, 0.28);
          background: rgba(255, 255, 255, 0.32);
          z-index: 0;
        }

        .screen::before {
          width: 180px;
          height: 180px;
          top: 85px;
          left: -52px;
          box-shadow: inset 0 0 0 30px rgba(110, 150, 220, 0.05);
        }

        .screen::after {
          width: 120px;
          height: 120px;
          right: -25px;
          bottom: 45px;
          box-shadow: inset 0 0 0 18px rgba(110, 150, 220, 0.05);
        }

        .shell {
          position: relative;
          z-index: 1;
          max-width: 1240px;
          margin: 0 auto;
          display: grid;
          gap: 14px;
        }

        .panel {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 20px;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: var(--shadow);
        }

        .top {
          padding: 16px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: center;
        }

        .brand-title {
          margin: 0;
          font-size: clamp(30px, 4vw, 48px);
          line-height: 1;
          font-weight: 700;
          letter-spacing: 0.2px;
        }

        .brand-sub {
          margin: 8px 0 0;
          color: var(--muted);
          font-size: 13px;
          font-weight: 600;
        }

        .clock {
          text-align: right;
          border-left: 1px solid var(--line);
          padding-left: 14px;
        }

        .clock-time {
          font-size: clamp(24px, 3.2vw, 38px);
          line-height: 1;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .clock-date {
          margin-top: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
        }

        .count {
          padding: 14px;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 12px;
          align-items: center;
          background: linear-gradient(140deg, var(--panel-strong), var(--panel));
        }

        .count-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
          white-space: nowrap;
        }

        .timer {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .unit {
          border: 1px solid var(--line);
          border-radius: 12px;
          background: #ffffff;
          text-align: center;
          padding: 8px 5px;
        }

        .unit-value {
          font-size: clamp(22px, 2.8vw, 32px);
          line-height: 1;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .unit-name {
          margin-top: 3px;
          font-size: 11px;
          color: var(--muted);
          font-weight: 600;
          text-transform: uppercase;
        }

        .grid {
          display: grid;
          grid-template-columns: 380px minmax(0, 1fr);
          gap: 14px;
          align-items: start;
        }

        .left {
          padding: 16px;
          position: sticky;
          top: 14px;
        }

        .left h2,
        .right h2 {
          margin: 0;
          font-size: 28px;
          line-height: 1.05;
          font-weight: 700;
        }

        .left p {
          margin: 8px 0 14px;
          font-size: 13px;
          color: var(--muted);
          font-weight: 600;
        }

        .field {
          margin-bottom: 10px;
        }

        .field label {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          color: #49607f;
          font-weight: 600;
          letter-spacing: 0.1px;
        }

        .input,
        .textarea {
          width: 100%;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: #fff;
          color: var(--ink);
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          font-weight: 500;
          padding: 11px 12px;
          outline: none;
          transition: border-color .16s ease, box-shadow .16s ease;
        }

        .input:focus,
        .textarea:focus {
          border-color: rgba(47, 105, 216, 0.6);
          box-shadow: 0 0 0 3px rgba(47, 105, 216, 0.14);
        }

        .textarea {
          min-height: 110px;
          resize: vertical;
        }

        .submit {
          width: 100%;
          border: 0;
          border-radius: 12px;
          padding: 12px 14px;
          background: linear-gradient(130deg, #2d62cc, #4a80e3);
          color: #fff;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.2px;
          cursor: pointer;
          transition: transform .16s ease, box-shadow .16s ease;
        }

        .submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 26px rgba(47, 105, 216, 0.28);
        }

        .submit:disabled {
          opacity: .7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .msg {
          margin-top: 9px;
          font-size: 12px;
          font-weight: 600;
        }

        .msg.error {
          color: var(--danger);
        }

        .msg.success {
          color: var(--ok);
        }

        .tip {
          margin-top: 12px;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: var(--brand-soft);
          padding: 10px;
          font-size: 12px;
          color: #3f5880;
          font-weight: 600;
        }

        .right {
          padding: 14px;
          position: relative;
          overflow: hidden;
        }

        .right::after {
          content: '';
          position: absolute;
          right: 14px;
          bottom: 14px;
          width: 72px;
          height: 72px;
          border-radius: 999px;
          border: 1px solid rgba(67, 106, 169, 0.22);
          background: rgba(255, 255, 255, 0.38);
          box-shadow: inset 0 0 0 14px rgba(106, 142, 206, 0.08);
          pointer-events: none;
        }

        .feed-head {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items: start;
          margin-bottom: 10px;
        }

        .feed-sub {
          margin-top: 8px;
          font-size: 12px;
          color: var(--muted);
          font-weight: 600;
        }

        .leaders {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 8px;
          max-width: 56%;
        }

        .leader {
          border: 1px solid var(--line);
          border-radius: 999px;
          background: #fff;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 600;
          color: #425b7d;
          white-space: nowrap;
        }

        .leader strong {
          color: #2d62cc;
          margin-left: 5px;
        }

        .stream {
          border-top: 1px solid var(--line);
          max-height: 660px;
          overflow-y: auto;
        }

        .row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          border-bottom: 1px solid var(--line);
          padding: 11px 2px;
        }

        .row-main {
          display: flex;
          gap: 10px;
          min-width: 0;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          border: 1px solid rgba(47, 105, 216, 0.24);
          background: linear-gradient(145deg, #ecf3ff, #dceaff);
          color: #2d5cb8;
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 700;
          flex: 0 0 auto;
        }

        .name {
          font-size: 14px;
          font-weight: 600;
          color: #1b3354;
        }

        .text {
          margin-top: 3px;
          font-size: 14px;
          color: #314a6a;
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

        @media (max-width: 1080px) {
          .top {
            grid-template-columns: 1fr;
          }

          .clock {
            border-left: 0;
            border-top: 1px solid var(--line);
            padding-left: 0;
            padding-top: 10px;
            text-align: left;
          }

          .count {
            grid-template-columns: 1fr;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .left {
            position: static;
          }

          .leaders {
            max-width: 100%;
            justify-content: flex-start;
          }

          .stream {
            max-height: 520px;
          }
        }
      `}</style>

      <div className="shell">
        <header className="panel top">
          <div>
            <h1 className="brand-title">Iyilik Hareketi</h1>
            <p className="brand-sub">Herkesin katilabildigi, acik ve guvenli iyilik akisi</p>
          </div>

          <div className="clock">
            <div className="clock-time">{formatClock(now)}</div>
            <div className="clock-date">{formatDate(now)}</div>
          </div>
        </header>

        <section className="panel count">
          <div className="count-label">
            {countdown?.done
              ? 'Ramazan basladi. Hayirli Ramazanlar.'
              : `Ramazan'a kalan sure (${targetDate ? targetDate.toLocaleDateString('tr-TR') : '-'})`}
          </div>

          {!countdown?.done && countdown && (
            <div className="timer">
              <div className="unit">
                <div className="unit-value">{String(countdown.d).padStart(2, '0')}</div>
                <div className="unit-name">Gun</div>
              </div>
              <div className="unit">
                <div className="unit-value">{String(countdown.h).padStart(2, '0')}</div>
                <div className="unit-name">Saat</div>
              </div>
              <div className="unit">
                <div className="unit-value">{String(countdown.m).padStart(2, '0')}</div>
                <div className="unit-name">Dakika</div>
              </div>
              <div className="unit">
                <div className="unit-value">{String(countdown.s).padStart(2, '0')}</div>
                <div className="unit-name">Saniye</div>
              </div>
            </div>
          )}
        </section>

        <main className="grid">
          <section className="panel left">
            <h2>Iyilik Ekle</h2>
            <p>Bugun yaptigin iyiligi yaz, topluluga ilham olsun.</p>

            <form onSubmit={submit}>
              <div className="field">
                <label>Isim</label>
                <input
                  className="input"
                  value={form.isim}
                  onChange={(e) => setForm((prev) => ({ ...prev, isim: e.target.value }))}
                  placeholder="Adin"
                />
              </div>

              <div className="field">
                <label>Soyisim</label>
                <input
                  className="input"
                  value={form.soyisim}
                  onChange={(e) => setForm((prev) => ({ ...prev, soyisim: e.target.value }))}
                  placeholder="Soyadin"
                />
              </div>

              <div className="field">
                <label>Yaptigin Iyilik</label>
                <textarea
                  className="textarea"
                  value={form.iyilik}
                  onChange={(e) => setForm((prev) => ({ ...prev, iyilik: e.target.value }))}
                  maxLength={CONFIG.MAX_IYILIK_LENGTH}
                  placeholder="Kisa ve net bir cumleyle yaz"
                />
              </div>

              <button className="submit" disabled={submitting} type="submit">
                {submitting ? 'Kaydediliyor...' : 'Kaydet'}
              </button>

              {error ? <div className="msg error">{error}</div> : null}
              {success ? <div className="msg success">{success}</div> : null}
            </form>

            <div className="tip">Not: Mesajlar otomatik filtrelenir, ayni icerik tekrarina izin verilmez.</div>
          </section>

          <section className="panel right">
            <div className="feed-head">
              <div>
                <h2>Iyilik Akisi</h2>
                <div className="feed-sub">Toplam kayit: {items.length}</div>
              </div>

              <div className="leaders">
                {leaderboard.map((person, idx) => (
                  <div className="leader" key={person.name}>
                    {idx + 1}. {person.name}
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
                  <article className="row" key={item.id}>
                    <div className="row-main">
                      <div className="avatar">{initials(item.isim, item.soyisim)}</div>
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
