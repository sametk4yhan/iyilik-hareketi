import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CONFIG } from './config';

// =============================================================================
// İYİLİK HAREKETİ - Frontend with API Integration
// =============================================================================

const IyilikHareketi = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [iyilikler, setIyilikler] = useState([]);
  const [formData, setFormData] = useState({ isim: '', soyisim: '', iyilik: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastSubmitTime, setLastSubmitTime] = useState(() => {
    const saved = localStorage.getItem('lastIyilikTime');
    return saved ? parseInt(saved) : 0;
  });

  const ramazanBaslangic = new Date(CONFIG.RAMAZAN_START);

  // Leaderboard hesaplama
  const leaderboard = useMemo(() => {
    const counts = {};
    iyilikler.forEach(item => {
      const key = `${item.isim} ${item.soyisim}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [iyilikler]);

  // İyilikleri API'den çek
  const fetchIyilikler = useCallback(async () => {
    try {
      const response = await fetch(`${CONFIG.WORKER_URL}/iyilikler`);
      const data = await response.json();
      if (data.success) {
        setIyilikler(data.data.map(item => ({
          ...item,
          tarih: new Date(item.tarih)
        })));
      }
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // İlk yüklemede ve her 30 saniyede bir güncelle
  useEffect(() => {
    fetchIyilikler();
    const interval = setInterval(fetchIyilikler, 30000);
    return () => clearInterval(interval);
  }, [fetchIyilikler]);

  // Saat ve geri sayım
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const diff = ramazanBaslangic - now;
      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatIyilikTarih = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 1) return 'şimdi';
    if (minutes < 60) return `${minutes}dk`;
    if (hours < 24) return `${hours}sa`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.isim || !formData.soyisim || !formData.iyilik) {
      setError('Tüm alanları doldurun.');
      return;
    }

    // Spam kontrolü (client-side)
    const now = Date.now();
    if (now - lastSubmitTime < CONFIG.SPAM_COOLDOWN_MS) {
      const remaining = Math.ceil((CONFIG.SPAM_COOLDOWN_MS - (now - lastSubmitTime)) / 1000);
      setError(`Lütfen ${remaining} saniye bekleyin.`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${CONFIG.WORKER_URL}/iyilikler`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Spam timer'ı güncelle
        localStorage.setItem('lastIyilikTime', now.toString());
        setLastSubmitTime(now);
        
        // Listeyi güncelle
        if (!data.pending) {
          const yeniIyilik = {
            id: Date.now(),
            isim: formData.isim,
            soyisim: formData.soyisim.charAt(0).toUpperCase() + '.',
            iyilik: formData.iyilik,
            tarih: new Date()
          };
          setIyilikler(prev => [yeniIyilik, ...prev]);
        }
        
        setFormData({ isim: '', soyisim: '', iyilik: '' });
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
          setIsFormOpen(false);
        }, 1500);
      } else {
        setError(data.detail ? (data.error + ' (' + data.detail + ')') : (data.error || 'Bir hata oluştu.'));
      }
    } catch (e) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRankBadge = (index) => {
    if (index === 0) return { emoji: '👑', color: '#d4af37' };
    if (index === 1) return { emoji: '✦', color: '#a8a8a8' };
    if (index === 2) return { emoji: '✦', color: '#cd7f32' };
    return { emoji: '', color: 'var(--text-muted)' };
  };

  return (
    <div className="iyilik-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --ink: #1a1d2e;
          --ink-light: #2d3142;
          --copper: #b87333;
          --copper-light: #cd8d52;
          --copper-glow: #e6a65d;
          --cream: #f5f0e8;
          --cream-dark: #e8e0d4;
          --paper: #faf8f5;
          --paper-shadow: #d4cfc5;
          --text-muted: #6b6d7a;
          --gold: #d4af37;
          --silver: #a8a8a8;
          --bronze: #cd7f32;
          --error: #dc2626;
        }

        .iyilik-app {
          min-height: 100vh;
          background: var(--cream);
          position: relative;
          overflow-x: hidden;
          font-family: 'Libre Baskerville', Georgia, serif;
        }

        .iyilik-app::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          z-index: 1;
        }

        .bg-numbers {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Playfair Display', serif;
          font-size: clamp(20rem, 45vw, 50rem);
          font-weight: 800;
          color: var(--ink);
          opacity: 0.018;
          letter-spacing: -0.05em;
          pointer-events: none;
          z-index: 0;
          white-space: nowrap;
          line-height: 0.8;
        }

        .main-container {
          position: relative;
          z-index: 2;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 0;
        }

        @media (max-width: 1100px) {
          .main-container {
            grid-template-columns: 1fr;
          }
        }

        .left-panel {
          padding: 3rem 3rem 3rem 4rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-right: 1px solid var(--cream-dark);
          position: relative;
        }

        @media (max-width: 1100px) {
          .left-panel {
            padding: 2rem;
            border-right: none;
            border-bottom: 1px solid var(--cream-dark);
          }
        }

        .left-panel::after {
          content: '';
          position: absolute;
          right: -1px;
          top: 15%;
          height: 70%;
          width: 3px;
          background: linear-gradient(180deg, transparent, var(--copper), transparent);
        }

        @media (max-width: 1100px) {
          .left-panel::after {
            display: none;
          }
        }

        .header {
          margin-bottom: 2rem;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .crescent {
          font-size: 1.5rem;
          color: var(--copper);
          animation: crescentGlow 4s ease-in-out infinite;
        }

        @keyframes crescentGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(184, 115, 51, 0.3)); }
          50% { filter: drop-shadow(0 0 20px rgba(184, 115, 51, 0.6)); }
        }

        .title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.02em;
        }

        .title span {
          font-style: italic;
          font-weight: 400;
          color: var(--copper);
        }

        .subtitle {
          font-size: 0.7rem;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-left: 2.5rem;
        }

        .clock-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .current-time {
          font-family: 'Playfair Display', serif;
          font-size: clamp(4rem, 12vw, 8rem);
          font-weight: 300;
          color: var(--ink);
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .current-date {
          font-size: 0.85rem;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .countdown-section {
          margin-top: 3rem;
        }

        .countdown-label {
          font-size: 0.65rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--copper);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .countdown-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, var(--copper), transparent);
        }

        .countdown-grid {
          display: flex;
          gap: 1.5rem;
        }

        .countdown-unit {
          text-align: center;
        }

        .countdown-value {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 600;
          color: var(--ink);
          line-height: 1;
          position: relative;
        }

        .countdown-value::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 2px;
          background: var(--copper);
          opacity: 0.4;
        }

        .countdown-name {
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-top: 1rem;
        }

        .countdown-separator {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          color: var(--copper);
          opacity: 0.5;
          align-self: flex-start;
          margin-top: 0.3rem;
        }

        .right-panel {
          padding: 2rem 3rem;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, var(--paper) 0%, var(--cream) 100%);
          position: relative;
        }

        .leaderboard-section {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--cream-dark);
        }

        .leaderboard-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .leaderboard-icon {
          font-size: 1.2rem;
        }

        .leaderboard-title {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: 0.02em;
        }

        .leaderboard-list {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .leaderboard-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--paper);
          border: 1px solid var(--cream-dark);
          border-radius: 2rem;
          transition: all 0.3s ease;
        }

        .leaderboard-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .leaderboard-item.rank-1 {
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          border-color: var(--gold);
        }

        .leaderboard-item.rank-2 {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-color: var(--silver);
        }

        .leaderboard-item.rank-3 {
          background: linear-gradient(135deg, #fef7f0, #fed7aa);
          border-color: var(--bronze);
        }

        .leaderboard-rank {
          font-family: 'Playfair Display', serif;
          font-size: 0.9rem;
          font-weight: 700;
          min-width: 1.2rem;
          text-align: center;
        }

        .leaderboard-name {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--ink);
        }

        .leaderboard-count {
          font-family: 'Playfair Display', serif;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--copper);
          background: rgba(184, 115, 51, 0.1);
          padding: 0.15rem 0.5rem;
          border-radius: 1rem;
        }

        .list-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--cream-dark);
        }

        .list-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--ink);
        }

        .list-count {
          font-size: 0.7rem;
          color: var(--text-muted);
          letter-spacing: 0.1em;
        }

        .list-count strong {
          color: var(--copper);
          font-size: 1.2rem;
          font-family: 'Playfair Display', serif;
        }

        .add-button {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--ink);
          color: var(--cream);
          border: none;
          cursor: pointer;
          font-size: 1.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 40px rgba(26, 29, 46, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 100;
        }

        .add-button:hover {
          transform: scale(1.1) rotate(90deg);
          background: var(--copper);
        }

        .iyilik-list {
          flex: 1;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .iyilik-list::-webkit-scrollbar {
          width: 4px;
        }

        .iyilik-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .iyilik-list::-webkit-scrollbar-thumb {
          background: var(--copper);
          border-radius: 2px;
        }

        .iyilik-item {
          display: flex;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid var(--cream-dark);
          animation: itemSlide 0.5s ease-out;
          transition: all 0.3s ease;
        }

        .iyilik-item:hover {
          padding-left: 0.5rem;
          background: linear-gradient(90deg, rgba(184, 115, 51, 0.05), transparent);
        }

        @keyframes itemSlide {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .iyilik-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--copper-light), var(--copper));
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(184, 115, 51, 0.2);
        }

        .iyilik-avatar span {
          font-family: 'Playfair Display', serif;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--paper);
        }

        .iyilik-content {
          flex: 1;
          min-width: 0;
        }

        .iyilik-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .iyilik-name {
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--ink);
        }

        .iyilik-time {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .iyilik-text {
          font-size: 0.9rem;
          color: var(--ink-light);
          line-height: 1.5;
        }

        .loading-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--cream-dark);
          border-top-color: var(--copper);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26, 29, 46, 0.8);
          backdrop-filter: blur(8px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: var(--paper);
          border-radius: 1rem;
          padding: 2.5rem;
          width: 100%;
          max-width: 450px;
          position: relative;
          animation: modalSlide 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
        }

        @keyframes modalSlide {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 1.5rem;
          color: var(--text-muted);
          transition: color 0.2s;
        }

        .modal-close:hover {
          color: var(--ink);
        }

        .modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 0.5rem;
        }

        .modal-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 2rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-label {
          display: block;
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .form-input {
          width: 100%;
          padding: 0.9rem 1rem;
          border: 1px solid var(--cream-dark);
          border-radius: 0.5rem;
          font-family: inherit;
          font-size: 0.95rem;
          color: var(--ink);
          background: var(--cream);
          transition: all 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--copper);
          box-shadow: 0 0 0 3px rgba(184, 115, 51, 0.1);
          background: var(--paper);
        }

        .form-input::placeholder {
          color: var(--paper-shadow);
        }

        .form-textarea {
          resize: none;
          min-height: 100px;
        }

        .form-error {
          color: var(--error);
          font-size: 0.8rem;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: rgba(220, 38, 38, 0.1);
          border-radius: 0.5rem;
        }

        .submit-button {
          width: 100%;
          padding: 1rem;
          border: none;
          border-radius: 0.5rem;
          background: var(--ink);
          color: var(--cream);
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 0.5rem;
        }

        .submit-button:hover {
          background: var(--copper);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(184, 115, 51, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .success-overlay {
          position: absolute;
          inset: 0;
          background: var(--paper);
          border-radius: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }

        .success-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: successPop 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes successPop {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        .success-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          color: var(--ink);
        }

        .footer-accent {
          text-align: center;
          padding: 2rem;
          color: var(--text-muted);
          font-size: 0.75rem;
          letter-spacing: 0.2em;
        }

        .footer-accent span {
          color: var(--copper);
        }
      `}</style>

      <div className="bg-numbers">
        {String(countdown.days).padStart(2, '0')}
      </div>

      <div className="main-container">
        <div className="left-panel">
          <div className="header">
            <div className="brand">
              <span className="crescent">☽</span>
              <h1 className="title">İyilik <span>Hareketi</span></h1>
            </div>
            <p className="subtitle">Ramazan 2025</p>
          </div>

          <div className="clock-section">
            <div className="current-time">{formatTime(currentTime)}</div>
            <div className="current-date">
              {currentTime.toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long',
                year: 'numeric'
              })}
            </div>

            <div className="countdown-section">
              <div className="countdown-label">Ramazan'a Kalan</div>
              <div className="countdown-grid">
                <div className="countdown-unit">
                  <div className="countdown-value">{String(countdown.days).padStart(2, '0')}</div>
                  <div className="countdown-name">Gün</div>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-unit">
                  <div className="countdown-value">{String(countdown.hours).padStart(2, '0')}</div>
                  <div className="countdown-name">Saat</div>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-unit">
                  <div className="countdown-value">{String(countdown.minutes).padStart(2, '0')}</div>
                  <div className="countdown-name">Dakika</div>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-unit">
                  <div className="countdown-value">{String(countdown.seconds).padStart(2, '0')}</div>
                  <div className="countdown-name">Saniye</div>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-accent">
            <span>❦</span> Her iyilik bir ışıktır <span>❦</span>
          </div>
        </div>

        <div className="right-panel">
          {leaderboard.length > 0 && (
            <div className="leaderboard-section">
              <div className="leaderboard-header">
                <span className="leaderboard-icon">🏆</span>
                <h3 className="leaderboard-title">En Çok İyilik Yapanlar</h3>
              </div>
              <div className="leaderboard-list">
                {leaderboard.map((person, index) => {
                  const badge = getRankBadge(index);
                  return (
                    <div key={person.name} className={`leaderboard-item rank-${index + 1}`}>
                      <span className="leaderboard-rank" style={{ color: badge.color }}>
                        {badge.emoji || (index + 1)}
                      </span>
                      <span className="leaderboard-name">{person.name}</span>
                      <span className="leaderboard-count">{person.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="list-header">
            <h2 className="list-title">İyilikler Zinciri</h2>
            <div className="list-count">
              <strong>{iyilikler.length}</strong> iyilik
            </div>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Yükleniyor...</p>
            </div>
          ) : (
            <div className="iyilik-list">
              {iyilikler.map((item, index) => (
                <div key={item.id} className="iyilik-item" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="iyilik-avatar">
                    <span>{item.isim.charAt(0)}</span>
                  </div>
                  <div className="iyilik-content">
                    <div className="iyilik-meta">
                      <span className="iyilik-name">{item.isim} {item.soyisim}</span>
                      <span className="iyilik-time">· {formatIyilikTarih(item.tarih)}</span>
                    </div>
                    <p className="iyilik-text">{item.iyilik}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button className="add-button" onClick={() => setIsFormOpen(true)}>+</button>

      {isFormOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsFormOpen(false)}>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setIsFormOpen(false)}>×</button>
            
            {showSuccess ? (
              <div className="success-overlay">
                <div className="success-icon">✨</div>
                <p className="success-text">Allah kabul etsin!</p>
              </div>
            ) : (
              <>
                <h3 className="modal-title">İyiliğini Paylaş</h3>
                <p className="modal-subtitle">Bugün yaptığın güzel bir şeyi kaydet</p>
                
                {error && <div className="form-error">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">İsim</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Adınız"
                        value={formData.isim}
                        onChange={(e) => setFormData(prev => ({ ...prev, isim: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Soyisim</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Soyadınız"
                        value={formData.soyisim}
                        onChange={(e) => setFormData(prev => ({ ...prev, soyisim: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Yaptığınız İyilik</label>
                    <textarea
                      className="form-input form-textarea"
                      placeholder="Bugün nasıl bir iyilik yaptınız?"
                      value={formData.iyilik}
                      onChange={(e) => setFormData(prev => ({ ...prev, iyilik: e.target.value }))}
                      maxLength={150}
                    />
                  </div>
                  
                  <button type="submit" className="submit-button" disabled={isSubmitting}>
                    {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IyilikHareketi;
