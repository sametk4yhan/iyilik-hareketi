import React, { useCallback, useEffect, useMemo, useState } from 'react';
import html2canvas from 'html2canvas';
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

function getRamadanEndDate() {
  const target = new Date(CONFIG.RAMAZAN_END);
  if (Number.isNaN(target.getTime())) return new Date();
  return target;
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

// Confetti component
function Confetti({ active }) {
  if (!active) return null;
  
  const colors = ['#f5e6a3', '#d4af37', '#29d391', '#3b82f6', '#f59e0b'];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 8,
  }));

  return (
    <div className="confetti-container">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  );
}

// Stars background component
function StarsBackground() {
  const stars = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3,
    })), []
  );

  return (
    <div className="stars-container">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// Share Card Modal Component
function ShareCardModal({ iyilik, isim, soyisim, tarih, onClose }) {
  const cardRef = React.useRef(null);

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: '#020617', scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `iyilik-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      alert('Kart indirilemedi. Ekran görüntüsü alabilirsiniz.');
    }
  };

  const shareToTwitter = () => {
    const text = `🌙 "${iyilik}"\n\nRamazan'da iyilik hareketi!\n`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent('https://iyilikhareketi.online')}`, '_blank');
  };

  const shareToWhatsApp = () => {
    const text = `🌙 *İyilik Hareketi*\n\n"${iyilik}"\n\n— ${isim} ${soyisim}\n\nSen de katıl: https://iyilikhareketi.online`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <button className="share-close" onClick={onClose}>×</button>
        <h3 className="share-title">İyiliğini Paylaş! 🎉</h3>
        
        <div className="share-card-wrapper">
          <div ref={cardRef} style={{
            width: '376px',
            height: '376px',
            background: 'linear-gradient(135deg, #020617, #0a1628)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0' }}>
              <span style={{ fontSize: '24px', marginRight: '10px' }}>🌙</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#d4af37' }}>İyilik Hareketi</span>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', textAlign: 'center', lineHeight: '1.4', margin: 0 }}>"{iyilik}"</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #f59e0b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '14px',
                  marginRight: '10px',
                  flexShrink: 0,
                }}>{getInitials(isim, soyisim)}</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>{isim} {soyisim}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{formatDate(tarih)}</div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#d4af37', fontWeight: 700 }}>iyilikhareketi.online</div>
            </div>
          </div>
        </div>
        
        <div className="share-buttons-grid">
          <button className="share-btn download" onClick={downloadCard}>📥 İndir</button>
          <button className="share-btn twitter" onClick={shareToTwitter}>𝕏 Twitter</button>
          <button className="share-btn whatsapp" onClick={shareToWhatsApp}>💬 WhatsApp</button>
          <button className="share-btn copy" onClick={() => { navigator.clipboard.writeText('https://iyilikhareketi.online'); alert('Link kopyalandı!'); }}>🔗 Kopyala</button>
        </div>
      </div>
    </div>
  );
}


const IYILIK_FIKIRLERI = [
  { gun: 1, baslik: 'Selam Ver', aciklama: 'Tanımadığın birine gülümseyerek selam ver.', kategori: 'sosyal' },
  { gun: 2, baslik: 'Yaşlıya Yardım', aciklama: 'Markette veya sokakta bir yaşlıya yardım et.', kategori: 'yardım' },
  { gun: 3, baslik: 'Aile Ziyareti', aciklama: 'Uzun süredir görmediğin bir akrabanı ara veya ziyaret et.', kategori: 'aile' },
  { gun: 4, baslik: 'Sadaka Ver', aciklama: 'İhtiyaç sahibine küçük de olsa bir bağışta bulun.', kategori: 'maddi' },
  { gun: 5, baslik: 'Ağaç Dik', aciklama: 'Bir fidan veya çiçek dik, doğaya katkıda bulun.', kategori: 'çevre' },
  { gun: 6, baslik: 'Dua Et', aciklama: 'Tanıdığın veya tanımadığın biri için içten bir dua et.', kategori: 'manevi' },
  { gun: 7, baslik: 'Yemek Ikram Et', aciklama: 'Komşuna veya bir ihtiyaç sahibine yemek ikram et.', kategori: 'yardım' },
  { gun: 8, baslik: 'Teşekkür Et', aciklama: 'Hayatındaki birine neden minnettarsın söyle.', kategori: 'sosyal' },
  { gun: 9, baslik: 'Çöp Topla', aciklama: 'Parkta veya sokakta gördüğün çöpleri topla.', kategori: 'çevre' },
  { gun: 10, baslik: 'Anne-Babayı Ara', aciklama: 'Anne veya babanı ara, hal hatır sor.', kategori: 'aile' },
  { gun: 11, baslik: 'Kitap Hediye Et', aciklama: 'Okuduğun güzel bir kitabı birine hediye et.', kategori: 'sosyal' },
  { gun: 12, baslik: 'Esnafa Dua Et', aciklama: 'Alışveriş yaptığın esnafa "Allah bereket versin" de.', kategori: 'manevi' },
  { gun: 13, baslik: 'Kapıyı Tut', aciklama: 'Arkandan gelen kişi için kapıyı tut.', kategori: 'sosyal' },
  { gun: 14, baslik: 'Market Alışverişi', aciklama: 'İhtiyaç sahibi bir aileye market alışverişi yap.', kategori: 'maddi' },
  { gun: 15, baslik: 'Su Bırak', aciklama: 'Sokak hayvanları için su ve mama bırak.', kategori: 'çevre' },
  { gun: 16, baslik: 'Hasta Ziyareti', aciklama: 'Hasta bir tanıdığını ziyaret et veya ara.', kategori: 'yardım' },
  { gun: 17, baslik: 'Kuran Oku', aciklama: 'Bir sayfa Kuran oku ve sevabını bir yakınına hediye et.', kategori: 'manevi' },
  { gun: 18, baslik: 'Yol Tarifi', aciklama: 'Kaybolmuş birine yol tarif et veya eşlik et.', kategori: 'sosyal' },
  { gun: 19, baslik: 'Kıyafet Bağışla', aciklama: 'Giymediğin temiz kıyafetleri ihtiyaç sahiplerine bağışla.', kategori: 'maddi' },
  { gun: 20, baslik: 'Kardeşinle Vakit Geçir', aciklama: 'Kardeşin veya yeğeninle kaliteli vakit geçir.', kategori: 'aile' },
  { gun: 21, baslik: 'Bahşiş Bırak', aciklama: 'Garson veya kurye için cömert bir bahşiş bırak.', kategori: 'maddi' },
  { gun: 22, baslik: 'Affet', aciklama: 'Kırgın olduğun birini içten affet, barış.', kategori: 'manevi' },
  { gun: 23, baslik: 'Çay Ismarla', aciklama: 'İş arkadaşına veya komşuna çay-kahve ısmarla.', kategori: 'sosyal' },
  { gun: 24, baslik: 'Geri Dönüşüm', aciklama: 'Evdeki atıkları ayırıp geri dönüşüme gönder.', kategori: 'çevre' },
  { gun: 25, baslik: 'Büyüklerine Saygı', aciklama: 'Büyüklerinin elini öp, hayır duasını al.', kategori: 'aile' },
  { gun: 26, baslik: 'Kan Bağışı', aciklama: 'Kan bağışında bulun veya bağış noktasını paylaş.', kategori: 'yardım' },
  { gun: 27, baslik: 'İftar Ver', aciklama: 'Birini iftara davet et veya iftar paketi hazırla.', kategori: 'yardım' },
  { gun: 28, baslik: 'Tebessüm Et', aciklama: 'Gün boyu karşılaştığın herkese samimi gülümse.', kategori: 'manevi' },
  { gun: 29, baslik: 'Fidan Bağışla', aciklama: 'Online olarak bir fidan bağışı yap.', kategori: 'çevre' },
  { gun: 30, baslik: 'İyilik Zinciri', aciklama: 'Bugün yaptığın iyiliği paylaş, başkalarına ilham ver!', kategori: 'sosyal' },
];

const KATEGORI_RENKLERI = {
  sosyal: { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', label: 'Sosyal' },
  yardım: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', label: 'Yardım' },
  aile: { bg: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', label: 'Aile' },
  manevi: { bg: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', label: 'Manevi' },
  çevre: { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', label: 'Çevre' },
  maddi: { bg: 'rgba(212, 175, 55, 0.15)', color: '#d4af37', label: 'Maddi' },
};

function IyilikFikirleri({ onBack, onSelect }) {
  const [aktifKategori, setAktifKategori] = useState('hepsi');

  const filtrelenmis = aktifKategori === 'hepsi'
    ? IYILIK_FIKIRLERI
    : IYILIK_FIKIRLERI.filter((f) => f.kategori === aktifKategori);

  return (
    <main className="container">
      <div style={{ marginBottom: '32px' }}>
        <button className="btn" onClick={onBack} style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.06)', fontSize: '13px', padding: '8px 16px' }}>
          ← Geri
        </button>
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px' }}>
          30 Günde 30 İyilik
        </h2>
        <p style={{ fontSize: '14px', color: '#8ea0be', margin: 0 }}>
          Her gün bir iyilik yaparak Ramazan'ı anlamlı kıl
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        {[{ key: 'hepsi', label: 'Hepsi' }, ...Object.entries(KATEGORI_RENKLERI).map(([k, v]) => ({ key: k, label: v.label }))].map((k) => (
          <button
            key={k.key}
            onClick={() => setAktifKategori(k.key)}
            className="btn"
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              background: aktifKategori === k.key ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.06)',
              border: aktifKategori === k.key ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid transparent',
              color: aktifKategori === k.key ? '#d4af37' : '#8ea0be',
            }}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="fikirler-grid">
        {filtrelenmis.map((fikir) => {
          const kat = KATEGORI_RENKLERI[fikir.kategori];
          return (
            <div key={fikir.gun} className="glass-card fikir-card">
              <div className="fikir-header">
                <span className="fikir-gun">Gün {fikir.gun}</span>
                <span className="fikir-kategori" style={{ background: kat.bg, color: kat.color }}>{kat.label}</span>
              </div>
              <h4 className="fikir-baslik">{fikir.baslik}</h4>
              <p className="fikir-aciklama">{fikir.aciklama}</p>
              <button
                className="btn fikir-btn"
                onClick={() => onSelect(fikir.baslik + ' - ' + fikir.aciklama)}
              >
                Bu İyiliği Yap →
              </button>
            </div>
          );
        })}
      </div>

      <footer className="footer" style={{ marginTop: '48px' }}>İyilikle Kalın • 2026</footer>
    </main>
  );
}

// Skeleton loader component
function SkeletonItem() {
  return (
    <div className="item skeleton-item">
      <div className="item-left">
        <div className="avatar skeleton-avatar" />
        <div>
          <div className="skeleton-line skeleton-name" />
          <div className="skeleton-line skeleton-text" />
        </div>
      </div>
      <div className="skeleton-line skeleton-time" />
    </div>
  );
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
  const [targetDate] = useState(getRamadanEndDate);
  const [countdown, setCountdown] = useState(() => getCountdownParts(getRamadanEndDate()));

  const [iyilikler, setIyilikler] = useState([]);
  const [form, setForm] = useState({ isim: '', soyisim: '', iyilik: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [newItemId, setNewItemId] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [gununNiyeti, setGununNiyeti] = useState({
    metin: 'Her iyilik yeni bir iyiliğin kapısını açar.',
    kaynak: 'Ramazan Ruhu',
  });
  const [adminToken, setAdminToken] = useState('');
  const [adminStatus, setAdminStatus] = useState({ type: '', message: '' });
  const [pendingItems, setPendingItems] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [prefillIyilik, setPrefillIyilik] = useState('');

  // Gece/gündüz teması
  const isDayTime = useMemo(() => {
    const hour = time.getHours();
    return hour >= 6 && hour < 18;
  }, [time]);

  // Scroll listener for header shrink
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

      // Paylaşım kartını göster
      if (!data.pending) {
        setShareData({
          iyilik: iyilik,
          isim: isim,
          soyisim: soyisim.charAt(0) + '.',
          tarih: new Date().toISOString()
        });
        setTimeout(() => setShowShareCard(true), 1500);
      }
      
      // Confetti göster
      if (!data.pending) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      
      await fetchIyilikler();
      
      // Yeni eklenen item'a glow efekti için
      if (!data.pending && iyilikler.length > 0) {
        setNewItemId(Date.now());
        setTimeout(() => setNewItemId(null), 3000);
      }
    } catch (e) {
      setError(e.message || 'Bağlantı hatası.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`ramazan-ui ${isDayTime ? 'day-theme' : 'night-theme'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');

        :root {
          --bg: #020617;
          --bg-day: #0a1628;
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
          transition: background 0.5s ease;
        }

        .ramazan-ui.day-theme {
          background: var(--bg-day);
        }

        .ramazan-ui::selection {
          background: rgba(212, 175, 55, 0.3);
        }

        /* Stars background */
        .stars-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .star {
          position: absolute;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          animation: twinkle ease-in-out infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        /* Confetti */
        .confetti-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1000;
          overflow: hidden;
        }

        .confetti-piece {
          position: absolute;
          top: -20px;
          border-radius: 2px;
          animation: confetti-fall linear forwards;
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
          pointer-events: none;
          transition: all 0.5s ease;
        }

        .orb-a {
          width: 500px;
          height: 500px;
          background: rgba(30, 58, 138, 0.2);
          top: -80px;
          left: -80px;
        }

        .day-theme .orb-a {
          background: rgba(30, 58, 138, 0.3);
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
          transition: all 0.3s ease;
        }

        .topbar.scrolled {
          margin-bottom: 24px;
        }

        .topbar.scrolled .title {
          font-size: clamp(28px, 4vw, 48px);
        }

        .topbar.scrolled .clock {
          font-size: clamp(24px, 3vw, 36px);
        }

        .title {
          font-size: clamp(40px, 6vw, 72px);
          line-height: 1;
          font-weight: 800;
          margin: 0 0 10px;
          letter-spacing: -0.02em;
          transition: font-size 0.3s ease;
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
          transition: font-size 0.3s ease;
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

        /* Niyet card - fixed hover */
        .niyet {
          background: linear-gradient(140deg, #d6ab51, #a57422);
          color: #1f1b12;
          box-shadow: 0 20px 35px rgba(110, 71, 13, 0.32);
          transform: none !important;
        }

        .niyet:hover {
          background: linear-gradient(140deg, #e0b85a, #b07f28);
          transform: none !important;
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

        /* Form input focus animations */
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
          transition: all 0.3s ease;
        }

        .input::placeholder,
        .textarea::placeholder { color: #8ea0be; }

        .input:focus,
        .textarea:focus {
          border-color: var(--gold-2);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15), 0 0 20px rgba(212, 175, 55, 0.1);
          background: rgba(255,255,255,0.08);
          transform: translateY(-2px);
        }

        .textarea { resize: none; min-height: 110px; }

        /* Button with loading spinner */
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
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn:hover { background: #f4d27a; transform: translateY(-2px); }
        .btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

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

        /* Pulse animation for live badge */
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

        .pill-live {
          position: relative;
          padding-left: 20px;
        }

        .pill-live::before {
          content: '';
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          background: var(--ok);
          border-radius: 50%;
          animation: pulse-live 2s ease-in-out infinite;
        }

        @keyframes pulse-live {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(41, 211, 145, 0.7); }
          50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(41, 211, 145, 0); }
        }

        .list {
          display: grid;
          gap: 10px;
        }

        /* Item with glow effect for new items */
        .item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 18px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
          transition: all 0.3s ease;
        }

        .item.new-item {
          animation: glow-pulse 2s ease-in-out;
          border-color: var(--gold-2);
        }

        @keyframes glow-pulse {
          0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.5); }
          50% { box-shadow: 0 0 30px 10px rgba(212, 175, 55, 0.3); }
          100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
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
          word-break: break-word;
        }

        .item-time {
          font-size: 10px;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 700;
          flex: 0 0 auto;
        }

        /* Skeleton loading */
        .skeleton-item {
          pointer-events: none;
        }

        .skeleton-avatar {
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s infinite;
        }

        .skeleton-line {
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-name {
          width: 120px;
          height: 16px;
          margin-bottom: 6px;
        }

        .skeleton-text {
          width: 200px;
          height: 14px;
        }

        .skeleton-time {
          width: 60px;
          height: 12px;
        }

        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
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

        .seo-footer {
          margin-top: 56px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 26px;
          background:
            radial-gradient(circle at top right, rgba(212, 175, 55, 0.12), transparent 45%),
            linear-gradient(160deg, rgba(10, 22, 40, 0.92), rgba(2, 6, 23, 0.96));
          padding: 28px;
        }

        .seo-article {
          max-width: 880px;
          margin: 0 auto;
          display: grid;
          gap: 14px;
          color: #dbe7ff;
        }

        .seo-article h2 {
          margin: 0;
          color: #f8fafc;
          font-size: clamp(22px, 2.8vw, 34px);
          line-height: 1.2;
        }

        .seo-article h3 {
          margin: 8px 0 0;
          color: #f5f8ff;
          font-size: 18px;
          font-weight: 800;
        }

        .seo-article p {
          margin: 0;
          color: #bac8e2;
          font-size: 14px;
          line-height: 1.8;
        }

        .seo-article ul {
          margin: 4px 0 2px 18px;
          padding: 0;
          color: #e2e8f0;
          display: grid;
          gap: 7px;
          font-size: 14px;
        }

        .seo-signature {
          margin: 20px 0 0;
          text-align: center;
          opacity: 0.35;
          font-size: 10px;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          font-weight: 700;
          color: #b7c2d7;
        }

        .share-card {
          grid-column: span 4;
        }

        @media (max-width: 1024px) {
          .countdown, .niyet, .form-card, .flow-card, .leaderboard-card, .stats-card, .share-card {
            grid-column: span 12;
          }

          .share-card .share-buttons {
            flex-direction: column;
          }
          .share-card .share-buttons .btn {
            width: 100%;
            min-width: unset;
          }

          .count-item strong { font-size: 44px; }
          .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }

          .seo-footer {
            padding: 20px;
          }

          .seo-article h2 {
            font-size: 24px;
          }

          .seo-article h3 {
            font-size: 16px;
          }
        }
          /* Share Card Modal */
.share-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.9);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.share-modal {
  background: linear-gradient(135deg, #0a1628, #0f172a);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 32px;
  max-width: 440px;
  width: 100%;
  position: relative;
}

.share-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255,255,255,0.1);
  color: #fff;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
}

.share-title {
  font-size: 22px;
  font-weight: 800;
  color: #f8fafc;
  margin: 0 0 20px;
  text-align: center;
}

.share-card-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}


.share-buttons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.share-btn {
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.share-btn.download { background: linear-gradient(135deg, #f5e6a3, #d4af37); color: #0f172a; }
.share-btn.twitter { background: #1DA1F2; color: #fff; }
.share-btn.whatsapp { background: #25D366; color: #fff; }
.share-btn.copy { background: rgba(255,255,255,0.1); color: #f8fafc; }

        /* Fikirler sayfası */
        .fikirler-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .fikir-card {
          display: flex;
          flex-direction: column;
          padding: 20px;
        }

        .fikir-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .fikir-gun {
          font-size: 11px;
          font-weight: 800;
          color: #d4af37;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .fikir-kategori {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 99px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .fikir-baslik {
          font-size: 17px;
          font-weight: 800;
          color: #f1f5f9;
          margin: 0 0 6px;
        }

        .fikir-aciklama {
          font-size: 13px;
          color: #8ea0be;
          line-height: 1.5;
          margin: 0 0 16px;
          flex: 1;
        }

        .fikir-btn {
          font-size: 12px;
          padding: 8px 0;
          background: rgba(212, 175, 55, 0.12);
          color: #d4af37;
          border: 1px solid rgba(212, 175, 55, 0.2);
          text-align: center;
        }
        .fikir-btn:hover {
          background: rgba(212, 175, 55, 0.25);
        }
      `}</style>

      <StarsBackground />
      <Confetti active={showConfetti} />
      
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
      ) : currentPage === 'fikirler' ? (
        <IyilikFikirleri
          onBack={() => setCurrentPage('home')}
          onSelect={(text) => {
            setForm((prev) => ({ ...prev, iyilik: text }));
            setCurrentPage('home');
          }}
        />
      ) : (
        <main className="container">
          <div className={`topbar ${isScrolled ? 'scrolled' : ''}`}>
            <div>
              <h1 className="title">
                İyilik <span className="gold">Hareketi</span>
              </h1>
              <p className="sub">Ramazan {targetDate.getFullYear()} • Topluluk Akışı</p>
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
                <span className="micro">{targetDate.getFullYear()} Ramazan'ın Bitmesine Kalan Süre ({targetDate.toLocaleDateString('tr-TR')})</span>
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
                  placeholder="Bugün nasıl bir iyilik yaptın?"
                  value={form.iyilik}
                  onChange={(e) => setForm((prev) => ({ ...prev, iyilik: e.target.value }))}
                />
                <button className="btn" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="btn-spinner" />
                      Gönderiliyor...
                    </>
                  ) : (
                    'Gönder'
                  )}
                </button>
              </form>

              {error ? <div className="status error">{error}</div> : null}
              {success ? <div className="status ok">{success}</div> : null}
              <button
                className="btn"
                type="button"
                onClick={() => setCurrentPage('fikirler')}
                style={{ marginTop: '10px', background: 'rgba(212, 175, 55, 0.12)', color: '#d4af37', border: '1px solid rgba(212, 175, 55, 0.2)', fontSize: '13px', width: '100%' }}
              >
                💡 İyilik Fikri Al
              </button>
            </section>

            <section className="glass-card flow-card">
              <div className="flow-head">
                <h3 className="section-title">İyilik Akışı</h3>
                <span className="pill">{iyilikler.length} Paylaşım</span>
              </div>

              <div className="list">
                {isLoading ? (
                  <>
                    <SkeletonItem />
                    <SkeletonItem />
                    <SkeletonItem />
                  </>
                ) : iyilikler.length === 0 ? (
                  <div className="empty">Henüz paylaşım yok.</div>
                ) : (
                  iyilikler.map((i, index) => (
                    <div 
                      key={i.id} 
                      className={`item ${index === 0 && newItemId ? 'new-item' : ''}`}
                    >
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
                <span className="pill pill-live">Canlı</span>
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

            {/* Sosyal Medya Paylaşım */}
            <section className="glass-card share-card">
              <h3 className="section-title mini">Paylaş</h3>
              <p style={{ fontSize: '13px', color: '#8ea0be', marginBottom: '16px' }}>
                İyilik hareketini yay, başkalarına ilham ver!
              </p>
              <div className="share-buttons" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Ramazan\'da iyilik hareketi başlattım! Sen de katıl 🌙')}&url=${encodeURIComponent('https://iyilikhareketi.online')}`, '_blank')}
                  className="btn"
                  style={{ flex: 1, minWidth: '100px', background: '#1DA1F2', color: '#fff' }}
                >
                  𝕏 Twitter
                </button>
                <button
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Ramazan\'da iyilik hareketi başlattım! Sen de katıl 🌙 https://iyilikhareketi.online')}`, '_blank')}
                  className="btn"
                  style={{ flex: 1, minWidth: '100px', background: '#fff' }}
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText('https://iyilikhareketi.online').then(() => alert('Link kopyalandı!'))}
                  className="btn"
                  style={{ flex: 1, minWidth: '100px' }}
                >
                  🔗 Kopyala
                </button>
              </div>
            </section>
          </div>

          <footer className="seo-footer">
            <article className="seo-article">
              <h2>Ramazan'da İyilik Hareketi: 30 Günde 30 İyilik ile Hayatı Güzelleştirin</h2>

              <p>
                Ramazan, paylaşmanın, dayanışmanın ve kalpten gelen küçük adımların büyük anlamlar kazandığı özel bir dönemdir.
                Bu yüzden Ramazan'da iyilik hareketi fikri, hem bireysel hem toplumsal olarak güçlü bir etki yaratır.
              </p>

              <h3>Ramazan'da İyilik Neden Bu Kadar Önemli?</h3>
              <p>
                Ramazan'da iyilik yapmak manevi iklimi güçlendirir. Bir tebessüm, bir iftar paylaşımı veya bir ihtiyaç sahibine destek;
                toplumda güven ve merhamet duygusunu artırır. Tam da bu noktada düzenli bir plan devreye girer: 30 günde 30 iyilik.
              </p>

              <h3>30 Günde 30 İyilik Nedir?</h3>
              <p>
                30 günde 30 iyilik, Ramazan boyunca her gün en az bir iyi davranışı bilinçli olarak hayata geçirme yaklaşımıdır.
                Amaç büyük projeler değil, sürdürülebilir ve samimi adımlar atmaktır.
              </p>
              <ul>
                <li>Komşunun kapısını çalıp halini hatırını sormak</li>
                <li>Yaşlı birinin market ihtiyacını karşılamak</li>
                <li>Sokak hayvanları için su ve mama bırakmak</li>
                <li>İftar için bir aileye yemek ulaştırmak</li>
                <li>Bir çalışanı takdir eden içten bir teşekkür etmek</li>
              </ul>

              <h3>Dijital İyilik Hareketine Katılmanın Avantajı</h3>
              <p>
                Yapılan iyilikleri kaydetmek ve paylaşmak, başkalarına ilham verir. Böylece tek bir iyilik davranışı, çok daha geniş bir
                toplulukta dalga etkisi oluşturur.
              </p>
              <ul>
                <li>Düzenli motivasyon sağlar</li>
                <li>Günlük iyilik alışkanlığı oluşturur</li>
                <li>Topluluk etkisini görünür kılar</li>
                <li>Yeni Ramazan iyilik fikirleri keşfetmeyi kolaylaştırır</li>
              </ul>

              <h3>Sonuç: Küçük İyilik, Büyük Dönüşüm</h3>
              <p>
                Ramazan'da iyilik hareketi tek seferlik bir kampanya değil, hayatı dönüştüren bir alışkanlıktır. Her gün yapılan küçük bir
                iyilik, toplumsal bağları güçlendirir ve Ramazan'ın ruhunu daha görünür hale getirir.
              </p>
            </article>

            <p className="seo-signature">İyilikle Kalın • 2026</p>
          </footer>
        </main>
      )}

      {showShareCard && shareData && (
        <ShareCardModal
          iyilik={shareData.iyilik}
          isim={shareData.isim}
          soyisim={shareData.soyisim}
          tarih={shareData.tarih}
          onClose={() => { setShowShareCard(false); setShareData(null); }}
        />
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
