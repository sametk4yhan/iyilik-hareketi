import React, { useState, useEffect } from 'react';

// Subtle geometric pattern
const GeometricPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.015]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="islamic-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="#1a1a1a" strokeWidth="0.5"/>
        <circle cx="40" cy="40" r="15" fill="none" stroke="#1a1a1a" strokeWidth="0.3"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#islamic-pattern)"/>
  </svg>
);

const IyilikHareketi = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [iyilikler, setIyilikler] = useState([
    { id: 1, isim: 'Ahmet', soyisim: 'Y.', iyilik: 'Yaşlı komşuma market alışverişi yaptım', tarih: new Date(Date.now() - 3600000) },
    { id: 2, isim: 'Fatma', soyisim: 'D.', iyilik: 'Sokak kedilerini besledim', tarih: new Date(Date.now() - 7200000) },
    { id: 3, isim: 'Mehmet', soyisim: 'K.', iyilik: 'İhtiyaç sahibi bir aileye erzak yardımı yaptım', tarih: new Date(Date.now() - 10800000) },
    { id: 4, isim: 'Zeynep', soyisim: 'A.', iyilik: 'Çocuklara kitap bağışladım', tarih: new Date(Date.now() - 14400000) },
    { id: 5, isim: 'Ali', soyisim: 'Ç.', iyilik: 'Hasta bir arkadaşımı ziyaret ettim', tarih: new Date(Date.now() - 18000000) },
    { id: 6, isim: 'Ayşe', soyisim: 'B.', iyilik: 'Komşunun çocuğuna ders anlattım', tarih: new Date(Date.now() - 21600000) },
    { id: 7, isim: 'Hasan', soyisim: 'T.', iyilik: 'Camiye halı bağışladım', tarih: new Date(Date.now() - 25200000) },
    { id: 8, isim: 'Elif', soyisim: 'S.', iyilik: 'Yaşlı teyzeye yol gösterdim', tarih: new Date(Date.now() - 28800000) },
  ]);
  const [formData, setFormData] = useState({ isim: '', soyisim: '', iyilik: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
    if (minutes < 60) return `${minutes}dk`;
    if (hours < 24) return `${hours}sa`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.isim || !formData.soyisim || !formData.iyilik) return;

    setIsSubmitting(true);
    
    setTimeout(() => {
      const yeniIyilik = {
        id: Date.now(),
        isim: formData.isim,
        soyisim: formData.soyisim.charAt(0) + '.',
        iyilik: formData.iyilik,
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
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-white/60 backdrop-blur-sm border border-stone-200/50 flex items-center justify-center shadow-sm">
        <span className="text-2xl sm:text-3xl font-light text-stone-800 font-serif">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-1.5 text-[10px] text-stone-400 uppercase tracking-widest">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen relative" style={{ 
      background: 'linear-gradient(180deg, #fafaf9 0%, #f5f5f4 50%, #fafaf9 100%)'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500&display=swap');
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .font-display { font-family: 'Cormorant Garamond', serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        
        .animate-slide-in {
          animation: slideIn 0.4s ease-out forwards;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d6d3d1;
          border-radius: 2px;
        }
      `}</style>

      <GeometricPattern />

      {/* Subtle decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-amber-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-10 w-40 h-40 bg-emerald-100/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 sm:py-12">
        
        {/* Header */}
        <header className="text-center mb-8">
          {/* Crescent accent */}
          <div className="text-amber-400/60 text-3xl mb-3">☽</div>
          
          <h1 className="font-display text-4xl sm:text-5xl font-light text-stone-800 mb-1 tracking-wide">
            İyilik Hareketi
          </h1>
          <p className="font-body text-stone-400 text-xs tracking-[0.25em] uppercase">
            Ramazan 2025
          </p>

          {/* Digital Clock */}
          <div className="mt-6 mb-6">
            <div className="inline-block bg-white/70 backdrop-blur-sm rounded-xl px-6 py-4 border border-stone-100 shadow-sm">
              <div className="font-display text-4xl sm:text-5xl font-light text-stone-700 tracking-widest">
                {formatTime(currentTime)}
              </div>
              <div className="font-body text-stone-400 text-[11px] mt-1 tracking-wide">
                {currentTime.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>
          </div>

          {/* Countdown */}
          <div>
            <p className="font-body text-stone-400 text-xs mb-3 tracking-wide">
              Ramazan'a kalan süre
            </p>
            <div className="flex justify-center gap-2 sm:gap-3">
              <CountdownUnit value={countdown.days} label="Gün" />
              <span className="text-stone-300 self-center mb-5">:</span>
              <CountdownUnit value={countdown.hours} label="Saat" />
              <span className="text-stone-300 self-center mb-5">:</span>
              <CountdownUnit value={countdown.minutes} label="Dakika" />
              <span className="text-stone-300 self-center mb-5">:</span>
              <CountdownUnit value={countdown.seconds} label="Saniye" />
            </div>
          </div>
        </header>

        {/* Form */}
        <section className="mb-8">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-stone-100 shadow-sm relative">
            <h2 className="font-display text-xl text-stone-700 mb-4 text-center font-medium">
              İyiliğini Paylaş
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.isim}
                  onChange={(e) => setFormData(prev => ({ ...prev, isim: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/80 border border-stone-200 text-stone-700 font-body text-sm placeholder-stone-300 focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-200 transition-all"
                  placeholder="İsim"
                />
                <input
                  type="text"
                  value={formData.soyisim}
                  onChange={(e) => setFormData(prev => ({ ...prev, soyisim: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/80 border border-stone-200 text-stone-700 font-body text-sm placeholder-stone-300 focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-200 transition-all"
                  placeholder="Soyisim"
                />
              </div>
              
              <input
                type="text"
                value={formData.iyilik}
                onChange={(e) => setFormData(prev => ({ ...prev, iyilik: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-white/80 border border-stone-200 text-stone-700 font-body text-sm placeholder-stone-300 focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-200 transition-all"
                placeholder="Bugün nasıl bir iyilik yaptınız?"
                maxLength={120}
              />
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg font-body font-medium text-sm bg-gradient-to-r from-amber-500 to-amber-400 text-white hover:from-amber-600 hover:to-amber-500 transition-all duration-300 disabled:opacity-50 shadow-sm"
              >
                {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </form>
            
            {showSuccess && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl animate-slide-in">
                <div className="text-center">
                  <div className="text-3xl mb-2">✨</div>
                  <p className="font-display text-xl text-stone-700">Allah kabul etsin!</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* List */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-display text-lg text-stone-600">
              İyilikler
            </h2>
            <span className="font-body text-xs text-stone-400">
              {iyilikler.length} kayıt
            </span>
          </div>
          
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
            {iyilikler.map((item, index) => (
              <div
                key={item.id}
                className="bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2.5 border border-stone-100/80 hover:bg-white/80 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar circle */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-200/50">
                    <span className="font-display text-sm text-amber-600">
                      {item.isim.charAt(0)}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-body text-sm font-medium text-stone-700">
                        {item.isim} {item.soyisim}
                      </span>
                      <span className="font-body text-[10px] text-stone-300">
                        {formatIyilikTarih(item.tarih)}
                      </span>
                    </div>
                    <p className="font-body text-sm text-stone-500 truncate">
                      {item.iyilik}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 text-center">
          <div className="flex items-center justify-center gap-2 text-stone-300">
            <div className="w-8 h-px bg-stone-200" />
            <span className="text-amber-400/60 text-sm">☽</span>
            <div className="w-8 h-px bg-stone-200" />
          </div>
          <p className="font-body text-[10px] text-stone-300 mt-3 tracking-wider">
            Her iyilik bir ışıktır
          </p>
        </footer>
      </div>
    </div>
  );
};

export default IyilikHareketi;
