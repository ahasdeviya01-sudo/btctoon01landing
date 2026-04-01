const BINANCE_GLOBAL = 'wss://stream.binance.com:9443/stream?streams=';
const COINBASE_URL   = 'wss://ws-feed.exchange.coinbase.com';
const BINANCE_REST   = 'https://api.binance.com/api/v3';
const FALLBACK_MS    = 45_000;
const RECONNECT_MS   = 4_000;
const MAX_TRADES     = 20;
const MAX_FAILURES   = 3;

let SIM_CENTER = 0;
let BINANCE_WS_URL = BINANCE_GLOBAL + 'btcusdt@aggTrade/btcusdt@miniTicker';
let COINBASE_PRODUCT = 'BTC-USD';

export interface CoinConfig {
  binanceSymbol: string;
  coinbaseProduct: string;
  variance: number;
  maxOrderSize: number;
}

export const COIN_CONFIGS: Record<string, CoinConfig> = {
  'BTC':  { binanceSymbol: 'btcusdt',  coinbaseProduct: 'BTC-USD',  variance: 3000,  maxOrderSize: 1.9   },
  'ETH':  { binanceSymbol: 'ethusdt',  coinbaseProduct: 'ETH-USD',  variance: 150,   maxOrderSize: 15.9  },
  'SOL':  { binanceSymbol: 'solusdt',  coinbaseProduct: 'SOL-USD',  variance: 10,    maxOrderSize: 50    },
  'XRP':  { binanceSymbol: 'xrpusdt',  coinbaseProduct: 'XRP-USD',  variance: 0.05,  maxOrderSize: 15000 },
  'DOGE': { binanceSymbol: 'dogeusdt', coinbaseProduct: 'DOGE-USD', variance: 0.02,  maxOrderSize: 50000 },
  'ADA':  { binanceSymbol: 'adausdt',  coinbaseProduct: 'ADA-USD',  variance: 0.04,  maxOrderSize: 20000 },
  'AVAX': { binanceSymbol: 'avaxusdt', coinbaseProduct: 'AVAX-USD', variance: 3,     maxOrderSize: 150   },
  'LINK': { binanceSymbol: 'linkusdt', coinbaseProduct: 'LINK-USD', variance: 1.5,   maxOrderSize: 300   },
};

export const PriceFeed = {
  coin       : 'BTC',
  price      : 0,
  prevPrice  : 0,
  velocity   : 0,
  dayOpen    : 0,
  dayHigh    : 0,
  dayLow     : 0,
  volume     : 0,
  trades     : [] as any[],
  isLive     : false,
  hasNewData : false,
  status     : 'CONNECTING',
  source     : '',
  isReplay   : false,
  vwap       : 0,
  cvd        : 0,
  rsi        : 50,
  latency    : 0,
  _priceHistoryForRsi: [] as number[],
  _totalVol  : 0,
  _totalVolPrice: 0,
  tick: () => {},
  seedHistory: (_priceArr: number[], _volumeArr: number[]) => {}
};

let simTrend = 0;

function _simStep() {
  if (SIM_CENTER <= 0) return;
  simTrend += (Math.random() - 0.5) * 0.0008;
  simTrend *= 0.94;
  simTrend -= ((PriceFeed.price - SIM_CENTER) / SIM_CENTER) * 0.04;
  const vol   = 0.00018 + Math.abs(simTrend) * 0.5;
  const spike = Math.random() < 0.01 ? 2.0 + Math.random() * 1.8 : 1;
  const chg   = PriceFeed.price * (simTrend + (Math.random() - 0.5) * vol * spike);
  const config = COIN_CONFIGS[PriceFeed.coin] || COIN_CONFIGS['BTC'];
  const lo = SIM_CENTER - config.variance * 2;
  const hi = SIM_CENTER + config.variance * 2;
  const next = Math.max(lo, Math.min(hi, PriceFeed.price + chg));

  PriceFeed.prevPrice = PriceFeed.price;
  PriceFeed.velocity  = next - PriceFeed.price;
  PriceFeed.price     = next;
  if (next > PriceFeed.dayHigh) PriceFeed.dayHigh = next;
  if (next < PriceFeed.dayLow)  PriceFeed.dayLow  = next;

  const isBuy = Math.random() > 0.5;
  const size  = Math.random() * config.maxOrderSize + 0.01;

  PriceFeed._totalVol += size;
  PriceFeed._totalVolPrice += next * size;
  PriceFeed.vwap = PriceFeed._totalVolPrice / PriceFeed._totalVol;
  PriceFeed.cvd += isBuy ? size : -size;

  _updateRsi(next);

  if (Math.random() < 0.3) {
    _pushTrade(isBuy ? 'buy' : 'sell', size.toFixed(3), next);
  }
}

function _updateRsi(p: number) {
  PriceFeed._priceHistoryForRsi.push(p);
  if (PriceFeed._priceHistoryForRsi.length > 15) PriceFeed._priceHistoryForRsi.shift();
  if (PriceFeed._priceHistoryForRsi.length === 15) {
    let gains = 0, losses = 0;
    for (let i = 1; i < 15; i++) {
      const diff = PriceFeed._priceHistoryForRsi[i] - PriceFeed._priceHistoryForRsi[i-1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    const avgGain = gains / 14;
    const avgLoss = losses / 14;
    PriceFeed.rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain / avgLoss)));
  }
}

function _pushTrade(type: string, size: string, price: number) {
  const d   = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  PriceFeed.trades.unshift({
    type, size, price,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  });
  if (PriceFeed.trades.length > MAX_TRADES) PriceFeed.trades.pop();
}

PriceFeed.tick = function () {
  if (!PriceFeed.isLive && !PriceFeed.isReplay) _simStep();
};

PriceFeed.seedHistory = function (priceArr: number[], volumeArr: number[]) {
  if (SIM_CENTER <= 0) return;
  let p = SIM_CENTER;
  const config = COIN_CONFIGS[PriceFeed.coin] || COIN_CONFIGS['BTC'];
  const variance = config.variance;
  for (let i = 0; i < priceArr.length; i++) {
    p += (Math.random() - 0.5) * p * 0.0006;
    p  = Math.max(SIM_CENTER - variance, Math.min(SIM_CENTER + variance, p));
    priceArr[i]  = p;
    volumeArr[i] = Math.random() * 20 + 5;
  }
  PriceFeed.dayOpen   = priceArr[0];
  PriceFeed.price     = p;
  PriceFeed.prevPrice = p;
  PriceFeed.dayHigh   = Math.max(...priceArr);
  PriceFeed.dayLow    = Math.min(...priceArr);
  for (let i = 0; i < 15; i++) {
    _pushTrade(
      Math.random() > 0.5 ? 'buy' : 'sell',
      (Math.random() * config.maxOrderSize + 0.01).toFixed(3),
      p
    );
  }
};

// ─── Fetch real 24h ticker from Binance REST to bootstrap correct prices ───
async function _fetchRealPrice(symbol: string): Promise<{price: number, open: number, high: number, low: number, volume: number} | null> {
  try {
    const res = await fetch(`${BINANCE_REST}/ticker/24hr?symbol=${symbol.toUpperCase()}`);
    if (!res.ok) return null;
    const d = await res.json();
    return {
      price:  parseFloat(d.lastPrice),
      open:   parseFloat(d.openPrice),
      high:   parseFloat(d.highPrice),
      low:    parseFloat(d.lowPrice),
      volume: parseFloat(d.volume),
    };
  } catch (_) {
    return null;
  }
}

// ─── Fetch real kline (candlestick) history from Binance REST ───
export async function fetchKlines(symbol: string, interval = '1m', limit = 100): Promise<any[] | null> {
  try {
    const res = await fetch(`${BINANCE_REST}/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.map((k: any) => ({
      time: Math.floor(k[0] / 1000),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low:  parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));
  } catch (_) {
    return null;
  }
}

let ws: WebSocket | null = null;
let lastDataMs      = 0;
let reconnectTimer: any  = null;
let binanceFailures = 0;
let currentSource   = 'binance';

function _applyPrice(p: number, isBuy: boolean, qty?: string) {
  if (!p || isNaN(p)) return;
  PriceFeed.prevPrice  = PriceFeed.price;
  PriceFeed.velocity   = p - PriceFeed.price;
  PriceFeed.price      = p;
  PriceFeed.hasNewData = true;
  if (p > PriceFeed.dayHigh) PriceFeed.dayHigh = p;
  if (p < PriceFeed.dayLow)  PriceFeed.dayLow  = p;

  const q = qty ? parseFloat(qty) : 0.01;
  PriceFeed._totalVol += q;
  PriceFeed._totalVolPrice += p * q;
  PriceFeed.vwap = PriceFeed._totalVolPrice / PriceFeed._totalVol;
  PriceFeed.cvd += isBuy ? q : -q;

  _updateRsi(p);

  if (qty !== undefined) {
    _pushTrade(isBuy ? 'buy' : 'sell', parseFloat(qty).toFixed(3), p);
  }
  if (!PriceFeed.isLive) {
    PriceFeed.isLive = true;
    PriceFeed.status = 'LIVE';
  }
}

function connectBinance() {
  if (ws) { try { ws.close(); } catch (_) {} }
  PriceFeed.status = PriceFeed.isLive ? 'RECONNECTING' : 'CONNECTING';
  PriceFeed.source = 'BINANCE';

  try { ws = new WebSocket(BINANCE_WS_URL); }
  catch (_) { _onBinanceFail(); return; }

  const openTimer = setTimeout(() => {
    if (!PriceFeed.isLive) _onBinanceFail();
  }, 8000);

  ws.onopen = () => {
    clearTimeout(reconnectTimer);
    lastDataMs = Date.now();
  };

  ws.onmessage = evt => {
    lastDataMs = Date.now();
    clearTimeout(openTimer);
    binanceFailures = 0;

    let msg;
    try { msg = JSON.parse(evt.data); } catch (_) { return; }
    const { stream, data } = msg;
    if (!stream || !data) return;

    if (stream.endsWith('@aggTrade')) {
      if (data.E) PriceFeed.latency = Math.max(0, Date.now() - data.E);
      _applyPrice(parseFloat(data.p), !data.m, data.q);
    } else if (stream.endsWith('@miniTicker')) {
      if (data.o) PriceFeed.dayOpen = parseFloat(data.o);
      if (data.h) PriceFeed.dayHigh = parseFloat(data.h);
      if (data.l) PriceFeed.dayLow  = parseFloat(data.l);
      if (data.v) PriceFeed.volume  = parseFloat(data.v);
    }
  };

  ws.onerror = () => { clearTimeout(openTimer); };

  ws.onclose = (evt) => {
    clearTimeout(openTimer);
    if (evt.code === 1006 || evt.code === 451) {
      _onBinanceFail();
    } else {
      if (PriceFeed.isLive) { PriceFeed.isLive = false; PriceFeed.status = 'RECONNECTING'; }
      _scheduleReconnect();
    }
  };
}

function _onBinanceFail() {
  binanceFailures++;
  if (PriceFeed.isLive) { PriceFeed.isLive = false; PriceFeed.status = 'RECONNECTING'; }
  if (binanceFailures >= MAX_FAILURES) {
    console.log('[PriceFeed] Binance failed ' + binanceFailures + 'x → switching to Coinbase');
    currentSource = 'coinbase';
    connectCoinbase();
  } else {
    _scheduleReconnect();
  }
}

function connectCoinbase() {
  if (ws) { try { ws.close(); } catch (_) {} }
  PriceFeed.status = PriceFeed.isLive ? 'RECONNECTING' : 'CONNECTING';
  PriceFeed.source = 'COINBASE';

  try { ws = new WebSocket(COINBASE_URL); }
  catch (_) { _scheduleReconnect(); return; }

  ws.onopen = () => {
    clearTimeout(reconnectTimer);
    lastDataMs = Date.now();
    ws!.send(JSON.stringify({
      type: 'subscribe',
      channels: [
        { name: 'ticker', product_ids: [COINBASE_PRODUCT] },
        { name: 'matches', product_ids: [COINBASE_PRODUCT] }
      ]
    }));
  };

  ws.onmessage = evt => {
    lastDataMs = Date.now();
    let msg;
    try { msg = JSON.parse(evt.data); } catch (_) { return; }

    if (msg.type === 'ticker') {
      const p = parseFloat(msg.price);
      _applyPrice(p, msg.side === 'buy', msg.last_size || '0.01');
      if (msg.open_24h) PriceFeed.dayOpen = parseFloat(msg.open_24h);
      if (msg.high_24h) PriceFeed.dayHigh = parseFloat(msg.high_24h);
      if (msg.low_24h)  PriceFeed.dayLow  = parseFloat(msg.low_24h);
      if (msg.volume_24h) PriceFeed.volume = parseFloat(msg.volume_24h);
    } else if (msg.type === 'match' || msg.type === 'last_match') {
      const p = parseFloat(msg.price);
      _applyPrice(p, msg.side === 'buy', msg.size);
    }
  };

  ws.onerror = () => {};
  ws.onclose = () => {
    if (PriceFeed.isLive) { PriceFeed.isLive = false; PriceFeed.status = 'RECONNECTING'; }
    _scheduleReconnect();
  };
}

function connect() {
  if (currentSource === 'coinbase') connectCoinbase();
  else connectBinance();
}

function _scheduleReconnect() {
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(connect, RECONNECT_MS);
}

let watchdogTimer: any = null;

export async function initPriceFeed(coin: string = 'BTC') {
  cleanupPriceFeed();
  
  PriceFeed.coin = coin;
  const config = COIN_CONFIGS[coin] || COIN_CONFIGS['BTC'];
  const sym = config.binanceSymbol;

  BINANCE_WS_URL   = BINANCE_GLOBAL + `${sym}@aggTrade/${sym}@miniTicker`;
  COINBASE_PRODUCT  = config.coinbaseProduct;

  PriceFeed.trades = [];
  PriceFeed.isLive = false;
  PriceFeed.hasNewData = false;
  PriceFeed.status = 'CONNECTING';
  PriceFeed.source = '';
  PriceFeed.isReplay = false;
  PriceFeed.vwap = 0;
  PriceFeed.cvd = 0;
  PriceFeed.rsi = 50;
  PriceFeed._priceHistoryForRsi = [];
  PriceFeed._totalVol = 0;
  PriceFeed._totalVolPrice = 0;
  binanceFailures = 0;
  currentSource = 'binance';
  simTrend = 0;

  // Fetch real current price from Binance REST to bootstrap
  const realTicker = await _fetchRealPrice(sym);
  if (realTicker) {
    SIM_CENTER          = realTicker.price;
    PriceFeed.price     = realTicker.price;
    PriceFeed.prevPrice = realTicker.price;
    PriceFeed.dayOpen   = realTicker.open;
    PriceFeed.dayHigh   = realTicker.high;
    PriceFeed.dayLow    = realTicker.low;
    PriceFeed.volume    = realTicker.volume;
  } else {
    SIM_CENTER          = 0;
    PriceFeed.price     = 0;
    PriceFeed.prevPrice = 0;
    PriceFeed.dayOpen   = 0;
    PriceFeed.dayHigh   = 0;
    PriceFeed.dayLow    = 0;
  }

  PriceFeed.tick = function () {
    if (!PriceFeed.isLive && !PriceFeed.isReplay) _simStep();
  };

  connect();
  watchdogTimer = setInterval(() => {
    if (PriceFeed.isLive && Date.now() - lastDataMs > FALLBACK_MS) {
      PriceFeed.isLive = false;
      PriceFeed.status = 'SYNCING...';
      PriceFeed.source = '';
    }
    if (PriceFeed.status === 'SYNCING...' && !reconnectTimer) {
      connect();
    }
  }, 10_000);
}

export function initReplayFeed(scenario: string) {
  cleanupPriceFeed();
  
  PriceFeed.isLive = false;
  PriceFeed.isReplay = true;
  PriceFeed.hasNewData = false;
  PriceFeed.status = 'REPLAY';
  PriceFeed.source = 'HISTORICAL ARCHIVE';
  PriceFeed.trades = [];
  PriceFeed.volume = 0;
  PriceFeed.vwap = 0;
  PriceFeed.cvd = 0;
  PriceFeed.rsi = 50;
  PriceFeed._priceHistoryForRsi = [];
  PriceFeed._totalVol = 0;
  PriceFeed._totalVolPrice = 0;

  let targetPrice = 0;
  let dropRate = 0;

  if (scenario === 'march2020') {
    PriceFeed.coin = 'BTC';
    PriceFeed.price = 7900;
    PriceFeed.dayOpen = 7900;
    PriceFeed.dayHigh = 8000;
    PriceFeed.dayLow = 4000;
    targetPrice = 3800;
    dropRate = 0.005;
  } else if (scenario === 'luna') {
    PriceFeed.coin = 'LUNA';
    PriceFeed.price = 82.50;
    PriceFeed.dayOpen = 82.50;
    PriceFeed.dayHigh = 85.00;
    PriceFeed.dayLow = 0.01;
    targetPrice = 0.01;
    dropRate = 0.015;
  } else if (scenario === 'ftx') {
    PriceFeed.coin = 'FTT';
    PriceFeed.price = 22.50;
    PriceFeed.dayOpen = 22.50;
    PriceFeed.dayHigh = 24.00;
    PriceFeed.dayLow = 1.50;
    targetPrice = 1.50;
    dropRate = 0.008;
  }

  PriceFeed.prevPrice = PriceFeed.price;
  SIM_CENTER = PriceFeed.price;

  PriceFeed.tick = function() {
    if (PriceFeed.price <= targetPrice) return;

    const chg = PriceFeed.price * (-dropRate - (Math.random() * 0.002));
    const next = Math.max(targetPrice, PriceFeed.price + chg);

    PriceFeed.prevPrice = PriceFeed.price;
    PriceFeed.velocity = next - PriceFeed.price;
    PriceFeed.price = next;
    PriceFeed.volume += Math.random() * 5000;
    PriceFeed.hasNewData = true;

    if (next > PriceFeed.dayHigh) PriceFeed.dayHigh = next;
    if (next < PriceFeed.dayLow) PriceFeed.dayLow = next;

    if (Math.random() < 0.8) {
      _pushTrade('sell', (Math.random() * 50 + 10).toFixed(2), next);
    }
    if (Math.random() < 0.2) {
      _pushTrade('buy', (Math.random() * 5 + 0.1).toFixed(2), next);
    }
  };
}

export function cleanupPriceFeed() {
  if (ws) {
    ws.close();
    ws = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (watchdogTimer) {
    clearInterval(watchdogTimer);
    watchdogTimer = null;
  }
}
