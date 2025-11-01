// Deno Edge Function: coingecko-proxy
// Proxies selected CoinGecko endpoints with permissive CORS
// Supported types:
//  - price:   /api/v3/simple/price?ids=:coinId&vs_currencies=usd
//  - coin:    /api/v3/coins/:coinId
//  - chart:   /api/v3/coins/:coinId/market_chart?vs_currency=usd&days=:days

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const coinId = url.searchParams.get("coinId") || "";
  const days = url.searchParams.get("days") || "7";

  if (!type) {
    return new Response(JSON.stringify({ error: "Missing type" }), { status: 400, headers: corsHeaders });
  }

  try {
    let target = "";
    if (type === "price") {
      target = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=usd`;
    } else if (type === "coin") {
      target = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinId)}`;
    } else if (type === "chart") {
      target = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinId)}/market_chart?vs_currency=usd&days=${encodeURIComponent(days)}`;
    } else {
      return new Response(JSON.stringify({ error: "Unsupported type" }), { status: 400, headers: corsHeaders });
    }

    const upstream = await fetch(target, { headers: { "accept": "application/json" } });
    const text = await upstream.text();

    return new Response(text, { status: upstream.status, headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Proxy failed", details: String(e) }), { status: 500, headers: corsHeaders });
  }
});