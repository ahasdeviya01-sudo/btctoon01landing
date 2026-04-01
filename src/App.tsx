/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useSearchParams } from 'react-router-dom';
import { Activity, TrendingUp, TrendingDown, Swords, Github, Twitter, ChevronDown, History, Image as ImageIcon, Trophy, Bell, Crosshair } from 'lucide-react';
import Battleground from './components/Battleground';
import HistoryPage from './components/HistoryPage';
import CoinVsCoinPage from './components/CoinVsCoinPage';
import ToonPage from './components/ToonPage';
import LeaderboardPage from './components/LeaderboardPage';
import SeriousModePage from './components/SeriousModePage';
import BattleScore from './components/BattleScore';
import Seo from './components/Seo';
import { PriceFeed } from './lib/price-feed';

// --- CONFIGURATION ---
// Add new coins here to automatically generate navigation and routes
export const SUPPORTED_STREAMS = [
  { id: 'btc', symbol: 'BTC', path: '/', name: 'BTC Stream' },
  { id: 'eth', symbol: 'ETH', path: '/eth', name: 'ETH Stream' },
  { id: 'sol', symbol: 'SOL', path: '/sol', name: 'SOL Stream' },
  { id: 'xrp', symbol: 'XRP', path: '/xrp', name: 'XRP Stream' },
  { id: 'doge', symbol: 'DOGE', path: '/doge', name: 'DOGE Stream' },
  { id: 'ada', symbol: 'ADA', path: '/ada', name: 'ADA Stream' },
  { id: 'avax', symbol: 'AVAX', path: '/avax', name: 'AVAX Stream' },
  { id: 'link', symbol: 'LINK', path: '/link', name: 'LINK Stream' },
];

function HeroSection({ coin }: { coin: string }) {
  return (
    <header className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#0a0a0f] to-[#0a0a0f] -z-10"></div>
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-emerald-400 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          LIVE: {coin}/USDT BATTLE
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
          The Ultimate <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Crypto Battleground</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          Real-time market visualization powered by live WebSocket data from Binance and Coinbase. Watch the order flow unfold as an epic animated battle.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a href="#live-feed" className="bg-emerald-500 text-black px-8 py-3 rounded-full font-bold hover:bg-emerald-400 transition-colors">
            Launch Terminal
          </a>
        </div>
      </div>
    </header>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24 border-t border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Powered by Real Data</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Every missile, every charge, and every explosion represents actual market activity happening right now.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#0a0a0f] p-8 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Bull Charges</h3>
            <p className="text-slate-400 text-sm leading-relaxed">When buy pressure surges, the bulls charge. Massive buy walls trigger airstrikes to clear out the bears.</p>
          </div>
          <div className="bg-[#0a0a0f] p-8 rounded-2xl border border-white/5 hover:border-red-500/30 transition-colors">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Bear Dumps</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Panic selling brings out the bears. Watch as they tear down the price with coordinated attacks and heavy volume.</p>
          </div>
          <div className="bg-[#0a0a0f] p-8 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-colors">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Live Order Book</h3>
            <p className="text-slate-400 text-sm leading-relaxed">The HUD displays real-time order flow, RSI, volatility, and a custom Fear & Greed index calculated on the fly.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StreamPage({ coin, isHome }: { coin: string; isHome?: boolean }) {
  const [searchParams] = useSearchParams();
  const isEmbed = searchParams.get('embed') === 'true';
  const [alertSet, setAlertSet] = useState(false);

  const coinPath = SUPPORTED_STREAMS.find(s => s.symbol === coin)?.path || '/';

  return (
    <div className={isHome && !isEmbed ? "" : isEmbed ? "pt-4 pb-4" : "pt-8 pb-20"}>
      <Seo
        title={`${coin} Price Today | ${coin}/USDT Live Price & Battle – btctoon.com`}
        description={`Live ${coin}/USDT price updated every second. Watch the animated bulls vs bears battleground driven by real Binance order flow on btctoon.com.`}
        path={coinPath}
        imageAlt={`${coin} USDT Live Battleground – btctoon.com`}
      />
      {isHome && !isEmbed && <HeroSection coin={coin} />}
      
      <section id="live-feed" className={`py-4 px-2 md:px-4 max-w-[1400px] mx-auto ${isHome && !isEmbed ? '' : isEmbed ? 'h-full' : 'min-h-[80vh]'}`}>
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-emerald-400" />
              {coin} Live Market Feed
            </h2>
            <p className="text-slate-400 text-sm mt-1">Real-time order book and trade visualization</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <button 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-colors ${alertSet ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/30'}`}
              onClick={() => setAlertSet(true)}
            >
              <Bell className="w-3 h-3" /> {alertSet ? 'Alert Set!' : 'Set Alert'}
            </button>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-md border border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Binance
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-md border border-white/10">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div> Coinbase
            </div>
          </div>
        </div>

        <BattleScore coin={coin} />
        
        {/* The Battleground Component */}
        <Battleground key={coin.toLowerCase()} coin={coin} />
        
      </section>

      {isHome && !isEmbed && <FeaturesSection />}
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isEmbed = searchParams.get('embed') === 'true';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mainStreams = SUPPORTED_STREAMS.slice(0, 3);
  const moreStreams = SUPPORTED_STREAMS.slice(3);

  return (
    <div className={`min-h-screen bg-[#0a0a0f] text-slate-300 font-sans selection:bg-emerald-500/30 ${isEmbed ? '' : ''}`}>
      {/* Navbar */}
      {!isEmbed && (
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link 
              to="/" 
              onClick={(e) => { 
                if (location.pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' }); 
                  window.history.pushState(null, '', '/');
                } 
              }}
              className="flex items-center gap-2 font-bold text-xl text-white tracking-tight"
            >
              <Swords className="w-6 h-6 text-emerald-400" />
              <span>BTC<span className="text-emerald-400">TOON</span></span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              {mainStreams.map((stream) => {
                const isActive = location.pathname === stream.path;
                const targetPath = stream.id === 'btc' ? '/#live-feed' : stream.path;
                return (
                  <Link 
                    key={stream.id}
                    to={targetPath} 
                    onClick={(e) => { 
                      if (stream.id === 'btc' && location.pathname === '/') {
                        e.preventDefault();
                        document.getElementById('live-feed')?.scrollIntoView({ behavior: 'smooth' });
                        window.history.pushState(null, '', '/#live-feed');
                      } else if (isActive) {
                        window.scrollTo({ top: 0, behavior: 'smooth' }); 
                      }
                    }}
                    className={`hover:text-emerald-400 transition-colors ${isActive ? 'text-emerald-400' : ''}`}
                  >
                    {stream.name}
                  </Link>
                );
              })}

              {moreStreams.length > 0 && (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
                  >
                    More Currencies <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full mt-4 right-0 w-48 bg-[#0f0f16] border border-white/10 rounded-xl shadow-xl py-2 z-50 flex flex-col">
                      {moreStreams.map((stream) => {
                        const isActive = location.pathname === stream.path;
                        return (
                          <Link 
                            key={stream.id}
                            to={stream.path} 
                            onClick={() => {
                              setIsDropdownOpen(false);
                              if (isActive) window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`px-4 py-2 hover:bg-white/5 transition-colors ${isActive ? 'text-emerald-400 bg-white/5' : 'text-slate-300'}`}
                          >
                            {stream.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/history" className={`flex items-center gap-1 hover:text-emerald-400 transition-colors ${location.pathname === '/history' ? 'text-emerald-400' : ''}`}>
              <History className="w-4 h-4" /> History
            </Link>

            <Link to="/vs" className={`flex items-center gap-1 hover:text-orange-400 transition-colors ${location.pathname === '/vs' ? 'text-orange-400' : ''}`}>
              <Swords className="w-4 h-4" /> Coin vs Coin
            </Link>

            <Link to="/toon" className={`flex items-center gap-1 hover:text-purple-400 transition-colors ${location.pathname === '/toon' ? 'text-purple-400' : ''}`}>
              <ImageIcon className="w-4 h-4" /> Toon of the Day
            </Link>

            <Link to="/leaderboard" className={`flex items-center gap-1 hover:text-yellow-400 transition-colors ${location.pathname === '/leaderboard' ? 'text-yellow-400' : ''}`}>
              <Trophy className="w-4 h-4" /> Leaderboard
            </Link>

            <Link to="/serious" className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-semibold transition-all border ${location.pathname === '/serious' ? 'bg-blue-500 text-white border-blue-400 shadow-[0_0_16px_rgba(59,130,246,0.4)]' : 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20 hover:shadow-[0_0_12px_rgba(59,130,246,0.25)]'}`}>
              <Crosshair className="w-4 h-4" /> Serious Mode
            </Link>

            <a href="/#features" className="hover:text-emerald-400 transition-colors">Features</a>
          </div>
        </div>
      </nav>
      )}

      <Routes>
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/vs" element={<CoinVsCoinPage />} />
        <Route path="/toon" element={<ToonPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/serious" element={<SeriousModePage />} />
        {SUPPORTED_STREAMS.map((stream) => (
          <React.Fragment key={stream.id}>
            <Route 
              path={stream.path} 
              element={<StreamPage coin={stream.symbol} isHome={stream.path === '/'} />} 
            />
          </React.Fragment>
        ))}
      </Routes>

      {/* Footer */}
      {!isEmbed && (
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-lg text-white">
            <Swords className="w-5 h-5 text-emerald-400" />
            <span>BTC<span className="text-emerald-400">TOON</span></span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} www.btctoon.com. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="https://facebook.com/btc.toon" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}


