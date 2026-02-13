import React, { useState, useEffect } from 'react';

const IyilikHareketi = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [iyilikler, setIyilikler] = useState([
    { id: 1, isim: 'Ahmet', soyisim: 'Yılmaz', iyilik: 'Yaşlı komşuma market alışverişi yaptım', tarih: new Date(Date.now() - 3600000) },
    { id: 2, isim: 'Fatma', soyisim: 'Demir', iyilik: 'Sokak kedilerini besledim', tarih: new Date(Date.now() - 7200000) },
    { id: 3, isim: 'Mehmet', soyisim: 'Kaya', iyilik: 'İhtiyaç sahibi bir aileye erzak yardımı yaptım', tarih: new Date(Date.now() - 10800000) },
  ]);
  const [formData, setFormData] = useState({ isim: '', soyisim: '', iyilik: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ramazan 2025 başlangıcı (28 Şubat 2025 akşamı, 1 Mart 2025 ilk gün)
  const ramazanBaslangic = new Date('2025-03-01T00:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Geri sayım hesapla
      const diff = ramazanBaslangic - now;
      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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

  const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
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
    }, 300);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-yellow-300 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-yellow-200 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-60 left-1/4 w-1 h-1 bg-white rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 right-1/3 w-2 h-2 bg-yellow-300 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Header */}
      <header className="relative pt-8 pb-6 px-4">
        {/* Crescent Moon */}
        <div className="absolute top-4 right-8 text-6xl opacity-20">🌙</div>
        
        <div className="max-w-2xl mx-auto text-center">
          {/* Digital Clock */}
          <div className="mb-4">
            <div className="inline-block bg-black/30 backdrop-blur-sm rounded-2xl px-8 py-4 border border-yellow-500/20">
              <div className="text-5xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200" style={{ textShadow: '0 0 30px rgba(234, 179, 8, 0.5)' }}>
                {formatTime(currentTime)}
              </div>
              <div className="text-yellow-200/60 text-sm mt-1">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>

          {/* Countdown */}
          <div className="mb-6">
            <p className="text-yellow-200/80 text-sm mb-3">Ramazan'a Kalan Süre</p>
            <div className="flex justify-center gap-3">
              {[
                { value: countdown.days, label: 'Gün' },
                { value: countdown.hours, label: 