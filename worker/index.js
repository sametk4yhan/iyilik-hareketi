// =============================================================================
// IYILIK HAREKETI - Cloudflare Worker API
// =============================================================================

// Turkce kufur kaliplari (regex)
const BANNED_PATTERNS = [
  /am[ıi]na?\s*(k|q)/i,
  /s[i1]k/i,
  /yar+a[kq]/i,
  /orospu/i,
  /p[i1][cç]/i,
  /g[oö]t[uü]?n/i,
  /ta[sş]+a[kq]/i,
  /kah?pe/i,
  /gavat/i,
  /pezeven[kq]/i,
  /s[uü]rt[uü][kq]/i,
];

const DAILY_NIYET_SOZLERI = [
  { metin: 'Bir tebessüm de sadakadır.', kaynak: 'Hadis-i Şerif' },
  { metin: 'İyilik, kalbi yormaz; kalbi genişletir.', kaynak: 'İyilik Hareketi' },
  { metin: 'Az da olsa sürekli yapılan iyilik berekettir.', kaynak: 'Ramazan Notu' },
  { metin: 'Paylaşınca eksilmez, çoğalır: merhamet.', kaynak: 'İyilik Hareketi' },
  { metin: 'Kapı çalmak bazen bir gönlü onarmaktır.', kaynak: 'Günün Sözü' },
  { metin: 'İnsana en çok yakışan, faydalı olmaktır.', kaynak: 'Günün Sözü' },
  { metin: 'Kırmadan konuşmak da bir iyiliktir.', kaynak: 'İyilik Hareketi' },
  { metin: 'Bir kişinin yükünü hafifletmek, büyük bir ibadettir.', kaynak: 'Ramazan Notu' },
  { metin: 'Niyet hayır olunca yol da hayır olur.', kaynak: 'Günün Sözü' },
  { metin: 'İyilik gizli olunca daha kıymetli olur.', kaynak: 'Günün Sözü' },
  { metin: 'Bugün bir kalbi ferahlat.', kaynak: 'İyilik Hareketi' },
  { metin: 'Bir selam, bir duaya vesile olabilir.', kaynak: 'Ramazan Notu' },
  { metin: 'Güzel söz de bir sadakadır.', kaynak: 'Hadis-i Şerif' },
  { metin: 'İyilik eden, önce kendi ruhunu iyileştirir.', kaynak: 'İyilik Hareketi' },
  { metin: 'Bugün birine kolaylık ol.', kaynak: 'Günün Sözü' },
  { metin: 'Merhamet, en sessiz ama en güçlü dildir.', kaynak: 'İyilik Hareketi' },
  { metin: 'İyilik bulaşıcıdır; sen başlat.', kaynak: 'Günün Sözü' },
  { metin: 'Bir teşekkür, bir insanın gününü değiştirir.', kaynak: 'Ramazan Notu' },
  { metin: 'Gönül almak, en zarif iyiliktir.', kaynak: 'Günün Sözü' },
  { metin: 'Bugün birinin duasında yer edin.', kaynak: 'İyilik Hareketi' },
];

function getIstanbulDateParts() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
  };
}

function getDailyNiyet() {
  const { year, month, day } = getIstanbulDateParts();
  const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86400000);
  const index = ((dayNumber % DAILY_NIYET_SOZLERI.length) + DAILY_NIYET_SOZLERI.length) % DAILY_NIYET_SOZLERI.length;
  return {
    ...DAILY_NIYET_SOZLERI[index],
    index,
    date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  };
}

function containsBannedWord(text = '') {
  const normalized = text.toLowerCase();
  return BANNED_PATTERNS.some((pattern) => pattern.test(normalized));
}

// Upstash Redis helper
async function upstashRequest(env, command, args = []) {
  const baseUrl = (env.UPSTASH_REDIS_REST_URL || '').trim().replace(/\/+$/, '');
  const token = (env.UPSTASH_REDIS_REST_TOKEN || '').trim().replace(/^Bearer\s+/i, '');

  if (!baseUrl || !token) {
    throw new Error('UPSTASH secrets missing: URL or TOKEN is empty');
  }

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([command, ...args]),
  });

  const raw = await response.text();
  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Upstash non-JSON response (${response.status}): ${raw.slice(0, 200)}`);
  }

  if (!response.ok) {
    throw new Error(`Upstash HTTP ${response.status}: ${data?.error || raw.slice(0, 200)}`);
  }

  if (data.error) {
    throw new Error(`Upstash error: ${data.error}`);
  }

  return data.result;
}

// AI Moderasyon (opsiyonel - Claude API)
async function checkWithAI(env, text) {
  if (!env.ANTHROPIC_API_KEY) return { approved: true };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: `Bu metin gercek bir iyilik/yardim eylemi mi? Sadece "EVET" veya "HAYIR" yaz.\n\nMetin: "${text}"\n\nKurallar:\n- Gercekci, yapilabilir bir iyilik olmali\n- Spam veya sacmalik olmamali\n- Hakaret icermemeli\n- Reklam olmamali`,
          },
        ],
      }),
    });

    const data = await response.json();
    const answer = data.content?.[0]?.text?.trim().toUpperCase();
    return { approved: answer === 'EVET' };
  } catch (e) {
    console.error('AI check failed:', e);
    return { approved: true };
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

// Rate limiting (IP bazli)
async function checkRateLimit(env, ip) {
  const key = `ratelimit:${ip}`;
  const count = await upstashRequest(env, 'GET', [key]);

  if (count && parseInt(count, 10) >= 10) {
    return false;
  }

  await upstashRequest(env, 'INCR', [key]);
  await upstashRequest(env, 'EXPIRE', [key, 60]);

  return true;
}

// Spam koruma (ayni icerik tekrari)
async function checkDuplicate(env, text, ip) {
  const key = `lasttext:${ip}`;
  const lastText = await upstashRequest(env, 'GET', [key]);

  if (lastText === text) {
    return false;
  }

  await upstashRequest(env, 'SET', [key, text, 'EX', 3600]);
  return true;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // GET /health - Hızlı tanı endpoint'i
      if (path === '/health' && request.method === 'GET') {
        const hasUpstashUrl = Boolean((env.UPSTASH_REDIS_REST_URL || '').trim());
        const hasUpstashToken = Boolean((env.UPSTASH_REDIS_REST_TOKEN || '').trim());
        let redisOk = false;
        let redisError = null;

        if (hasUpstashUrl && hasUpstashToken) {
          try {
            await upstashRequest(env, 'PING');
            redisOk = true;
          } catch (e) {
            redisError = e.message;
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              worker: 'ok',
              hasUpstashUrl,
              hasUpstashToken,
              redisOk,
              redisError,
            },
          }),
          { headers: corsHeaders }
        );
      }

// GET / - API bilgisi
if (path === '/' && request.method === 'GET') {
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Iyilik API calisiyor.',
      endpoints: ['/health', '/gunun-niyeti', '/iyilikler', '/leaderboard', '/stats'],
    }),
    { headers: corsHeaders }
  );
}

// GET /gunun-niyeti
if (path === '/gunun-niyeti' && request.method === 'GET') {
  const niyet = getDailyNiyet();
  return new Response(JSON.stringify({ success: true, data: niyet }), {
    headers: corsHeaders,
  });
}

      // GET /iyilikler
      if (path === '/iyilikler' && request.method === 'GET') {
        const data = await upstashRequest(env, 'LRANGE', ['iyilikler', 0, 99]);
        const iyilikler = (data || []).map((item) => JSON.parse(item));

        return new Response(JSON.stringify({ success: true, data: iyilikler }), {
          headers: corsHeaders,
        });
      }

      // POST /iyilikler
      if (path === '/iyilikler' && request.method === 'POST') {
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

        const withinLimit = await checkRateLimit(env, ip);
        if (!withinLimit) {
          return new Response(
            JSON.stringify({ success: false, error: 'Cok fazla istek. Lutfen biraz bekleyin.' }),
            { status: 429, headers: corsHeaders }
          );
        }

        const body = await request.json();
        const { isim, soyisim, iyilik } = body;

        if (!isim || !soyisim || !iyilik) {
          return new Response(JSON.stringify({ success: false, error: 'Tum alanlari doldurun.' }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        if (iyilik.length > 150) {
          return new Response(
            JSON.stringify({ success: false, error: 'Iyilik aciklamasi cok uzun.' }),
            { status: 400, headers: corsHeaders }
          );
        }

        const fullText = `${isim} ${soyisim} ${iyilik}`;
        if (containsBannedWord(fullText)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Uygunsuz icerik tespit edildi.' }),
            { status: 400, headers: corsHeaders }
          );
        }

        const isUnique = await checkDuplicate(env, iyilik, ip);
        if (!isUnique) {
          return new Response(
            JSON.stringify({ success: false, error: 'Bu iyiligi zaten eklediniz.' }),
            { status: 400, headers: corsHeaders }
          );
        }

        const aiCheck = await checkWithAI(env, iyilik);
        if (!aiCheck.approved) {
          const pendingItem = JSON.stringify({
            id: Date.now(),
            isim,
            soyisim: soyisim.charAt(0).toUpperCase() + '.',
            iyilik,
            tarih: new Date().toISOString(),
            ip,
          });
          await upstashRequest(env, 'LPUSH', ['pending', pendingItem]);

          return new Response(
            JSON.stringify({ success: true, pending: true, message: 'Iyiliginiz onay bekliyor.' }),
            { headers: corsHeaders }
          );
        }

        const newItem = JSON.stringify({
          id: Date.now(),
          isim,
          soyisim: soyisim.charAt(0).toUpperCase() + '.',
          iyilik,
          tarih: new Date().toISOString(),
        });

        await upstashRequest(env, 'LPUSH', ['iyilikler', newItem]);
        await upstashRequest(env, 'LTRIM', ['iyilikler', 0, 499]);

        return new Response(
          JSON.stringify({ success: true, message: 'Iyiliginiz kaydedildi!' }),
          { headers: corsHeaders }
        );
      }

      // GET /leaderboard
      if (path === '/leaderboard' && request.method === 'GET') {
        const data = await upstashRequest(env, 'LRANGE', ['iyilikler', 0, 499]);
        const iyilikler = (data || []).map((item) => JSON.parse(item));

        const counts = {};
        iyilikler.forEach((item) => {
          const key = `${item.isim} ${item.soyisim}`;
          counts[key] = (counts[key] || 0) + 1;
        });

        const leaderboard = Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        return new Response(JSON.stringify({ success: true, data: leaderboard }), {
          headers: corsHeaders,
        });
      }

      // GET /stats
      if (path === '/stats' && request.method === 'GET') {
        const total = await upstashRequest(env, 'LLEN', ['iyilikler']);
        const pending = await upstashRequest(env, 'LLEN', ['pending']);

        return new Response(
          JSON.stringify({
            success: true,
            data: { total: total || 0, pending: pending || 0 },
          }),
          { headers: corsHeaders }
        );
      }

      return new Response(JSON.stringify({ success: false, error: 'Endpoint bulunamadi.' }), {
        status: 404,
        headers: corsHeaders,
      });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Sunucu hatasi.',
          detail: error?.message || 'Unknown error',
        }),
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
