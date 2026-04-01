import { useEffect, useState } from 'react';
import { PriceFeed } from '../lib/price-feed';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

export default function ProIndicators() {
  const [metrics, setMetrics] = useState({ vwap: 0, cvd: 0, rsi: 50, price: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        vwap: PriceFeed.vwap,
        cvd: PriceFeed.cvd,
        rsi: PriceFeed.rsi,
        price: PriceFeed.price
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const rsiColor = metrics.rsi > 70 ? 'text-red-400' : metrics.rsi < 30 ? 'text-emerald-400' : 'text-slate-300';
  const cvdColor = metrics.cvd > 0 ? 'text-emerald-400' : 'text-red-400';
  const vwapDiff = metrics.price - metrics.vwap;
  const vwapColor = vwapDiff > 0 ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className="w-full bg-transparent border-none p-0 shadow-none pointer-events-auto z-10">
      <div className="space-y-8">
        {/* VWAP Section */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">VWAP ENGINE</span>
            <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${vwapDiff > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {vwapDiff > 0 ? 'PREMIUM' : 'DISCOUNT'}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">${metrics.vwap > 0 ? metrics.vwap.toFixed(1) : '---'}</span>
            <span className={`text-xs font-bold ${vwapColor}`}>{vwapDiff > 0 ? '+' : ''}{(vwapDiff).toFixed(2)}</span>
          </div>
          <div className="mt-3 h-1.5 bg-white/5 rounded-full relative overflow-hidden">
            <div className="absolute inset-0 flex justify-center">
              <div className="w-px h-full bg-white/20 z-10"></div>
            </div>
            <div 
              className={`h-full transition-all duration-300 ${vwapDiff > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} 
              style={{ 
                width: `${Math.min(Math.abs(vwapDiff) / 2, 50)}%`,
                marginLeft: vwapDiff > 0 ? '50%' : `${50 - Math.min(Math.abs(vwapDiff) / 2, 50)}%`
              }} 
            />
          </div>
        </div>

        {/* CVD Section */}
        <div className="border-t border-white/5 pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">VOL DELTA (CVD)</span>
            <Activity className={`w-3 h-3 ${cvdColor}`} />
          </div>
          <div className={`text-2xl font-black ${cvdColor} flex items-center gap-2`}>
            {metrics.cvd > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {Math.abs(metrics.cvd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[9px] text-slate-600 mt-1 uppercase tracking-tighter">Cumulative net buying/selling pressure</p>
        </div>

        {/* RSI Section */}
        <div className="border-t border-white/5 pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">MOMENTUM (RSI)</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${metrics.rsi > 70 ? 'bg-red-500/10 text-red-400' : metrics.rsi < 30 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
              {metrics.rsi > 70 ? 'OVERBOUGHT' : metrics.rsi < 30 ? 'OVERSOLD' : 'STABLE'}
            </span>
          </div>
          <div className={`text-2xl font-black ${rsiColor}`}>
            {metrics.rsi.toFixed(2)}
          </div>
          <div className="mt-4 h-4 bg-white/5 rounded border border-white/10 relative overflow-hidden">
            {/* RSI Zones */}
            <div className="absolute left-0 top-0 bottom-0 w-[30%] bg-emerald-500/5 border-r border-emerald-500/20" />
            <div className="absolute right-0 top-0 bottom-0 w-[30%] bg-red-500/5 border-l border-red-500/20" />
            
            {/* RSI Marker */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_#fff] transition-all duration-200 z-20" 
              style={{ left: `${metrics.rsi}%`, transform: 'translateX(-50%)' }} 
            />
            
            {/* RSI Value Label in bar */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[8px] text-white/20 font-bold tracking-[0.2em]">30 --- 50 --- 70</span>
            </div>
          </div>
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute bottom-2 right-2 pointer-events-none opacity-20">
        <span className="text-[10px] font-black tracking-[0.3em] text-white">SERIOUS TERMINAL v4.0</span>
      </div>
    </div>
  );
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}
