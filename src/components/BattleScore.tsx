import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { PriceFeed } from '../lib/price-feed';

export default function BattleScore({ coin }: { coin: string }) {
  const [score, setScore] = useState({ bulls: 50, bears: 50 });

  useEffect(() => {
    const interval = setInterval(() => {
      const open = PriceFeed.dayOpen || 1;
      const current = PriceFeed.price || 1;
      const diff = (current - open) / open;
      
      const maxMove = 0.05; 
      let bullPower = 50 + (diff / maxMove) * 50;
      bullPower = Math.max(5, Math.min(95, bullPower));
      
      setScore({ bulls: bullPower, bears: 100 - bullPower });
    }, 1000);
    return () => clearInterval(interval);
  }, [coin]);

  return (
    <div className="bg-transparent p-0 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">BUY PRESSURE</span>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-2xl font-black text-emerald-400">{score.bulls.toFixed(1)}%</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">SELL PRESSURE</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-red-400">{score.bears.toFixed(1)}%</span>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
        </div>
      </div>
      
      <div className="h-3 bg-white/5 rounded border border-white/10 overflow-hidden flex relative">
        <div 
          className="h-full bg-emerald-500/80 transition-all duration-1000" 
          style={{ width: `${score.bulls}%` }}
        ></div>
        <div 
          className="h-full bg-red-500/80 transition-all duration-1000" 
          style={{ width: `${score.bears}%` }}
        ></div>
        
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/40 z-10"></div>
      </div>

      <div className="flex justify-between text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">
        <span className={score.bulls > 50 ? 'text-emerald-500/50' : ''}>Accumulation Phase</span>
        <span className={score.bears > 50 ? 'text-red-500/50' : ''}>Distribution Phase</span>
      </div>
    </div>
  );
}
