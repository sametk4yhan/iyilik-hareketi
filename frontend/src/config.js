// =============================================================================
// IYILIK HAREKETI - Config
// =============================================================================

export const CONFIG = {
  // Cloudflare Worker URL
  WORKER_URL: 'https://iyilik-api.iyilikhareketi.workers.dev',

  // Spam korumasi
  SPAM_COOLDOWN_MS: 30000,

  // Karakter limiti
  MAX_IYILIK_LENGTH: 150,

  // Diyanet Vakit Hesaplama'ya gore 2026 Ramazan baslangici (Turkiye): 19 Subat 2026
  // Diyanet Vakit Hesaplama'ya gore 2026 Ramazan bitisi (Turkiye): 20 Mart 2026
  // Kaynak: https://namazvakitleri.diyanet.gov.tr/tr-TR/20332/ramazan
  RAMAZAN_START: '2026-02-19T00:00:00+03:00',
  RAMAZAN_END: '2026-03-20T00:00:00+03:00',
};
