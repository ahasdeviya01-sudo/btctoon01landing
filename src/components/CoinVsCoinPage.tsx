import { useState } from 'react';
import { Swords } from 'lucide-react';
import { SUPPORTED_STREAMS } from '../App';

export default function CoinVsCoinPage() {
  const [coin1, setCoin1] = useState('BTC');
  const [coin2, setCoin2] = useState('ETH');

  const getPath = (symbol: string) => {
    const stream = SUPPORTED_STREAMS.find(s => s.symbol === symbol);
    return stream ? stream.path : `/${symbol.toLowerCase()}`;
  };

  return (
    <div className="pt-8 pb-20 px-4 max-w-[1800px] mx-auto min-h-[80vh]">
      <div className="text-center mb-12 pt-12">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 flex items-center justify-center gap-4">
          Coin <Swords className="w-10 h-10 text-orange-500" /> Coin
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Side-by-side battle visualization. Compare order flow and momentum in real-time.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-[800px]">
        <div className="flex-1 flex flex-col gap-4 h-full">
          <div className="flex items-center gap-4 bg-[#0a0a0f] p-4 rounded-xl border border-white/10">
            <span className="text-slate-400 font-semibold text-sm uppercase tracking-wider">FIGHTER 1:</span>
            <select 
              value={coin1}
              onChange={(e) => setCoin1(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none focus:border-emerald-500"
            >
              {SUPPORTED_STREAMS.map(s => (
                <option key={s.symbol} value={s.symbol}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0f] flex-1 relative">
            <iframe 
              src={`${getPath(coin1)}?embed=true`} 
              className="absolute inset-0 w-full h-full border-0"
              title={`Stream ${coin1}`}
            />
          </div>
        </div>

        <div className="flex items-center justify-center lg:w-16 shrink-0">
          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
            <span className="font-black text-orange-500 italic">VS</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 h-full">
          <div className="flex items-center gap-4 bg-[#0a0a0f] p-4 rounded-xl border border-white/10 justify-end">
            <span className="text-slate-400 font-semibold text-sm uppercase tracking-wider">FIGHTER 2:</span>
            <select 
              value={coin2}
              onChange={(e) => setCoin2(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none focus:border-emerald-500"
            >
              {SUPPORTED_STREAMS.map(s => (
                <option key={s.symbol} value={s.symbol}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0f] flex-1 relative">
            <iframe 
              src={`${getPath(coin2)}?embed=true`} 
              className="absolute inset-0 w-full h-full border-0"
              title={`Stream ${coin2}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
