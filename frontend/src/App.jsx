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

function toSafeDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toSafeMs(value) {
  const date = toSafeDate(value);
  return date ? date.getTime() : 0;
}

function formatAgo(value) {
  const date = toSafeDate(value);
  if (!date) return 'az once';

  const diffMs = Date.now() - date.getTime();
  const min = Math.floor(diffMs / 60000);

  if (min < 1) return 'simdi';
  if (min < 60) return `${min} dk once`;

  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} sa once`;

  return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
}

function getInitials(isim, soyisim) {
  const a = (isim || "").charAt(0);
  const b = (soyisim || "").charAt(0);
  const v = (a + b).toUpperCase();
  return v || "IH";
}


function AdminPanel({
  token,
  onTokenChange,
  onSaveToken,
  pending,
  loading,
  status,
  onRefresh,
  onApprove,
  onReject,
}) {
  return (
    <div className="admin-shell container">
      <div className="admin-header">
        <div>
          <h1 className="title">Admin Panel</h1>
          <p className="sub">Bekleyen iyilikleri yönet</p>
        </div>
        <button className="btn admin-refresh" type="button" onClick={onRefresh}>
          Yenile
        </button>
      </div>

      <div className="admin-grid">
        <section className="glass-card admin-auth">
          <h3 className="section-title mini">Erişim</h3>
          <p className="admin-note">ADMIN_TOKEN değerini girerek paneli aç.</p>
          <div className="fields">
            <input
              className="input"
              type="password"
              placeholder="ADMIN_TOKEN"
              value={token}
              onChange={(e) => onTokenChange(e.target.value)}
            />
            <button className="btn" type="button" onClick={onSaveToken}>
              Kaydet
            </button>
          </div>
          {status?.message ? (
            <div className={`status ${status.type === 'error' ? 'error' : 'ok'}`}>
              {status.message}
            </div>
          ) : null}
        </section>

        <section className="glass-card admin-pending">
          <div className="flow-head">
            <h3 className="section-title mini">Bekleyenler</h3>
            <span className="pill">{pending.length} kayıt</span>
          </div>
          {loading ? (
            <div className="empty">Yükleniyor...</div>
          ) : pending.length === 0 ? (
            <div className="empty">Bekleyen kayıt yok.</div>
          ) : (
            <div className="pending-list">
              {pending.map((item) => (
                <div key={item.id} className="pending-row">
                  <div className="pending-left">
                    <div className="avatar">{getInitials(item.isim, item.soyisim)}</div>
                    <div>
                      <div className="item-name">{item.isim} {item.soyisim}</div>
                      <div className="item-text">{item.iyilik}</div>
                    </div>
                  </div>
                  <div className="pending-actions">
                    <button className="btn btn-ghost" type="button" onClick={() => onReject(item.id)}>
                      Reddet
                    </button>
                    <button className="btn" type="button" onClick={() => onApprove(item.id)}>
                      Onayla
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function RamazanPremiumUIInner() {
  const [time, setTime] = useState(new Date());
  const [targetDate] = useState(getTargetRamadanDate);
  const [countdown, setCountdown] = useState(() => getCountdownParts(getTargetRamadanDate()));

  const [iyilikler, setIyilikler] = useState([]);
  const [form, setForm] = useState({ isim: '', soyisim: '', iyilik: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState('');
const [success, setSuccess] = useState('');
const [gununNiyeti, setGununNiyeti] = useState({
  metin: 'Her iyilik yeni bir iyiliğin kapısını açar.',
  kaynak: 'Ramazan Ruhu',
});
const [adminToken, setAdminToken] = useState('');
const [adminStatus, setAdminStatus] = useState({ type: '', message: '' });
const [pendingItems, setPendingItems] = useState([]);
const [adminLoading, setAdminLoading] = useState(false);

  const fetchIyilikler = useCallback(async () => {
    try {
      const response = await fetch(`${CONFIG.WORKER_URL}/iyilikler`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Liste alinamadi.');
      }

      const sorted = [...(data.data || [])].sort(
        (a, b) => toSafeMs(b.tarih) - toSafeMs(a.tarih)
      );

      setIyilikler(sorted);
    } catch (e) {
      setError(e.message || 'Bağlantı hatası.');
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

useEffect(() => {
  let active = true;

  const fetchGununNiyeti = async () => {
    try {
      const response = await fetch(`${CONFIG.WORKER_URL}/gunun-niyeti`);
      const data = await response.json();

      if (!response.ok || !data?.success || !data?.data?.metin) return;
      if (!active) return;

      setGununNiyeti({
        metin: data.data.metin,
        kaynak: data.data.kaynak || 'Ramazan Ruhu',
      });
    } catch {
      // Sessiz fallback: kartta varsayilan metin kalir.
    }
  };

  fetchGununNiyeti();
  const niyetTimer = setInterval(fetchGununNiyeti, 60 * 60 * 1000);

  return () => {
    active = false;
    clearInterval(niyetTimer);
  };
}, []);

useEffect(() => {
  if (typeof window === 'undefined') return;
  const stored = window.localStorage.getItem('ih_admin_token');
  if (stored) setAdminToken(stored);
}, []);

const fetchPending = useCallback(async () => {
  if (!adminToken) return;
  setAdminLoading(true);
  setAdminStatus({ type: '', message: '' });

  try {
    const response = await fetch(`${CONFIG.WORKER_URL}/pending`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data?.error || 'Yetkisiz erişim.');
    }

    setPendingItems(data.data || []);
  } catch (err) {
    setAdminStatus({ type: 'error', message: err.message || 'Admin panel hatası.' });
  } finally {
    setAdminLoading(false);
  }
}, [adminToken]);

useEffect(() => {
  const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  if (isAdmin && adminToken) {
    fetchPending();
  }
}, [adminToken, fetchPending]);

const saveAdminToken = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('ih_admin_token', adminToken);
  }
  setAdminStatus({ type: 'ok', message: 'Token kaydedildi.' });
};

const approvePending = async (id) => {
  if (!adminToken) return;
  setAdminLoading(true);
  try {
    const response = await fetch(`${CONFIG.WORKER_URL}/pending/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error || 'Onay başarısız.');
    }
    setAdminStatus({ type: 'ok', message: 'Kayıt onaylandı.' });
    await fetchPending();
  } catch (err) {
    setAdminStatus({ type: 'error', message: err.message || 'Onay hatası.' });
  } finally {
    setAdminLoading(false);
  }
};

const rejectPending = async (id) => {
  if (!adminToken) return;
  setAdminLoading(true);
  try {
    const response = await fetch(`${CONFIG.WORKER_URL}/pending/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data?.error || 'Reddetme başarısız.');
    }
    setAdminStatus({ type: 'ok', message: 'Kayıt reddedildi.' });
    await fetchPending();
  } catch (err) {
    setAdminStatus({ type: 'error', message: err.message || 'Reddetme hatası.' });
  } finally {
    setAdminLoading(false);
  }
};


const countdownCells = useMemo(
  () => [
    { label: 'GÜN', val: String(countdown.d).padStart(2, '0') },
    { label: 'SAAT', val: String(countdown.h).padStart(2, '0') },
    { label: 'DAKİKA', val: String(countdown.m).padStart(2, '0') },
    { label: 'SANİYE', val: String(countdown.s).padStart(2, '0') },
  ],
  [countdown]
);

const leaderboard = useMemo(() => {
  const sayac = new Map();

  iyilikler.forEach((item) => {
    const adSoyad = `${item.isim || ''} ${item.soyisim || ''}`.trim() || 'Anonim';
    sayac.set(adSoyad, (sayac.get(adSoyad) || 0) + 1);
  });

  return [...sayac.entries()]
    .map(([isim, adet]) => ({ isim, adet }))
    .sort((a, b) => b.adet - a.adet || a.isim.localeCompare(b.isim, 'tr'))
    .slice(0, 5);
}, [iyilikler]);

const istatistikler = useMemo(() => {
  const now = new Date();
  const ayniGunMu = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const haftaBaslangici = new Date(now);
  haftaBaslangici.setHours(0, 0, 0, 0);
  haftaBaslangici.setDate(haftaBaslangici.getDate() - 6);

  let bugunEklenen = 0;
  let haftalikEklenen = 0;
  const katilimciSeti = new Set();

  iyilikler.forEach((item) => {
    const tarih = toSafeDate(item.tarih);
    const adSoyad = `${item.isim || ''} ${item.soyisim || ''}`.trim() || 'Anonim';
    katilimciSeti.add(adSoyad);

    if (tarih && ayniGunMu(tarih, now)) {
      bugunEklenen += 1;
    }

    if (tarih && tarih >= haftaBaslangici) {
      haftalikEklenen += 1;
    }
  });

  return {
    bugunEklenen,
    toplamIyilik: iyilikler.length,
    haftalikEklenen,
    katilimciSayisi: katilimciSeti.size,
  };
}, [iyilikler]);

const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

const submit = async (e) => {

    e.preventDefault();
    setError('');
    setSuccess('');

    const isim = form.isim.trim();
    const soyisim = form.soyisim.trim();
    const iyilik = form.iyilik.trim();

    if (!isim || !soyisim || !iyilik) {
      setError('Tüm alanları doldur.');
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
        throw new Error(message || 'Kayıt hatası.');
      }

      setForm({ isim: '', soyisim: '', iyilik: '' });
      setSuccess(data.pending ? 'İçerik onaya gönderildi.' : 'İyilik kaydedildi.');
      await fetchIyilikler();
    } catch (e) {
      setError(e.message || 'Bağlantı hatası.');
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
.leaderboard-card { grid-column: span 4; }
.stats-card { grid-column: span 8; }


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

.section-title.mini {
  font-size: 24px;
  margin-bottom: 12px;
}

.leaderboard-list {
  display: grid;
  gap: 10px;
}

.leader-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
}

.leader-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 800;
  color: #091122;
  background: linear-gradient(135deg, #f5e6a3, #d4af37);
  flex: 0 0 auto;
}

.leader-name {
  font-size: 14px;
  color: #e2e8f0;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.leader-count {
  font-size: 12px;
  color: #f8fafc;
  font-weight: 800;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 999px;
  padding: 4px 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.stat-box {
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 18px;
  padding: 14px;
  background: rgba(255,255,255,0.02);
}

.stat-label {
  display: block;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8ea0be;
  margin-bottom: 8px;
  font-weight: 700;
}

.stat-value {
  font-size: clamp(24px, 2.5vw, 38px);
  line-height: 1;
  font-weight: 800;
  color: #f8fafc;
}

.admin-shell {
  padding-top: 12px;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 24px;
}

.admin-auth { grid-column: span 4; }
.admin-pending { grid-column: span 8; }

.admin-note {
  margin: 0 0 12px;
  font-size: 12px;
  color: #8ea0be;
}

.admin-refresh {
  width: auto;
  padding: 10px 18px;
}

.pending-list {
  display: grid;
  gap: 12px;
}

.pending-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
}

.pending-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.pending-actions {
  display: flex;
  gap: 10px;
}

.btn-ghost {
  background: rgba(255,255,255,0.08);
  color: #e2e8f0;
}

.btn-ghost:hover {
  background: rgba(255,255,255,0.16);
}

@media (max-width: 1024px) {
  .admin-auth, .admin-pending { grid-column: span 12; }
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
  .countdown, .niyet, .form-card, .flow-card, .leaderboard-card, .stats-card {
    grid-column: span 12;
  }

  .count-item strong { font-size: 44px; }
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

      `}</style>

      <div className="orb orb-a" />
      <div className="orb orb-b" />

{isAdminRoute ? (
  <AdminPanel
    token={adminToken}
    onTokenChange={setAdminToken}
    onSaveToken={saveAdminToken}
    pending={pendingItems}
    loading={adminLoading}
    status={adminStatus}
    onRefresh={fetchPending}
    onApprove={approvePending}
    onReject={rejectPending}
  />
) : (
  <main className="container">
        <div className="topbar">
          <div>
            <h1 className="title">
              İyilik <span className="gold">Hareketi</span>
            </h1>
            <p className="sub">Ramazan 2026 • Topluluk Akışı</p>
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
              <span className="micro">Ramazan'a Kalan Süre ({targetDate.toLocaleDateString('tr-TR')})</span>
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
            <h3>Günün Niyeti</h3>
            <p>"{gununNiyeti.metin}"</p>
            <div className="line">{gununNiyeti.kaynak}</div>
          </section>

          <section className="glass-card form-card">
            <h3 className="section-title">İyilik Bırak</h3>
            <form className="fields" onSubmit={submit}>
              <input
                className="input"
                placeholder="Adınız"
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
                placeholder="Bugün ne yaptın?"
                value={form.iyilik}
                onChange={(e) => setForm((prev) => ({ ...prev, iyilik: e.target.value }))}
              />
              <button className="btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </form>

            {error ? <div className="status error">{error}</div> : null}
            {success ? <div className="status ok">{success}</div> : null}
          </section>

  <section className="glass-card flow-card">
    <div className="flow-head">
      <h3 className="section-title">İyilik Akışı</h3>
      <span className="pill">{iyilikler.length} Paylaşım</span>
    </div>

    <div className="list">
      {isLoading ? (
        <div className="empty">Yükleniyor...</div>
      ) : iyilikler.length === 0 ? (
        <div className="empty">Henüz paylaşım yok.</div>
      ) : (
        iyilikler.map((i) => (
          <div key={i.id} className="item">
            <div className="item-left">
              <div className="avatar">{getInitials(i.isim, i.soyisim)}</div>
              <div>
                <div className="item-name">{i.isim} {i.soyisim}</div>
                <div className="item-text">{i.iyilik || i.metin || '-'}</div>
              </div>
            </div>
            <div className="item-time">{formatAgo(i.tarih)}</div>
          </div>
        ))
      )}
    </div>
  </section>

  <section className="glass-card leaderboard-card">
    <div className="flow-head">
      <h3 className="section-title mini">Liderlik Tablosu</h3>
      <span className="pill">İlk 5</span>
    </div>

    <div className="leaderboard-list">
      {leaderboard.length === 0 ? (
        <div className="empty">Henüz liderlik verisi yok.</div>
      ) : (
        leaderboard.map((kisi, index) => (
          <div key={`${kisi.isim}-${index}`} className="leader-row">
            <div className="leader-meta">
              <span className="rank-badge">{index + 1}</span>
              <span className="leader-name">{kisi.isim}</span>
            </div>
            <span className="leader-count">{kisi.adet}</span>
          </div>
        ))
      )}
    </div>
  </section>

  <section className="glass-card stats-card">
    <div className="flow-head">
      <h3 className="section-title mini">İstatistikler</h3>
      <span className="pill">Canlı</span>
    </div>

    <div className="stats-grid">
      <div className="stat-box">
        <span className="stat-label">Bugün Eklenen</span>
        <strong className="stat-value">{istatistikler.bugunEklenen}</strong>
      </div>
      <div className="stat-box">
        <span className="stat-label">Toplam İyilik</span>
        <strong className="stat-value">{istatistikler.toplamIyilik}</strong>
      </div>
      <div className="stat-box">
        <span className="stat-label">Bu Hafta</span>
        <strong className="stat-value">{istatistikler.haftalikEklenen}</strong>
      </div>
      <div className="stat-box">
        <span className="stat-label">Katılımcı</span>
        <strong className="stat-value">{istatistikler.katilimciSayisi}</strong>
      </div>
    </div>
  </section>
</div>


        <footer className="footer">İyilikle Kalın • 2026</footer>
      </main>
      )}
    </div>
  );
}

class UIErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || 'Bilinmeyen hata',
    };
  }

  componentDidCatch(error, info) {
    console.error('UI runtime error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#020617',
          color: '#e2e8f0',
          padding: '24px',
          fontFamily: 'sans-serif',
        }}>
          <div style={{
            maxWidth: '760px',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px',
            padding: '20px',
            background: 'rgba(255,255,255,0.04)',
          }}>
            <h2 style={{ marginTop: 0 }}>UI Hatası Yakalandı</h2>
            <p style={{ opacity: 0.85 }}>
              Sayfa boş görünmesin diye hata yakalandı. Lütfen ekran görüntüsü ile bu mesajı paylaş.
            </p>
            <pre style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: '#0b1220',
              borderRadius: '10px',
              padding: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fda4af',
            }}>{this.state.message}</pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function RamazanPremiumUI() {
  return (
    <UIErrorBoundary>
      <RamazanPremiumUIInner />
    </UIErrorBoundary>
  );
}
