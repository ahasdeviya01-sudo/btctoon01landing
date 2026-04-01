import { useState } from 'react';
import { Play, Calendar, AlertTriangle, TrendingDown, Star } from 'lucide-react';
import Battleground from './Battleground';

const HISTORICAL_EVENTS = [
  {
    id: 'march2020',
    title: 'The COVID Crash',
    date: 'March 12, 2020',
    coin: 'BTC',
    description: 'Bitcoin drops over 50% in a single day as global markets panic over the emerging pandemic. Watch the bears take absolute control.',
    icon: <TrendingDown className="w-6 h-6 text-red-500" />,
    color: 'from-red-500/20 to-transparent'
  },
  {
    id: 'luna',
    title: 'LUNA Collapse',
    date: 'May 9, 2022',
    coin: 'LUNA',
    description: 'The algorithmic stablecoin UST loses its peg, causing a death spiral that mints trillions of LUNA and drives the price to zero.',
    icon: <AlertTriangle className="w-6 h-6 text-orange-500" />,
    color: 'from-orange-500/20 to-transparent'
  },
  {
    id: 'ftx',
    title: 'FTX Insolvency',
    date: 'November 8, 2022',
    coin: 'FTT',
    description: 'Binance announces it will liquidate its FTT holdings, triggering a bank run on FTX and a catastrophic collapse of the FTT token.',
    icon: <AlertTriangle className="w-6 h-6 text-purple-500" />,
    color: 'from-purple-500/20 to-transparent'
  }
];

export default function HistoryPage() {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  if (activeScenario) {
    const event = HISTORICAL_EVENTS.find(e => e.id === activeScenario);
    return (
      <div className="pt-8 pb-20">
        <section className="py-12 px-4 md:px-6 max-w-[1400px] mx-auto min-h-[80vh]">
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <button 
                onClick={() => setActiveScenario(null)}
                className="text-emerald-400 hover:text-emerald-300 text-sm mb-4 flex items-center gap-2"
              >
                ← Back to History
              </button>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {event?.icon}
                REPLAY: {event?.title}
              </h2>
              <p className="text-slate-400 text-sm mt-1">{event?.date} • {event?.description}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-red-500/20 text-red-400 px-3 py-1.5 rounded-md border border-red-500/30">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> HISTORICAL SIMULATION
              </div>
            </div>
          </div>
          
          <Battleground key={activeScenario} isReplay={true} scenario={activeScenario} coin={event?.coin} />
        </section>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-20 px-4 max-w-7xl mx-auto min-h-[80vh]">
      <div className="text-center mb-16 pt-12">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Battle <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">History</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Relive the most dramatic moments in crypto history. Watch the order flow and market sentiment during legendary crashes and pumps, simulated as epic battles.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {HISTORICAL_EVENTS.map((event) => (
          <div 
            key={event.id}
            className={`bg-[#0a0a0f] p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group relative overflow-hidden`}
            onClick={() => setActiveScenario(event.id)}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${event.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  {event.icon}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white/5 px-2 py-1 rounded">
                  <Calendar className="w-3 h-3" />
                  {event.date}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
              <div className="text-xs font-semibold text-emerald-400 mb-3 border border-emerald-500/30 bg-emerald-500/10 inline-block px-2 py-0.5 rounded">
                COIN: {event.coin}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {event.description}
              </p>
              <button className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-lg font-medium transition-colors border border-white/10">
                <Play className="w-4 h-4" />
                Play Replay
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white tracking-tight mb-4 flex items-center justify-center gap-3">
            <Star className="w-8 h-8 text-yellow-500" /> Hall of Fame
          </h2>
          <p className="text-slate-400">The most legendary battles recorded by our community.</p>
        </div>
        
        <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm font-semibold bg-white/5">
                <th className="p-4 font-medium">Battle</th>
                <th className="p-4 font-medium">Winner</th>
                <th className="p-4 font-medium text-right">Volume</th>
                <th className="p-4 font-medium text-right">Casualties</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-white">The Great Squeeze of '21</td>
                <td className="p-4 text-emerald-400 font-bold">BULLS</td>
                <td className="p-4 text-right font-mono text-slate-300">$14.2B</td>
                <td className="p-4 text-right font-mono text-red-400">142,000 Bears</td>
              </tr>
              <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-white">Luna's Last Stand</td>
                <td className="p-4 text-red-400 font-bold">BEARS</td>
                <td className="p-4 text-right font-mono text-slate-300">$40.0B</td>
                <td className="p-4 text-right font-mono text-emerald-400">Millions of Bulls</td>
              </tr>
              <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 font-bold text-white">ETF Approval Day</td>
                <td className="p-4 text-emerald-400 font-bold">BULLS</td>
                <td className="p-4 text-right font-mono text-slate-300">$8.5B</td>
                <td className="p-4 text-right font-mono text-red-400">50,000 Bears</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
