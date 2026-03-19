/**
 * Cloudflare Worker — NihongoMaster Anonymous Usage Counter
 *
 * Deploy this as a Cloudflare Worker (free tier) to count daily active users.
 * Uses Cloudflare KV for storage.
 *
 * Setup:
 *   1. Create a Cloudflare account (free)
 *   2. Create a KV namespace called "ANALYTICS"
 *   3. Create a Worker and paste this code
 *   4. Bind the KV namespace to the worker as "ANALYTICS"
 *   5. Copy the worker URL and set it as ANALYTICS_ENDPOINT in
 *      src/services/analyticsService.ts
 *
 * Data stored (in KV):
 *   - "total_pings" → cumulative count
 *   - "daily:{YYYY-MM-DD}" → unique users that day (count)
 *   - "versions:{version}" → count per version
 *   - "platforms:{platform}" → count per platform
 *
 * NO personal data is stored. No IPs logged. The anonymous ID is only
 * used for daily deduplication (same user won't count twice in one day).
 */

export default {
  async fetch(request, env) {
    // CORS headers for the Tauri app
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // GET /stats — return current counts (for your dashboard)
    if (request.method === 'GET') {
      const total = parseInt(await env.ANALYTICS.get('total_pings') || '0');
      const today = new Date().toISOString().slice(0, 10);
      const todayCount = parseInt(await env.ANALYTICS.get(`daily:${today}`) || '0');

      return new Response(JSON.stringify({
        total_pings: total,
        today_active: todayCount,
        date: today,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST / — receive a ping
    if (request.method === 'POST') {
      try {
        const body = await request.json();
        const { v, p, id } = body; // version, platform, anonymous ID
        const today = new Date().toISOString().slice(0, 10);

        // Deduplicate: check if this anonymous ID already pinged today
        const dedupeKey = `seen:${today}:${id}`;
        const alreadySeen = await env.ANALYTICS.get(dedupeKey);
        if (alreadySeen) {
          return new Response('already counted', { status: 200, headers: corsHeaders });
        }

        // Mark as seen (expires after 48 hours)
        await env.ANALYTICS.put(dedupeKey, '1', { expirationTtl: 172800 });

        // Increment counters
        const total = parseInt(await env.ANALYTICS.get('total_pings') || '0');
        await env.ANALYTICS.put('total_pings', String(total + 1));

        const dailyCount = parseInt(await env.ANALYTICS.get(`daily:${today}`) || '0');
        await env.ANALYTICS.put(`daily:${today}`, String(dailyCount + 1), { expirationTtl: 2592000 }); // 30 days

        if (v) {
          const vCount = parseInt(await env.ANALYTICS.get(`versions:${v}`) || '0');
          await env.ANALYTICS.put(`versions:${v}`, String(vCount + 1));
        }

        if (p) {
          const pCount = parseInt(await env.ANALYTICS.get(`platforms:${p}`) || '0');
          await env.ANALYTICS.put(`platforms:${p}`, String(pCount + 1));
        }

        return new Response('ok', { status: 200, headers: corsHeaders });
      } catch {
        return new Response('error', { status: 400, headers: corsHeaders });
      }
    }

    return new Response('not found', { status: 404, headers: corsHeaders });
  },
};
