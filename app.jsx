import React, { useState, useEffect } from 'react';

// Islamic geometric pattern as SVG background
const GeometricPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="islamic-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="#d4af37" strokeWidth="0.5"/>
        <circle cx="50" cy="50" r="20" fill="none" stroke="#d4af37" strokeWidth="0.5"/>
        <path d="M30 30 L70 30 L70 70 L30 70 Z" fill="none" stroke="#d4af37" strokeWidth="0.3" transform="rotate(45 50 50)"/>
        <circle cx="50" cy="0" r="5" fill="none" stroke="#d4af37" strokeWidth="0.3"/>
        <circle cx="100" cy="50" r="5" fill="none" stroke="#d4af37" strokeWidth="0.3"/>
        <circle cx="50" cy="100" r="5" fill="none" stroke="#d4af37" strokeWidth="0.3"/>
        <circle cx="0" cy="50" r="5" fill="none" stroke="#d4af37" strokeWidth="0.3"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#islamic-pattern)"/>
  </svg>
);

// Crescent moon decoration
const CrescentMoon = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <path d="M50 0 A50 50 0 1 1 50 100 A35 35 0 1 0 50 0"/>
  </svg>
);

// Star decoration
const Star = ({ className, delay = 0 }) => (
  <div 
    className={`absolute w-1 h-1 bg-amber-300 rounded-full ${className}`}
    style={{ 
      animation: `twinkle 3s ease-in-out infinite`,
      animationDelay: `${delay}s`
    }}
  />
);

const IyilikHareketi = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [iyilikler, setIyilikler] = useState([
    { id: 1, isim: 'Ahmet', soyisim: 'Yılmaz', iyilik: 'Yaşlı komşuma market alışverişi yaptım', tarih: new Date(Date.now() - 3600000) },
    { id: 2, isim: 'Fatma', soyisim: 'Demir', iyilik: 'Sokak kedilerini besledim', tarih: new Date(Date.now() - 7200000) },
    { id: 3, isim: 'Mehmet', soyisim: 'Kaya', iyilik: 'İhtiyaç sahibi bir aileye erzak yardımı yaptım', tarih: new Date(Date.now() - 10800000) },
    { id: 4, isim: 'Zeynep', soyisim: 'Aksoy', iyilik: 'Çocuklara kitap bağışladım', tarih: new Date(Date.now() - 14400000) },
    { id: 5, isim: 'Ali', soyisim: 'Çelik', iyilik: 'Hasta bir arkadaşımı ziyaret ettim', tarih: new Date(Date.now() - 18000000) },
  ]);
  const [formData, setFormData] = useState({ isim: '', soyisim: '', iyilik: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Ramazan 2025 başlangıcı
  const ramazanBaslangic = new Date('2025-03-01T00:00:00');

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
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  const formatIyilikTarih = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.isim || !formData.soyisim || !formData.iyilik) return;

    setIsSubmitting(true);
    
    setTimeout(() => {
      const yeniIyilik = {
        id: Date.now(),
        ...formData,
        tarih: new Date()
      };
      
      setIyilikler(prev => [yeniIyilik, ...prev]);
      setFormData({ isim: '', soyisim: '', iyilik: '' });
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 400);
  };

  const CountdownUnit = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-amber-900/40 to-amber-950/60 backdrop-blur-md border border-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-900/20">
          <span className="text-2xl sm:text-3xl font-bold text-amber-100 font-serif">
            {String(value).padStart(2, '0')}
          </span>
        </div>
        <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-amber-400/20 to-transparent pointer-events-none" />
      </div>
      <span className="mt-2 text-xs text-amber-300/70 uppercase tracking-widest font-light">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ 
      background: 'linear-gradient(165deg, #0a0f1f 0%, #0c1a2d 25%, #0d1f35 50%, #071a1a 75%, #050d12 100%)'
    }}>
      {/* CSS Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap');
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.3); }
          50% { box-shadow: 0 0 40px rgba(212, 175, 55, 0.5); }
        }
        
        .font-display { font-family: 'Cormorant Garamond', serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
        
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
        
        .shimmer-text {
          background: linear-gradient(90deg, #d4af37 0%, #f5e6a3 25%, #d4af37 50%, #f5e6a3 75%, #d4af37 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
        
        .glass-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.1);
        }
        
        .input-glow:focus {
          box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.3), 0 0 30px rgba(212, 175, 55, 0.1);
        }
      `}</style>

      {/* Geometric Pattern Background */}
      <GeometricPattern />
      
      {/* Decorative Stars */}
      <Star className="top-[10%] left-[15%]" delay={0} />
      <Star className="top-[20%] right-[20%]" delay={0.5} />
      <Star className="top-[35%] left-[8%]" delay={1} />
      <Star className="top-[15%] right-[35%]" delay={1.5} />
      <Star className="top-[45%] right-[10%]" delay={2} />
      <Star className="top-[5%] left-[45%]" delay={2.5} />
      
      {/* Floating Crescent Moon */}
      <CrescentMoon 
        className="absolute top-8 right-8 w-20 h-20 text-amber-500/10" 
        style={{ animation: 'float 6s ease-in-out infinite' }}
      />

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <header className="text-center mb-10">
          {/* Main Title */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-2 shimmer-text">
            İyilik Hareketi
          </h1>
          <p className="font-body text-amber-200/50 text-sm tracking-[0.3em] uppercase mb-8">
            Ramazan 2025
          </p>

          {/* Digital Clock */}
          <div className="inline-block mb-8">
            <div 
              className="glass-card rounded-2xl px-8 py-5 relative overflow-hidden"
              style={{ animation: 'pulse-gold 4s ease-in-out infinite' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5" />
              <div className="relative">
                <div className="font-display text-5xl sm:text-6xl font-bold tracking-wider text-amber-100">
                  {formatTime(currentTime)}
                </div>
                <div className="font-body text-amber-300/40 text-xs mt-1 tracking-widest uppercase">
                  {currentTime.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </div>
            </div>
          </div>

          {/* Countdown */}
          <div>
            <p className="font-body text-amber-200/60 text-sm mb-4 tracking-wide">
              Ramazan'a Kalan Süre
            </p>
            <div className="flex justify-center gap-3 sm:gap-4">
              <CountdownUnit value={countdown.days} label="Gün" />
              <div className="flex items-center text-amber-500/30 text-2xl font-light self-start mt-6">:</div>
              <CountdownUnit value={countdown.hours} label="Saat" />
              <div className="flex items-center text-amber-500/30 text-2xl font-light self-start mt-6">:</div>
              <CountdownUnit value={countdown.minutes} label="Dakika" />
              <div className="flex items-center text-amber-500/30 text-2xl font-light self-start mt-6">:</div>
              <CountdownUnit value={countdown.seconds} label="Saniye" />
            </div>
          </div>
        </header>

        {/* Form Section */}
        <section className="mb-10">
          <div className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            
            <h2 className="font-display text-2xl text-amber-100 mb-6 text-center">
              İyiliğini Paylaş
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-xs text-amber-300/60 uppercase tracking-wider mb-2 block">
                    İsim
                  </label>
                  <input
                    type="text"
                    value={formData.isim}
                    onChange={(e) => setFormData(prev => ({ ...prev, isim: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-amber-500/10 text-amber-50 font-body placeholder-amber-200/20 focus:outline-none input-glow transition-all duration-300"
                    placeholder="Adınız"
                  />
                </div>
                <div>
                  <label className="font-body text-xs text-amber-300/60 uppercase tracking-wider mb-2 block">
                    Soyisim
                  </label>
                  <input
                    type="text"
                    value={formData.soyisim}
                    onChange={(e) => setFormData(prev => ({ ...prev, soyisim: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-amber-500/10 text-amber-50 font-body placeholder-amber-200/20 focus:outline-none input-glow transition-all duration-300"
                    placeholder="Soyadınız"
                  />
                </div>
              </div>
              
              <div>
                <label className="font-body text-xs text-amber-300/60 uppercase tracking-wider mb-2 block">
                  Yaptığınız İyilik
                </label>
                <textarea
                  value={formData.iyilik}
                  onChange={(e) => setFormData(prev => ({ ...prev, iyilik: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-amber-500/10 text-amber-50 font-body placeholder-amber-200/20 focus:outline-none input-glow transition-all duration-300 resize-none"
                  placeholder="Bugün nasıl bir iyilik yaptınız?"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-body font-medium text-sm uppercase tracking-widest transition-all duration-500 relative overflow-hidden group disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #aa8a2e 50%, #d4af37 100%)',
                  backgroundSize: '200% 200%',
                }}
              >
                <span className="relative z-10 text-slate-900">
                  {isSubmitting ? 'Kaydediliyor...' : 'İyiliği Kaydet'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </form>
            
            {/* Success Message */}
            {showSuccess && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-2xl animate-slide-up">
                <div className="text-center">
                  <div className="text-5xl mb-3">✨</div>
                  <p className="font-display text-2xl text-amber-100">Allah kabul etsin!</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* List Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-amber-100">
              İyilikler Zinciri
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-body text-sm text-amber-200/50">
                {iyilikler.length} iyilik
              </span>
            </div>
          </div>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(212, 175, 55, 0.3) transparent'
          }}>
            {iyilikler.map((item, index) => (
              <div
                key={item.id}
                className="glass-card rounded-xl p-5 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Left accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 pl-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-display text-lg text-amber-100">
                        {item.isim} {item.soyisim}
                      </span>
                    </div>
                    <p className="font-body text-amber-50/80 leading-relaxed">
                      {item.iyilik}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="font-body text-xs text-amber-300/40">
                      {formatIyilikTarih(item.tarih)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 text-amber-300/30">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-amber-500/30" />
            <CrescentMoon className="w-4 h-4" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-amber-500/30" />
          </div>
          <p className="font-body text-xs text-amber-200/30 mt-4 tracking-wide">
            Her iyilik bir ışıktır
          </p>
        </footer>
      </div>
    </div>
  );
};

export default IyilikHareketi;
