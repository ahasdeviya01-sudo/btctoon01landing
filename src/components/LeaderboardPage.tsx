import { Trophy, TrendingUp, TrendingDown, Medal } from 'lucide-react';

const LEADERBOARD_DATA = [
  { rank: 1, user: 'CryptoKing', score: 14500, accuracy: 82, lastPrediction: 'BULL' },
  { rank: 2, user: 'BearWhale', score: 12300, accuracy: 78, lastPrediction: 'BEAR' },
  { rank: 3, user: 'DiamondHands', score: 11200, accuracy: 75, lastPrediction: 'BULL' },
  { rank: 4, user: 'SatoshiFan', score: 9800, accuracy: 68, lastPrediction: 'BULL' },
  { rank: 5, user: 'LunaSurvivor', score: 8500, accuracy: 65, lastPrediction: 'BEAR' },
  { rank: 6, user: 'DogeFather', score: 7200, accuracy: 60, lastPrediction: 'BULL' },
  { rank: 7, user: 'SolanaSummer', score: 6900, accuracy: 58, lastPrediction: 'BULL' },
];

export default function LeaderboardPage() {
  return (
    <div className="pt-8 pb-20 px-4 max-w-4xl mx-auto min-h-[80vh]">
      <div className="text-center mb-12 pt-12">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 flex items-center justify-center gap-4">
          <Trophy className="w-10 h-10 text-yellow-500" /> Leaderboard
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Predict the next market move. Score points. Become a legend.
        </p>
      </div>

      <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">Top Predictors</h2>
            <p className="text-sm text-slate-400">Ranked by total points</p>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold transition-colors">
            Make Prediction
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm bg-white/5">
                <th className="p-4 font-medium">Rank</th>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium text-right">Score</th>
                <th className="p-4 font-medium text-right">Accuracy</th>
                <th className="p-4 font-medium text-center">Last Move</th>
              </tr>
            </thead>
            <tbody>
              {LEADERBOARD_DATA.map((row) => (
                <tr key={row.rank} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 font-bold text-slate-300">
                      {row.rank === 1 && <Medal className="w-5 h-5 text-yellow-500" />}
                      {row.rank === 2 && <Medal className="w-5 h-5 text-slate-300" />}
                      {row.rank === 3 && <Medal className="w-5 h-5 text-amber-600" />}
                      {row.rank > 3 && row.rank}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-white">{row.user}</td>
                  <td className="p-4 text-right font-mono text-emerald-400">{row.score.toLocaleString()}</td>
                  <td className="p-4 text-right font-mono text-slate-300">{row.accuracy}%</td>
                  <td className="p-4 text-center">
                    {row.lastPrediction === 'BULL' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                        <TrendingUp className="w-3 h-3" /> BULL
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                        <TrendingDown className="w-3 h-3" /> BEAR
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
