import React, { useState, useEffect, useCallback } from 'react';

// =============================================================================
// CONFIG - Bunları kendi değerlerinle değiştir
// =============================================================================
const CONFIG = {
  WORKER_URL: 'https://iyilik-api.YOUR_SUBDOMAIN.workers.dev',
  SPAM_COOLDOWN_MS: 30000, // 30 saniye bekleme
  MAX_IYILIK_LENGTH: 150,
};

// =============================================================================
// TÜRKÇE KÜFÜR FİLTRESİ (Frontend - İlk Katman)
// =============================================================================
const BANNED_PATTERNS = [
  // Temel kalıplar (regex)
  /am[ıi]na?\s*(k|q)/gi,
  /s[i1]k/gi,
  /yar+a[kq]/gi,
  /orospu/gi,
  /p[i1][cç]/gi,
  /g[oö]t[uü]?n/gi,
  /ta[sş]+a[kq]/gi,
  /kah?pe/gi,
  /gavat/gi,
  /pezeven[kq]/gi,
  /s[uü]rt[uü][kq]/gi,
  /o[cç]\b/gi,
  /mk\b/gi,
  /aq\b/gi,
  /amq/gi,
];

const containsBannedWord = (text) => {
  const normalized = text
    .toLowerCase()
    .replace(/[İ]/g, 'i')
    .replace(/[I]/g, 'ı');
  
  return BANNED_PATTERNS.some(pattern => pattern.test(normalized));
};

// =============================================================================
// SPAM KORUMASI
// =============================================================================
const getLastSubmitTime = () => {
  const time = localStorage.getItem('lastIyilikTime');
  return time ? parseInt