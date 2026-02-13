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

  // Ramazan 2026 baslangici (Turkiye): 19 Subat 2026
  RAMAZAN_START: '2026-02-19T00:00:00+03:00',
};
