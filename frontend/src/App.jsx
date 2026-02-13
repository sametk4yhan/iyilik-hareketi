import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CONFIG } from './config';

function getCountdownParts(targetDate) {
  const now = Date.now();
  const diff = targetDate.getTime() - now;

  if (diff <= 0) {
    return { done: true, d: 0, h: 0, m: 0, s: 0 };
  }

  return {
    done: false,
    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
    h: Math.floor((diff / (1000 * 60 * 60)) % 24),
    m: Math.floor((diff / (1000 * 60)) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

function getTargetRamadanDate() {
  const base = new Date(CONFIG.RAMAZAN_START);
  if (Number.isNaN(base.getTime())) return new Date();

  const now = new Date();
  const candidate = new Date(base);
  candidate.setFullYear(now.getFullYear());

  if (candidate <= now) {
    candidate.setFullYear(now.getFullYear() + 1);
  }

  return candidate;
}

function formatAgo(value) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const min = Math.floor(diffMs / 60000);

  if (min < 1) return 'simdi';
  if (min < 60) return `${min} dk once`;

  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} sa once`;

  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
}

export default function RamazanPremiumUI() {
  const [time, setTime] = useState(new Date());
  const [targetDate] = useState(getTargetRamadanDate);
  const [countdown, setCountdown] = useState(() => getCountdownParts(getTargetRamadanDate()));

  const [iyilikler, setIyilikler] = useState([]);
  const [form, setForm] = useState({ isim: '', soyisim: '', iyilik: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchIyilikler = useCallback(async () => {
    try {
      const response = await fetch(`${CONFIG.WORKER_URL}/iyilikler`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Liste alinamadi.');
      }

      const sorted = [...(data.data || [])].sort(
        (a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime()
      );

      setIyilikler(sorted);
    } catch (e) {
      setError(e.message || 'Baglanti hatasi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIyilikler();
    const poll = setInterval(fetchIyilikler, 25000);
    return () => clearInterval(poll);
  }, [fetchIyilikler]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setCountdown(getCountdownParts(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const countdownCells = useMemo(
    () => [
      { label: 'GUN', val: String(countdown.d).padStart(2, '0') },
      { label: 'SAAT', val: String(countdown.h).padStart(2, '0') },
      { label: 'DAKIKA', val: String(countdown.m).padStart(2, '0') },
      { label: 'SANIYE', val: String(countdown.s).padStart(2, '0') },
    ],
    [countdown]
  );

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const isim = form.isim.trim();
    const soyisim = form.soyisim.trim();
    const iyilik = form.iyilik.trim();

    if (!isim || !soyisim || !iyilik) {
      setError('Tum alanlari doldur.');
      return;
    }

    if (iyilik.length > CONFIG.MAX_IYILIK_LENGTH) {
      setError(`Maksimum ${CONFIG.MAX_IYILIK_LENGTH} karakter.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${CONFIG.WORKER_URL}/iyilikler`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isim, soyisim, iyilik }),
      });

      const data = await response.json();

      if (!data.success) {
        const message = data.detail ? `${data.error} (${data.detail})` : data.error;
        throw new Error(message || 'Kayit hatasi.');
      }

      setForm({ isim: '', soyisim: '', iyilik: '' });
      setSuccess(data.pending ? 'Icerik onaya gonderildi.' : 'Iyilik kaydedildi.');
      await fetchIyilikler();
    } catch (e) {
      setError(e.message || 'Baglanti hatasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ramazan-ui">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');

        :root {
          --bg: #020617;
          --card: rgba(255, 255, 255, 0.03);
          --line: rgba(255, 255, 255, 0.08);
          --text: #d6deef;
          --muted: #8ea0be;
          --gold-1: #f5e6a3;
          --gold-2: #d4af37;
          --gold-3: #8a6d1d;
          --ok: #29d391;
          --error: #f07189;
        }

        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }

        .ramazan-ui {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
          overflow-x: hidden;
          padding: 48px 24px;
        }

        .ramazan-ui::selection {
          background: rgba(212, 175, 55, 0.3);
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
          pointer-events: none;
        }

        .orb-a {
          width: 500px;
          height: 500px;
          background: rgba(30, 58, 138, 0.2);
          top: -80px;
          left: -80px;
        }

        .orb-b {
          width: 400px;
          height: 400px;
          background: rgba(120, 53, 15, 0.22);
          right: 40px;
          bottom: 40px;
        }

        .container {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 32px;
          margin-bottom: 42px;
          flex-wrap: wrap;
        }

        .title {
          font-size: clamp(40px, 6vw, 72px);
          line-height: 1;
          font-weight: 800;
          margin: 0 0 10px;
          letter-spacing: -0.02em;
        }

        .gold {
          background: linear-gradient(135deg, var(--gold-1) 0%, var(--gold-2) 50%, var(--gold-3) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sub {
          margin: 0;
          color: #7f8ba3;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-size: 11px;
          font-weight: 800;
        }

        .time-wrap {
          text-align: right;
        }

        .clock {
          font-size: clamp(32px, 4vw, 56px);
          font-weight: 300;
          letter-spacing: -0.03em;
          color: rgba(255,255,255,0.92);
          line-height: 1;
        }

        .date {
          margin-top: 6px;
          color: rgba(212, 175, 55, 0.65);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-size: 11px;
          font-weight: 700;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 24px;
        }

        .glass-card {
          background: var(--card);
          backdrop-filter: blur(20px);
          border: 1px solid var(--line);
          border-radius: 28px;
          padding: 28px;
          transition: all 0.3s ease;
        }

        .glass-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(212, 175, 55, 0.22);
          transform: translateY(-4px);
        }

        .countdown { grid-column: span 8; }
        .niyet { grid-column: span 4; }
        .form-card { grid-column: span 4; }
        .flow-card { grid-column: span 8; }

        .label-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 99px;
          background: #f59e0b;
        }

        .micro {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #96a1b8;
          font-weight: 700;
        }

        .count-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .count-item strong {
          display: block;
          font-size: clamp(36px, 5vw, 72px);
          line-height: 1;
          color: rgba(255,255,255,0.94);
          margin-bottom: 4px;
        }

        .count-item span {
          font-size: 10px;
          letter-spacing: 0.2em;
          color: #6f7f9b;
          font-weight: 700;
        }

        .niyet {
          background: linear-gradient(140deg, #d6ab51, #a57422);
          color: #1f1b12;
          box-shadow: 0 20px 35px rgba(110, 71, 13, 0.32);
        }

        .niyet h3 {
          margin: 0 0 14px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          opacity: 0.7;
        }

        .niyet p {
          margin: 0;
          font-size: clamp(24px, 3vw, 34px);
          line-height: 1.2;
          font-weight: 800;
        }

        .niyet .line {
          margin-top: 26px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-weight: 700;
        }

        .niyet .line::before {
          content: '';
          width: 28px;
          height: 1px;
          background: rgba(32, 24, 12, 0.35);
        }

        .section-title {
          margin: 0 0 18px;
          font-size: 30px;
          font-weight: 800;
          color: rgba(255,255,255,0.95);
          letter-spacing: -0.02em;
        }

        .fields {
          display: grid;
          gap: 12px;
        }

        .input,
        .textarea {
          width: 100%;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: rgba(236,242,255,0.95);
          font: inherit;
          font-size: 14px;
          padding: 14px 16px;
          outline: none;
          transition: border-color .2s ease;
        }

        .input::placeholder,
        .textarea::placeholder { color: #8ea0be; }

        .input:focus,
        .textarea:focus {
          border-color: rgba(212, 175, 55, 0.45);
        }

        .textarea { resize: none; min-height: 110px; }

        .btn {
          width: 100%;
          border: 0;
          border-radius: 16px;
          padding: 14px;
          background: #f8fafc;
          color: #0f172a;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: background .2s ease;
        }

        .btn:hover { background: #f4d27a; }
        .btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .status {
          font-size: 12px;
          margin-top: 8px;
          font-weight: 600;
        }

        .status.error { color: var(--error); }
        .status.ok { color: var(--ok); }

        .flow-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .pill {
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 999px;
          padding: 6px 10px;
          font-weight: 700;
        }

        .list {
          display: grid;
          gap: 10px;
        }

        .item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 18px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
        }

        .item-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .avatar {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: linear-gradient(145deg, #3b82f6, #f59e0b);
          display: grid;
          place-items: center;
          color: #fff;
          font-weight: 800;
          flex: 0 0 auto;
        }

        .item-name {
          font-size: 15px;
          font-weight: 800;
          color: #f1f5f9;
          margin-bottom: 2px;
        }

        .item-text {
          font-size: 14px;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 520px;
        }

        .item-time {
          font-size: 10px;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 700;
          flex: 0 0 auto;
        }

        .empty {
          color: #94a3b8;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 0;
        }

        .footer {
          margin-top: 48px;
          text-align: center;
          opacity: 0.35;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          font-weight: 700;
          color: #b7c2d7;
        }

        @media (max-width: 1024px) {
          .countdown, .niyet, .form-card, .flow-card {
            grid-column: span 12;
          }

          .count-item strong { font-size: 44px; }
        }
      `}</style>

      <div className="orb orb-a" />
      <div className="orb orb-b" />

      <main className="container">
        <div className="topbar">
          <div>
            <h1 className="title">
              Iyilik <span className="gold">Hareketi</span>
            </h1>
            <p className="sub">Ramazan 2026 • Topluluk Akişi</p>
          </div>

          <div className="time-wrap">
            <div className="clock">
              {time.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>
            <div className="date">
              {time.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
            </div>
          </div>
        </div>

        <div className="grid">
          <section className="glass-card countdown">
            <div className="label-row">
              <span className="dot" />
              <span className="micro">Ramazan'a Kalan Sure ({targetDate.toLocaleDateString('tr-TR')})</span>
            </div>
            <div className="count-grid">
              {countdownCells.map((item) => (
                <div key={item.label} className="count-item">
                  <strong>{item.val}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card niyet">
            <h3>Gunun Niyeti</h3>
            <p>"Her iyilik yeni bir iyiligin kapisini acar."</p>
            <div className="line">Ramazan Ruhu</div>
          </section>

          <section className="glass-card form-card">
            <h3 className="section-title">Iyilik Birak</h3>
            <form className="fields" onSubmit={submit}>
              <input
                className="input"
                placeholder="Adiniz"
                value={form.isim}
                onChange={(e) => setForm((prev) => ({ ...prev, isim: e.target.value }))}
              />
              <input
                className="input"
                placeholder="Soyisminiz"
                value={form.soyisim}
                onChange={(e) => setForm((prev) => ({ ...prev, soyisim: e.target.value }))}
              />
              <textarea
                className="textarea"
                placeholder="Bugun ne yaptin?"
                value={form.iyilik}
                onChange={(e) => setForm((prev) => ({ ...prev, iyilik: e.target.value }))}
              />
              <button className="btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Gonderiliyor...' : 'Gonder'}
              </button>
            </form>

            {error ? <div className="status error">{error}</div> : null}
            {success ? <div className="status ok">{success}</div> : null}
          </section>

          <section className="glass-card flow-card">
            <div className="flow-head">
              <h3 className="section-title">Iyilik Akisi</h3>
              <span className="pill">{iyilikler.length} Paylasim</span>
            </div>

            <div className="list">
              {isLoading ? (
                <div className="empty">Yukleniyor...</div>
              ) : iyilikler.length === 0 ? (
                <div className="empty">Henuz paylasim yok.</div>
              ) : (
                iyilikler.map((i) => (
                  <div key={i.id} className="item">
                    <div className="item-left">
                      <div className="avatar">{getInitials(i.isim, i.soyisim)}</div>
                      <div>
                        <div className="item-name">{i.isim} {i.soyisim}</div>
                        <div className="item-text">{i.iyilik}</div>
                      </div>
                    </div>
                    <div className="item-time">{formatAgo(i.tarih)}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <footer className="footer">Iyilikle Kalin • 2026</footer>
      </main>
    </div>
  );
}
