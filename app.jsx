import React, { useState, useEffect } from 'react';

// --- Alt Bileşenler (Modernize Edilmiş) ---

const GeometricOverlay = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
    <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="islamic-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M40 0L80 40L40 80L0 40Z" fill="none" stroke="#d4af37" strokeWidth="0.5" />
          <circle cx="40" cy="40" r="15" fill="none" stroke="#d4af37" strokeWidth="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamic-grid)" />
    </svg>
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl ${className}`}>
    {children}
  </div>
);

const IyilikHareketi = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [iyilikler, setIyilikler] = useState([
    { id: 1, isim: 'Ahmet Y.', iyilik: 'Yaşlı komşuma market alışverişi yaptım.', tarih: new Date(Date.now() - 3600000) },
    { id: 2, isim: 'Fatma D.', iyilik: 'Sokak kedileri için kapı önüne mama ve su bıraktım.', tarih: new Date(Date.now() - 7200000) },
  ]);
  const [formData, setFormData] = useState({ isim: '', soyisim: '', iyilik: '' });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.isim || !formData.iyilik) return;
    const yeniIyilik = { id: Date.now(), ...formData, tarih: new Date() };
    setIyilikler(prev => [yeniIyilik, ...prev]);
    setFormData({ isim: '', soyisim: '', iyilik: '' });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#050810] text-slate-200 font-sans selection:bg-amber-500/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;600&display=swap');
        .font-serif-elegant { font-family: 'Cinzel', serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        .gold-gradient { background: linear-gradient(135deg, #f5e6a3 0%, #d4af37 50%, #8a6d1d 100%); }
        .text-shimmer {
          background: linear-gradient(90deg, #d4af37, #f5e6a3, #d4af37);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 5s linear infinite;
        }
        @keyframes shimmer { to { background-position: 200% center; } }
      `}</style>

      <GeometricOverlay />

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        
        {/* Header & Clock */}
        <header className="text-center space-y-6 mb-16">
          <div className="inline-block px-4 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500 text-xs tracking-[0.3em] uppercase mb-4">
            Mübarek Ramazan-ı Şerif'e Doğru
          </div>
          <h1 className="font-serif-elegant text-5xl md:text-7xl font-bold text-shimmer">
            İyilik Hareketi
          </h1>
          <div className="text-4xl md:text-5xl font-light tracking-widest text-white/90 font-inter">
            {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            <span className="text-xl ml-2 text-amber-500/50">
              {currentTime.toLocaleTimeString('tr-TR', { second: '2-digit' })}
            </span>
          </div>
        </header>

        {/* Countdown Grid */}
        <div className="grid grid-cols-4 gap-4 mb-16 max-w-2xl mx-auto">
          {[
            { label: 'Gün', value: countdown.days },
            { label: 'Saat', value: countdown.hours },
            { label: 'Dak.', value: countdown.minutes },
            { label: 'Sn.', value: countdown.seconds },
          ].map((item, i) => (
            <div key={i} className="text-center group">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 group-hover:border-amber-500/30 transition-colors">
                <div className="text-2xl md:text-4xl font-bold text-amber-100">{String(item.value).padStart(2, '0')}</div>
                <div className="text-[10px] uppercase tracking-tighter text-amber-500/60 mt-1">{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          
          {/* Form Section */}
          <div className="md:col-span-2">
            <Card className="p-8 sticky top-8">
              <h3 className="font-serif-elegant text-xl text-amber-100 mb-6">Bir İyilik Bırak</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  placeholder="Adınız"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 transition-all"
                  value={formData.isim}
                  onChange={e => setFormData({...formData, isim: e.target.value})}
                />
                <textarea
                  placeholder="Bugün ne iyilik yaptınız?"
                  rows="4"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                  value={formData.iyilik}
                  onChange={e => setFormData({...formData, iyilik: e.target.value})}
                />
                <button className="w-full gold-gradient text-slate-900 font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20">
                  Paylaş
                </button>
              </form>
              {showSuccess && (
                <div className="mt-4 text-center text-emerald-400 text-sm animate-bounce">
                  ✨ İyiliğiniz kaydedildi!
                </div>
              )}
            </Card>
          </div>

          {/* List Section */}
          <div className="md:col-span-3 space-y-4">
            <div className="flex justify-between items-end mb-4 px-2">
              <h3 className="font-serif-elegant text-xl text-amber-100">İyilik Zinciri</h3>
              <span className="text-xs text-slate-500">{iyilikler.length} toplam paylaşım</span>
            </div>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {iyilikler.map((item) => (
                <div key={item.id} className="group relative bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 p-6 rounded-2xl transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-amber-500 font-semibold text-sm">{item.isim}</span>
                    <span className="text-[10px] text-slate-600 uppercase tracking-widest">Az Önce</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed italic">"{item.iyilik}"</p>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

        </div>

        <footer className="mt-20 text-center opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-xs tracking-[0.4em] uppercase">Her İyilik Bir Sadakadır</p>
        </footer>
      </main>
    </div>
  );
};

export default IyilikHareketi;