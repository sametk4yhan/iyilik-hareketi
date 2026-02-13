import React, { useState, useEffect } from 'react';

const ModernRamazanUI = () => {
  const [time, setTime] = useState(new Date());
  const [iyilikler] = useState([
    { id: 1, kisi: "Ahmet Erkan", metin: "Bugün mahalledeki fırına askıda ekmek bıraktım.", vakit: "10 dk önce" },
    { id: 2, kisi: "Selin Yılmaz", metin: "Öğrenci evine iftariyelik hazırlayıp gönderdik.", vakit: "45 dk önce" },
    { id: 3, kisi: "Hüseyin Avni", metin: "Barınaktaki dostlarımız için mama bağışı yaptık.", vakit: "2 saat önce" },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-amber-500/30 overflow-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&family=Cinzel+Decorative:wght@700&display=swap');
        
        .font-main { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-ornate { font-family: 'Cinzel Decorative', serif; }
        
        .bg-mesh {
          background-image: 
            radial-gradient(at 0% 0%, rgba(212, 175, 55, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.1) 0px, transparent 50%),
            radial-gradient(at 50% 100%, rgba(30, 58, 138, 0.3) 0px, transparent 50%);
        }

        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
        }

        .gold-shimmer {
          background: linear-gradient(90deg, #d4af37, #f5e6a3, #d4af37);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% auto;
          animation: shimmer 4s linear infinite;
        }

        @keyframes shimmer { to { background-position: 200% center; } }
        
        .timer-unit {
          background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%);
          border: 1px solid rgba(212, 175, 55, 0.2);
        }
      `}</style>

      {/* Arka Plan Katmanları */}
      <div className="absolute inset-0 bg-mesh opacity-50" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30" />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col min-h-screen">
        
        {/* Üst Kısım: Başlık ve Büyük Saat */}
        <header className="flex flex-col items-center justify-center flex-1 py-10">
          <div className="flex items-center gap-4 mb-6 opacity-80">
            <div className="h-px w-12 bg-amber-500/50" />
            <span className="font-ornate text-amber-500 tracking-[0.3em] uppercase text-sm">İyilik Hareketi</span>
            <div className="h-px w-12 bg-amber-500/50" />
          </div>

          <div className="relative group cursor-default">
            <div className="absolute -inset-8 bg-amber-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
            <h1 className="font-main text-8xl md:text-[10rem] font-extrabold tracking-tighter leading-none flex items-baseline gap-2">
              <span className="text-white drop-shadow-2xl">
                {time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-3xl md:text-5xl font-light text-amber-500/60 font-main">
                {time.toLocaleTimeString('tr-TR', { second: '2-digit' })}
              </span>
            </h1>
          </div>

          <p className="mt-8 font-main text-lg text-slate-400 tracking-wide font-light">
            {time.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </header>

        {/* Orta Kısım: İyilik Kartları Paneli */}
        <section className="grid md:grid-cols-2 gap-8 mb-12">
          
          {/* Sol: İyilik Paylaşım Listesi */}
          <div className="glass rounded-[2.5rem] p-8 relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-ornate text-xl gold-shimmer">İyilikler Zinciri</h2>
              <div className="px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 text-[10px] text-amber-500 uppercase tracking-widest">Canlı Akış</div>
            </div>

            <div className="space-y-6 max-h-80 overflow-y-auto pr-2">
              {iyilikler.map((item) => (
                <div key={item.id} className="group border-b border-white/5 pb-4 last:border-0 hover:bg-white/[0.02] transition-all rounded-lg p-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-white/80 group-hover:text-amber-400 transition-colors">{item.kisi}</span>
                    <span className="text-[10px] text-slate-500">{item.vakit}</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed italic">"{item.metin}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sağ: İstatistik / Mottolar */}
          <div className="flex flex-col gap-6">
            <div className="glass rounded-[2rem] p-8 flex-1 flex flex-col justify-center border-l-4 border-l-amber-500">
              <span className="text-amber-500 text-xs uppercase tracking-widest mb-2 font-bold">Günün Ayeti</span>
              <p className="font-main text-lg leading-relaxed text-slate-200 italic font-light">
                "İyiliğin karşılığı, yalnız iyiliktir."
              </p>
              <span className="text-slate-500 text-xs mt-4">— Rahmân Suresi, 60. Ayet</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass rounded-3xl p-6 text-center">
                <div className="text-2xl font-bold text-white mb-1">1,240</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Toplam İyilik</div>
              </div>
              <div className="glass rounded-3xl p-6 text-center">
                <div className="text-2xl font-bold text-amber-500 mb-1">14</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Gün Kaldı</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.5em] font-bold">
            2026 • Ramazan Meditasyonu
          </p>
        </footer>
      </main>
    </div>
  );
};

export default ModernRamazanUI;