import { useState, useEffect } from 'react';
import { Crosshair, Activity, TrendingUp, TrendingDown, Swords, Clock, BarChart3, Layers, Zap, Shield, Globe, Gauge } from 'lucide-react';
import TradingViewChart from './TradingViewChart';
import BattleScore from './BattleScore';
import ProIndicators from './ProIndicators';
import Seo from './Seo';
import { SUPPORTED_STREAMS } from '../App';
import { PriceFeed } from '../lib/price-feed';

function formatVolume(vol: number, price: number): string {
  const usdVol = vol * price;
  if (usdVol >= 1e12) return '$' + (usdVol / 1e12).toFixed(2) + 'T';
  if (usdVol >= 1e9) return '$' + (usdVol / 1e9).toFixed(2) + 'B';
  if (usdVol >= 1e6) return '$' + (usdVol / 1e6).toFixed(2) + 'M';
  return '$' + usdVol.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function SeriousModePage() {
  const [coin, setCoin] = useState('BTC');
  const [trades, setTrades] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState({ volume: '---', buyPct: 50, sellPct: 50, latency: '---', isLive: false, status: 'CONNECTING' });
  const [price, setPrice] = useState(0);
  const [prevPrice, setPrevPrice] = useState(0);
  const [dayChange, setDayChange] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrades([...PriceFeed.trades.slice(0, 20)]);
      const totalVol = PriceFeed._totalVol || 1;
      const buyVol = (totalVol + PriceFeed.cvd) / 2;
      const buyPct = Math.max(5, Math.min(95, (buyVol / totalVol) * 100));
      setPrice(PriceFeed.price);
      setPrevPrice(PriceFeed.prevPrice);
      const change = PriceFeed.dayOpen > 0 ? ((PriceFeed.price - PriceFeed.dayOpen) / PriceFeed.dayOpen) * 100 : 0;
      setDayChange(change);
      setLiveStats({
        volume: formatVolume(PriceFeed.volume || 0, PriceFeed.price || 1),
        buyPct: Math.round(buyPct),
        sellPct: Math.round(100 - buyPct),
        latency: PriceFeed.isLive ? PriceFeed.latency + 'ms' : '---',
        isLive: PriceFeed.isLive,
        status: PriceFeed.status || 'CONNECTING',
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const priceUp = price >= prevPrice;

  return (
    <div className="pt-20 pb-10 px-4 max-w-[1800px] mx-auto min-h-screen bg-[#030305] text-slate-300">
      <Seo
        title={`${coin}/USDT Serious Terminal | Live Trading View – btctoon.com`}
        description={`Professional ${coin}/USDT trading terminal with real-time TradingView chart, order flow analysis, and live Binance data on btctoon.com.`}
        path="/serious"
        imageAlt={`${coin} USDT Serious Trading Terminal – btctoon.com`}
      />

      {/* ── Premium Header Bar ── */}
      <div className="relative mb-4 rounded-xl overflow-hidden">
        {/* Gradient border glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-xl blur-sm"></div>
        <div className="relative bg-[#0a0a0f] border border-white/10 p-4 rounded-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Left: Brand + Instrument */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/20">
                  <Crosshair className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm font-bold text-white tracking-tight leading-none">SERIOUS TERMINAL</h1>
                    <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 text-[8px] font-bold rounded border border-amber-500/20 uppercase tracking-wider">PRO</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-medium uppercase tracking-widest">Premium Trading Tools</span>
                </div>
              </div>
              
              <div className="h-8 w-px bg-white/5 hidden lg:block"></div>
              
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-slate-500 text-[8px] font-semibold uppercase tracking-widest mb-1">INSTRUMENT</span>
                  <select 
                    value={coin}
                    onChange={(e) => setCoin(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-semibold focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all cursor-pointer"
                  >
                    {SUPPORTED_STREAMS.map(s => (
                      <option key={s.symbol} value={s.symbol}>{s.symbol}/USDT</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Center: Live Price */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-1">MARK PRICE</div>
                <div className={`text-2xl font-bold tabular-nums tracking-tight transition-colors duration-200 ${priceUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${price > 0 ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-1">24H CHANGE</div>
                <div className={`text-lg font-bold tabular-nums ${dayChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {dayChange >= 0 ? '+' : ''}{dayChange.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Right: Status */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-slate-500 text-[8px] font-semibold uppercase tracking-widest mb-1">FEED</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${liveStats.isLive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]'}`}></div>
                  <span className={`text-[11px] font-semibold uppercase ${liveStats.isLive ? 'text-emerald-400' : 'text-yellow-500'}`}>{liveStats.status}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-slate-500 text-[8px] font-semibold uppercase tracking-widest mb-1">LATENCY</span>
                <span className="text-[11px] font-bold text-white tabular-nums">{liveStats.latency}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-slate-500 text-[8px] font-semibold uppercase tracking-widest mb-1">24H VOL</span>
                <span className="text-[11px] font-bold text-white">{liveStats.volume}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Layout Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Sidebar - Analysis */}
        <div className="lg:col-span-3 space-y-3">
          {/* Sentiment */}
          <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl p-4 shadow-xl">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-blue-400" /> Sentiment Matrix
            </h3>
            <BattleScore coin={coin} />
          </div>

          {/* Technical Indicators */}
          <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl p-4 shadow-xl">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" /> Technical Indicators
            </h3>
            <ProIndicators />
          </div>
          
          {/* Market Stats */}
          <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl p-4 shadow-xl">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-orange-400" /> Market Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">24h Volume</span>
                <span className="text-white font-semibold">{liveStats.volume}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">24h High</span>
                <span className="text-emerald-400 font-semibold">${PriceFeed.dayHigh ? PriceFeed.dayHigh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">24h Low</span>
                <span className="text-red-400 font-semibold">${PriceFeed.dayLow ? PriceFeed.dayLow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">VWAP</span>
                <span className="text-blue-400 font-semibold">${PriceFeed.vwap > 0 ? PriceFeed.vwap.toFixed(2) : '---'}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">RSI (14)</span>
                <span className={`font-semibold ${PriceFeed.rsi > 70 ? 'text-red-400' : PriceFeed.rsi < 30 ? 'text-emerald-400' : 'text-slate-300'}`}>{PriceFeed.rsi.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Premium Features Card */}
          <div className="bg-gradient-to-br from-blue-500/[0.08] to-purple-500/[0.08] border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-bold text-white">Pro Features Active</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <Shield className="w-3 h-3 text-blue-400" /> Real-time order flow analysis
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <Globe className="w-3 h-3 text-emerald-400" /> Live Binance WebSocket feed
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <Gauge className="w-3 h-3 text-purple-400" /> VWAP, CVD, RSI, Bollinger Bands
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <BarChart3 className="w-3 h-3 text-orange-400" /> SMA, EMA, MACD overlay
              </div>
            </div>
          </div>
        </div>

        {/* Center - Main Chart Area */}
        <div className="lg:col-span-6 bg-[#0a0a0f] border border-white/[0.06] rounded-xl overflow-hidden relative min-h-[700px] flex flex-col shadow-2xl">
          <div className="p-3 border-b border-white/5 flex items-center justify-between bg-black/30">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{coin}/USDT</span>
                <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-bold rounded-md border border-blue-500/20 uppercase">Perp</span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider">1m • BINANCE</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 transition-colors"><TrendingUp className="w-3.5 h-3.5" /></button>
              <button className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 transition-colors"><Swords className="w-3.5 h-3.5" /></button>
              <div className="w-px h-4 bg-white/5 mx-1"></div>
              <button className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 transition-colors"><Clock className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <div className="flex-1 relative">
            <TradingViewChart key={coin.toLowerCase()} coin={coin} />
          </div>
        </div>

        {/* Right Sidebar - Order Flow */}
        <div className="lg:col-span-3 space-y-3">
          {/* Time & Sales */}
          <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl p-4 shadow-xl flex flex-col h-[380px]">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em] mb-3 flex items-center gap-2 shrink-0">
              <Clock className="w-3.5 h-3.5 text-red-400" /> Time & Sales
            </h3>
            <div className="flex justify-between text-[9px] font-semibold text-slate-600 uppercase tracking-widest mb-2 px-1 shrink-0">
              <span>Time</span>
              <span>Price</span>
              <span>Size</span>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1 pr-1">
              {trades.map((t, i) => (
                <div key={i} className="flex justify-between text-[11px] items-center py-0.5">
                  <span className="text-slate-600 tabular-nums">{t.time}</span>
                  <span className={`font-semibold tabular-nums ${t.type === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.price.toFixed(2)}
                  </span>
                  <span className="text-slate-400 font-medium tabular-nums">{t.size}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Flow Analysis */}
          <div className="bg-[#0a0a0f] border border-white/[0.06] rounded-xl p-4 shadow-xl">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <TrendingDown className="w-3.5 h-3.5 text-orange-400" /> Order Flow Analysis
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] mb-1.5">
                  <span className="text-slate-500 uppercase tracking-wider">Buy Pressure</span>
                  <span className="text-emerald-400 font-bold">{liveStats.buyPct}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${liveStats.buyPct}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-1.5">
                  <span className="text-slate-500 uppercase tracking-wider">Sell Pressure</span>
                  <span className="text-red-400 font-bold">{liveStats.sellPct}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-500" style={{ width: `${liveStats.sellPct}%` }}></div>
                </div>
              </div>

              {/* Net Flow Indicator */}
              <div className="pt-3 border-t border-white/5">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-slate-500 uppercase tracking-wider">Net Flow</span>
                  <span className={`font-bold ${liveStats.buyPct > liveStats.sellPct ? 'text-emerald-400' : 'text-red-400'}`}>
                    {liveStats.buyPct > liveStats.sellPct ? 'ACCUMULATION' : 'DISTRIBUTION'}
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden relative">
                  <div className="absolute inset-y-0 left-1/2 w-px bg-white/20 z-10"></div>
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${liveStats.buyPct > 50 ? 'bg-emerald-500/60' : 'bg-red-500/60'}`} 
                    style={{ 
                      width: `${Math.abs(liveStats.buyPct - 50)}%`,
                      marginLeft: liveStats.buyPct > 50 ? '50%' : `${50 - Math.abs(liveStats.buyPct - 50)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className={`rounded-xl p-4 border ${liveStats.isLive ? 'bg-emerald-500/[0.05] border-emerald-500/20' : 'bg-blue-600/[0.05] border-blue-500/20'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-1.5 rounded-lg ${liveStats.isLive ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`}>
                <Activity className={`w-3.5 h-3.5 ${liveStats.isLive ? 'text-emerald-400' : 'text-blue-400'}`} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${liveStats.isLive ? 'text-emerald-400' : 'text-blue-400'}`}>System Status</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              {liveStats.isLive 
                ? 'Real-time data feed active via Binance WebSocket. All systems operational. Premium order flow analysis enabled.' 
                : `${liveStats.status}... Simulation mode active while establishing connection.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
