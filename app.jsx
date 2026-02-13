import React, { useState, useEffect } from 'react';

const RamazanPremiumUI = () => {
  const [time, setTime] = useState(new Date());
  const [iyilikler, setIyilikler] = useState([
    { id: 1, isim: "Samet K.", metin: "İyilik Hareketini kurdum <3", tarih: "1 sa önce" }
  ]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-amber-500/30 overflow-x-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&family=Bento:wght@700&display=swap');
        
        body { background-color: #020617; }
        
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: auto auto;
          gap: 1.5rem;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 2rem;
          padding: 2rem;
          transition: all 0.3s ease;
        }

        .glass-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(212, 175, 55, 0.2);
          transform: translateY(-5px);
        }

        .gold-text {
          background: linear-gradient(135deg, #f5e6a3 0%, #d4af37 50%, #8a6d1d 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
        }
      `}</style>

      {/* Arka Plan Dekorasyonu (Aura) */}
      <div className="orb w-[500px] h-[500px] bg-blue-900/20 -top-20 -left-20" />
      <div className="orb w-[400px] h-[400px] bg-amber-900/10 bottom-10 right-10" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        
        {/* Üst Bilgi Satırı */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <div>
            <h1 className="text-6xl font-extrabold tracking-tight mb-2">
              İyilik <span className="gold-text">Hareketi</span>
            </h1>
            <p className="text-slate-500 tracking-[0.2em] uppercase text-xs font-bold">Ramazan 2026 • Şanlıurfa</p>
          </div>
          
          <div className="text-right">
            <div className="text-5xl font-light tracking-tighter text-white/90">
              {time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-xs text-amber-500/60 font-bold uppercase mt-1 tracking-widest">
              {time.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
            </div>
          </div>
        </div>

        {/* Bento Grid Yapısı */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Geri Sayım Kartı */}
          <div className="md:col-span-8 glass-card flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Ramazan'a Kalan Süre</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'GÜN', val: '05' },
                { label: 'SAAT', val: '18' },
                { label: 'DAKİKA', val: '49' },
                { label: 'SANİYE', val: '19' }
              ].map(item => (
                <div key={item.label}>
                  <div className="text-4xl md:text-6xl font-bold text-white mb-1">{item.val}</div>
                  <div className="text-[10px] text-slate-500 font-bold">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Niyet Kartı (Sağ Üst) */}
          <div className="md:col-span-4 bg-gradient-to-br from-amber-500 to-amber-700 rounded-[2rem] p-8 text-slate-900 shadow-2xl shadow-amber-900/20">
            <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-4">Günün Niyeti</div>
            <p className="text-2xl font-bold leading-snug">
              "Her iyilik yeni bir iyiliğin kapısını açar."
            </p>
            <div className="mt-8 flex items-center gap-2">
              <div className="w-8 h-px bg-slate-900/30" />
              <span className="text-xs font-bold italic">Ramazan Ruhu</span>
            </div>
          </div>

          {/* İyilik Ekle (Sol Alt) */}
          <div className="md:col-span-4 glass-card">
            <h3 className="text-xl font-bold mb-6">İyilik Bırak</h3>
            <div className="space-y-4">
              <input placeholder="Adınız" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-amber-500/50 transition-all text-sm" />
              <textarea placeholder="Bugün ne yaptın?" rows="4" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-amber-500/50 transition-all text-sm resize-none" />
              <button className="w-full py-4 bg-white text-slate-950 font-bold rounded-2xl hover:bg-amber-400 transition-colors shadow-xl">Gönder</button>
            </div>
          </div>

          {/* İyilik Akışı (Sağ Alt) */}
          <div className="md:col-span-8 glass-card">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold">İyilik Akışı</h3>
               <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full text-slate-400">1 PAYLAŞIM</span>
             </div>
             
             <div className="space-y-4">
                {iyilikler.map(i => (
                  <div key={i.id} className="flex items-center justify-between p-6 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-amber-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-amber-500 flex items-center justify-center font-bold text-white shadow-lg">
                        {i.isim[0]}
                      </div>
                      <div>
                        <div className="font-bold text-white">{i.isim}</div>
                        <div className="text-sm text-slate-400">{i.metin}</div>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{i.tarih}</div>
                  </div>
                ))}
             </div>
          </div>

        </div>

        <footer className="mt-16 text-center opacity-30 text-[10px] tracking-[0.5em] uppercase font-bold">
          İyilikle Kalın • 2026
        </footer>
      </main>
    </div>
  );
};

export default RamazanPremiumUI;