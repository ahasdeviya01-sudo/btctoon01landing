import React, { useEffect, useRef } from 'react';
import { PriceFeed, initPriceFeed, initReplayFeed, cleanupPriceFeed, COIN_CONFIGS } from '../lib/price-feed';
import { initAudio, playSound } from '../lib/audio';
import {
  W, H, MARGIN, CHART_TOP, CHART_BOT, PANEL_L_X, PANEL_L_W, PRICE_X, HISTORY_LEN, FALLBACK_PRICE,
  rand, clamp, lerp, PANEL_Y, PANEL_H, CHART_H
} from '../lib/constants';
import { Animal, AirAttacker, Jet, Missile, FloatingText, Particle, Dust } from '../lib/types';
import { drawUnknownZone, drawChart, drawPriceDot, drawBattlePowerBars } from '../lib/draw-chart';
import { drawLeftHUD, drawSidebar } from '../lib/draw-hud';
import { drawBull, drawBear, drawAirUnit, drawJet } from '../lib/draw-entities';

export default function Battleground({ coin = 'BTC', isReplay = false, scenario = '', isProMode = false }: { key?: React.Key, coin?: string, isReplay?: boolean, scenario?: string, isProMode?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isReplay && scenario) {
      initReplayFeed(scenario);
    } else {
      initPriceFeed(coin);
    }
    
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let displayPrice = FALLBACK_PRICE;
    let priceHistory = new Array(HISTORY_LEN).fill(FALLBACK_PRICE);
    let volumeHistory = new Array(HISTORY_LEN).fill(10);
    PriceFeed.seedHistory(priceHistory, volumeHistory);
    displayPrice = PriceFeed.price;

    let t = 0, frameCount = 0, lastEventFrame = -200;
    let lastChartUpdate = 0;
    let dayPnL = 0, dayPnLPct = 0;
    let momentum = 0;
    let bullPower = 0.5, bearPower = 0.5;

    let particles: Particle[] = [], groundDust: Dust[] = [], airAttackers: AirAttacker[] = [];
    let bulls: Animal[] = [], bears: Animal[] = [];
    let jets: Jet[] = [], missiles: Missile[] = []; 
    let floatingTexts: FloatingText[] = [];
    let camShake = {x: 0, y: 0};
    let flashColor: string | null = null, flashAlpha = 0;
    let eventText = '', eventAlpha = 0;
    let noiseOff = 0;

    function shake(n: number) { camShake.x = rand(-n, n); camShake.y = rand(-n, n); }

    function priceToY(price: number) {
      const slice = priceHistory.slice(-HISTORY_LEN);
      const mn = Math.min(...slice) * 0.9997;
      const mx = Math.max(...slice) * 1.0003;
      return CHART_TOP + CHART_H - ((price - mn) / (mx - mn)) * CHART_H;
    }
    function currentLineY() { return priceToY(priceHistory[priceHistory.length - 1]); }

    function spawnJet(type: 'bull' | 'bear') {
      if (isProMode) return;
      const isBull = type === 'bull';
      jets.push({
        type, x: isBull ? PANEL_L_X - 100 : PANEL_L_X + PANEL_L_W + 100,
        y: rand(CHART_TOP + 30, CHART_BOT - 30),
        vx: isBull ? rand(14, 18) : rand(-18, -14),
        vy: 0, life: 1, hasFired: false,
        fireX: rand(PANEL_L_X + PANEL_L_W * 0.3, PANEL_L_X + PANEL_L_W * 0.7) 
      });
    }

    function spawnMissile(x: number, y: number, type: 'bull' | 'bear') {
      if (isProMode) return;
      playSound('missile', 0.5);
      const isBull = type === 'bull';
      let target;
      let enemies = isBull ? bears : bulls;
      let tx, ty;
      if (enemies.length > 0) {
        target = enemies[Math.floor(Math.random() * enemies.length)];
        tx = target.x; ty = target.y;
      } else {
        const lineY = currentLineY();
        tx = rand(PANEL_L_X + 40, PRICE_X - 40);
        ty = isBull ? rand(CHART_TOP, lineY - 20) : rand(lineY + 20, CHART_BOT);
      }
      missiles.push({ type, x, y, targetX: tx, targetY: ty, life: 1, speed: rand(7, 11), vx: 0, vy: 0 });
    }

    function spawnBull(angry = false) {
      if (isProMode) return;
      const lineY = currentLineY();
      const gap = CHART_BOT - lineY;                 
      bulls.push({
        x: rand(PANEL_L_X + 40, PRICE_X - 40), y: lineY + rand(gap * 0.08, gap * 0.75),          
        vx: rand(0.2, 0.8) * (angry ? 2 : 1), vy: 0, life: 1, angry, size: rand(0.78, 1.15),
        wobble: rand(0, Math.PI * 2), wanderX: rand(0, Math.PI * 2), wanderY: rand(0, Math.PI * 2),
        wanderSpeedX: rand(0.008, 0.018), wanderSpeedY: rand(0.006, 0.014),
        wanderAmtX: rand(20, 60), wanderAmtY: rand(8, 22), baseX: rand(PANEL_L_X + 40, PRICE_X - 40),               
      });
    }

    function spawnBear(angry = false) {
      if (isProMode) return;
      const lineY = currentLineY();
      const gap = lineY - CHART_TOP;                  
      bears.push({
        x: rand(PANEL_L_X + 40, PRICE_X - 40), y: lineY - rand(gap * 0.08, gap * 0.75),
        vx: rand(-0.8, -0.2) * (angry ? 2 : 1), vy: 0, life: 1, angry, size: rand(0.78, 1.15),
        wobble: rand(0, Math.PI * 2), wanderX: rand(0, Math.PI * 2), wanderY: rand(0, Math.PI * 2),
        wanderSpeedX: rand(0.008, 0.018), wanderSpeedY: rand(0.006, 0.014),
        wanderAmtX: rand(20, 60), wanderAmtY: rand(8, 22), baseX: rand(PANEL_L_X + 40, PRICE_X - 40),
      });
    }

    function spawnAirAttack(type: 'bull' | 'bear') {
      if (isProMode) return;
      const n = Math.ceil(rand(2, 4));
      for (let i = 0; i < n; i++) {
        const lineY = currentLineY();
        airAttackers.push({
          type,
          x: type === 'bear' ? rand(PANEL_L_X + PANEL_L_W * 0.3, PANEL_L_X + PANEL_L_W * 0.75) : rand(PANEL_L_X + PANEL_L_W * 0.1, PANEL_L_X + PANEL_L_W * 0.45),
          y: type === 'bear' ? rand(CHART_TOP, lineY - 60) : rand(lineY + 60, CHART_BOT - 40),
          targetX: PRICE_X + rand(-25, 25), targetY: lineY + rand(-20, 20),
          angle: type === 'bear' ? Math.PI * 0.5 : -Math.PI * 0.5, life: 1, speed: rand(4, 7), vx: 0, vy: 0
        });
      }
    }

    function spawnDust(x: number, y: number, dir: number) {
      if (isProMode) return;
      for (let i = 0; i < 3; i++) groundDust.push({ x, y, vx: rand(-0.8, 0.8) + dir * rand(0, 1.5), vy: rand(-1.2, -0.3), life: 1, size: rand(4, 12) });
    }

    function spawnExplosion(x: number, y: number, col: string) {
      if (isProMode) return;
      playSound('explosion');
      for (let i = 0; i < 15; i++) {
        const a = rand(0, Math.PI * 2), s = rand(3, 8);
        particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, color: (Math.random() > 0.5 ? '#fff' : col), size: rand(1.5, 3.5), isSpark: true });
      }
      for (let i = 0; i < 8; i++) {
        const a = rand(0, Math.PI * 2), s = rand(0.5, 2.5);
        particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, color: (Math.random() > 0.5 ? 'rgba(20,20,20,0.8)' : 'rgba(50,50,50,0.6)'), size: rand(6, 12), isSpark: false });
      }
      shake(10);
    }

    function spawnFloatingOrder(type: 'bull' | 'bear') {
      if (isProMode) return;
      const lineY = currentLineY();
      const isBuy = type === 'bull';
      const config = COIN_CONFIGS[coin] || COIN_CONFIGS['BTC'];
      const amount = (Math.random() * config.maxOrderSize + 0.1).toFixed(2);
      floatingTexts.push({
        x: rand(PANEL_L_X + 40, PRICE_X - 40), y: isBuy ? rand(lineY + 30, CHART_BOT - 30) : rand(CHART_TOP + 30, lineY - 30),
        text: (isBuy ? 'BUY ' : 'SELL ') + amount + ' ' + coin,
        color: isBuy ? '#22c55e' : '#ff4444', life: 1, vy: isBuy ? -0.4 : 0.4, vx: 0
      });
    }

    if (!isProMode) {
      for (let i = 0; i < 4; i++) { spawnBull(); spawnBear(); }
    }

    function drawEventText() {
      if (eventAlpha <= 0 || !ctx) return;
      ctx.save();
      const alpha = Math.min(eventAlpha, 1);
      ctx.globalAlpha = alpha;

      const tx = PANEL_L_X + 18 + camShake.x;
      const ty = CHART_TOP + 46 + camShake.y;

      const isBullEvent = eventText.includes('BULL') || eventText.includes('BUY');
      const col = isBullEvent ? '#4488ff' : '#ff4444';

      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = col;
      ctx.textAlign = 'left';
      ctx.shadowColor = col;
      ctx.shadowBlur = 8;
      ctx.fillText(eventText, tx, ty);
      ctx.shadowBlur = 0;
      ctx.restore();
      eventAlpha -= 0.015;
    }

    let animationFrameId: number;
    let mousePos = { x: 0, y: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = cv.getBoundingClientRect();
      mousePos.x = (e.clientX - rect.left) * (cv.width / rect.width);
      mousePos.y = (e.clientY - rect.top) * (cv.height / rect.height);
    };
    cv.addEventListener('mousemove', handleMouseMove);

    function tick() {
      if (!ctx) return;
      t++; frameCount++;
      camShake.x *= 0.8; camShake.y *= 0.8;

      const _now = Date.now();
      const pfIsLive = PriceFeed.isLive;
      const pfHasNewData = PriceFeed.hasNewData;
      
      const _liveReady = pfIsLive && pfHasNewData && (_now - lastChartUpdate >= 150);
      const _simReady  = !pfIsLive && frameCount % 18 === 0;

      if (_liveReady || _simReady) {
        if (_liveReady) PriceFeed.hasNewData = false;
        lastChartUpdate = _now;
        PriceFeed.tick();
        
        const livePrice      = PriceFeed.price || FALLBACK_PRICE;
        const prevChartPrice = priceHistory[priceHistory.length - 1] || livePrice;
        const chgDelta       = livePrice - prevChartPrice;

        priceHistory.push(livePrice);
        if (priceHistory.length > HISTORY_LEN * 2) priceHistory.shift();

        const volAmt = (Math.abs(chgDelta) / livePrice) * 100000 * rand(0.5, 2.0);
        volumeHistory.push(Math.max(volAmt, 0.1));
        if (volumeHistory.length > HISTORY_LEN * 2) volumeHistory.shift();

        dayPnL    = livePrice - (PriceFeed.dayOpen || FALLBACK_PRICE);
        dayPnLPct = (dayPnL / (PriceFeed.dayOpen || FALLBACK_PRICE)) * 100;

        const vel = chgDelta / livePrice;
        momentum  = clamp(momentum + vel * 180, -1, 1) * 0.98;
        bullPower = clamp(0.5 + momentum * 0.4 + rand(-0.02, 0.02), 0.1, 0.95);
        bearPower = clamp(0.5 - momentum * 0.4 + rand(-0.02, 0.02), 0.1, 0.95);

        const dr = vel;
        const absDr = Math.abs(dr);
        const sinceEv = frameCount - lastEventFrame;
        
        if (absDr > 0.00065 && sinceEv > 90) {
          const type = dr > 0 ? 'bull' : 'bear';
          eventText = type === 'bull' ? '>> MASSIVE BUY WALL -- JETS INBOUND' : '>> PANIC DUMP -- AIRSTRIKE DEPLOYED';
          eventAlpha = 2.5; lastEventFrame = frameCount;
          shake(15); flashColor = type === 'bull' ? 'rgba(0,100,220,0.3)' : 'rgba(180,0,0,0.3)'; flashAlpha = 1;
          
          if (!isProMode) {
            playSound(type === 'bull' ? 'bull_charge' : 'bear_dump');
            for (let i = 0; i < rand(1, 3); i++) spawnJet(type);
            for (let i = 0; i < 3; i++) type === 'bull' ? spawnBull(true) : spawnBear(true);
          } else {
            // Pro mode effects - just a flash and text
            eventText = type === 'bull' ? '>> LIQUIDITY SURGE: BUY SIDE' : '>> LIQUIDITY SURGE: SELL SIDE';
          }
          
        } else if (absDr > 0.00035 && sinceEv > 90) {
          const type = dr > 0 ? 'bull' : 'bear';
          if (!isProMode) {
            spawnAirAttack(type);
            eventText = type === 'bull' ? '>> BULL CHARGE -- Buy pressure surge' : '>> BEAR ASSAULT -- Sell pressure spike';
            eventAlpha = 2.2; lastEventFrame = frameCount;
            for (let i = 0; i < 2; i++) type === 'bull' ? spawnBull(true) : spawnBear(true);
            shake(9); flashColor = type === 'bull' ? 'rgba(0,100,220,0.15)' : 'rgba(180,0,0,0.15)'; flashAlpha = 1;
            playSound(type === 'bull' ? 'bull_charge' : 'bear_dump');
          } else {
            eventText = type === 'bull' ? '>> MOMENTUM SHIFT: POSITIVE' : '>> MOMENTUM SHIFT: NEGATIVE';
            eventAlpha = 1.5; lastEventFrame = frameCount;
            shake(5);
          }
        }
        
        if (!isProMode) {
          if (frameCount % 90 === 0 && bulls.length < 6) { spawnBull(); }
          if (frameCount % 90 === 0 && bears.length < 6) { spawnBear(); }
        } else {
          // Pro mode: spawn "Whales" (abstract circles)
          if (frameCount % 60 === 0 && bulls.length < 12) { spawnBull(); }
          if (frameCount % 60 === 0 && bears.length < 12) { spawnBear(); }
        }
      }

      if (Math.random() < 0.08) {
          spawnFloatingOrder(Math.random() > 0.5 ? 'bull' : 'bear');
      }

      const lineY = currentLineY();

      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.fillStyle = '#050508'; 
      ctx.beginPath(); ctx.roundRect(PANEL_L_X, PANEL_Y, PANEL_L_W, PANEL_H, 12); ctx.fill();
      ctx.beginPath(); ctx.roundRect(PANEL_L_X, PANEL_Y, PANEL_L_W, PANEL_H, 12); ctx.clip();

      ctx.save(); ctx.globalAlpha = 0.025; ctx.strokeStyle = '#aaa'; ctx.lineWidth = 0.5;
      for (let x = PANEL_L_X; x < PANEL_L_X + PANEL_L_W; x += 40) { ctx.beginPath(); ctx.moveTo(x, CHART_TOP); ctx.lineTo(x, CHART_BOT); ctx.stroke(); }
      for (let y = CHART_TOP; y < CHART_BOT; y += 40) { ctx.beginPath(); ctx.moveTo(PANEL_L_X, y); ctx.lineTo(PANEL_L_X + PANEL_L_W, y); ctx.stroke(); }
      ctx.restore();

      if (!isProMode) {
        drawChart(ctx, lineY, priceHistory, volumeHistory, priceToY, isProMode);
        drawUnknownZone(ctx, lineY, noiseOff);
        noiseOff += 0.003;
        drawBattlePowerBars(ctx, lineY, bearPower, bullPower);
        drawPriceDot(ctx, lineY, t, priceHistory);
      } else {
        drawChart(ctx, lineY, priceHistory, volumeHistory, priceToY, isProMode, mousePos);
        // In Serious Mode, we don't draw the price dot as a separate animated entity
      }

      const lineY2 = lineY; 

      if (!isProMode) {
        bears = bears.filter(b => b.life > 0);
        bears.forEach(b => {
          b.wanderX += b.wanderSpeedX; b.wanderY += b.wanderSpeedY;
          b.x += Math.sin(b.wanderX) * 0.6 + (b.angry ? -1.0 : -0.2); b.y += Math.sin(b.wanderY) * 0.4;
          const minY = CHART_TOP + 12, maxY = lineY2 - 16;        
          b.x = clamp(b.x, PANEL_L_X + 12, PRICE_X - 30); b.y = clamp(b.y, minY, maxY);
          if (b.x < PANEL_L_X + 18) b.life -= 0.015;
          if (b.angry) b.life -= 0.0015;
          if (b.angry && Math.random() < 0.035) spawnDust(b.x + 10, b.y + b.size * 18, 1);
          
          drawBear(ctx, b, t, camShake);
        });

        bulls = bulls.filter(b => b.life > 0);
        bulls.forEach(b => {
          b.wanderX += b.wanderSpeedX; b.wanderY += b.wanderSpeedY;
          b.x += Math.sin(b.wanderX) * 0.6 + (b.angry ? 1.0 : 0.2); b.y += Math.sin(b.wanderY) * 0.4;
          const minY2 = lineY2 + 16, maxY2 = CHART_BOT - 12;
          b.x = clamp(b.x, PANEL_L_X + 12, PRICE_X - 30); b.y = clamp(b.y, minY2, maxY2);
          if (b.x > PRICE_X - 18) b.life -= 0.015;
          if (b.angry) b.life -= 0.0015;
          if (b.angry && Math.random() < 0.035) spawnDust(b.x - 10, b.y - b.size * 18, -1);
          
          drawBull(ctx, b, t, camShake);
        });
      }

      if (!isProMode) {
        airAttackers = airAttackers.filter(a => a.life > 0);
        airAttackers.forEach(a => {
          ctx.save(); ctx.globalAlpha = a.life * 0.35;
          ctx.strokeStyle = a.type === 'bear' ? '#ff4400' : '#4488ff'; ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
          ctx.beginPath(); ctx.moveTo(a.x + camShake.x, a.y + camShake.y); ctx.lineTo(a.targetX + camShake.x, a.targetY + camShake.y); ctx.stroke();
          ctx.restore();

          const dx = a.targetX - a.x, dy = a.targetY - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 18) {
            spawnExplosion(a.x, a.y, a.type === 'bear' ? '#ff4400' : '#4488ff');
            a.life = 0;
          } else {
            a.x += (dx / dist) * a.speed; a.y += (dy / dist) * a.speed;
            a.angle = Math.atan2(dy, dx);
            if (Math.random() < 0.35)
              particles.push({ x: a.x, y: a.y, vx: rand(-0.4, 0.4), vy: rand(-0.4, 0.4), life: 0.55, color: a.type === 'bear' ? '#ff4400' : '#4488ff', size: rand(2, 4.5), isSpark: false });
          }
          drawAirUnit(ctx, a, camShake);
        });

        jets = jets.filter(j => j.life > 0);
        jets.forEach(j => {
            j.x += j.vx; j.y += j.vy;
            if (!j.hasFired) {
                if ((j.vx > 0 && j.x > j.fireX) || (j.vx < 0 && j.x < j.fireX)) {
                    spawnMissile(j.x, j.y, j.type); j.hasFired = true;
                }
            }
            if (j.x < PANEL_L_X - 150 || j.x > PANEL_L_X + PANEL_L_W + 150) { j.life = 0; }
            drawJet(ctx, j, camShake);
        });

        missiles = missiles.filter(m => m.life > 0);
        missiles.forEach(m => {
            const dx = m.targetX - m.x; const dy = m.targetY - m.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 15) {
                spawnExplosion(m.x, m.y, m.type === 'bear' ? '#ff4400' : '#4488ff');
                m.life = 0;
            } else {
                m.x += (dx / dist) * m.speed; m.y += (dy / dist) * m.speed;
                if (Math.random() < 0.7) {
                    particles.push({ x: m.x, y: m.y, vx: rand(-0.5, 0.5), vy: rand(-0.5, 0.5), life: 0.8, color: '#ffaa00', size: rand(1.5, 3), isSpark: false });
                }
            }
            ctx.save(); ctx.translate(m.x + camShake.x, m.y + camShake.y); ctx.rotate(Math.atan2(dy, dx));
            ctx.fillStyle = '#ddd'; ctx.fillRect(-8, -2, 16, 4); 
            ctx.fillStyle = m.type === 'bear' ? '#ff2200' : '#00aaff'; ctx.beginPath(); ctx.arc(8, 0, 2, 0, Math.PI * 2); ctx.fill(); 
            ctx.restore();
        });
      }

      floatingTexts = floatingTexts.filter(ft => ft.life > 0);
      floatingTexts.forEach(ft => {
          ft.y += ft.vy; ft.life -= 0.012; 
          ctx.save(); ctx.globalAlpha = Math.max(0, ft.life); ctx.font = 'bold 11px monospace'; ctx.fillStyle = ft.color;
          ctx.textAlign = 'center'; ctx.shadowColor = ft.color; ctx.shadowBlur = 4;
          ctx.fillText(ft.text, ft.x + camShake.x, ft.y + camShake.y);
          ctx.restore();
      });

      particles = particles.filter(p => p.life > 0);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; 
        if (p.isSpark) { p.vy += 0.15; p.life -= 0.025; } else { p.size += 0.15; p.life -= 0.015; }
        ctx.save(); ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x + camShake.x, p.y + camShake.y, p.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      groundDust = groundDust.filter(d => d.life > 0);
      groundDust.forEach(d => {
        d.x += d.vx; d.y += d.vy; d.vy += 0.04; d.life -= 0.035; d.size += 0.25;
        ctx.save(); ctx.globalAlpha = Math.max(0, d.life * 0.28); ctx.fillStyle = 'rgba(200,150,80,1)';
        ctx.beginPath(); ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      if (flashAlpha > 0 && flashColor) {
        ctx.save(); ctx.globalAlpha = flashAlpha; ctx.fillStyle = flashColor; ctx.fillRect(PANEL_L_X, PANEL_Y, PANEL_L_W, PANEL_H);
        flashAlpha -= 0.04; ctx.restore();
      }

      if (!isProMode) {
        drawEventText();
        drawLeftHUD(ctx, t, momentum);
        ctx.restore(); 

        ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(PANEL_L_X, PANEL_Y, PANEL_L_W, PANEL_H, 12); ctx.stroke();
        
        displayPrice = lerp(displayPrice, priceHistory[priceHistory.length - 1], 0.15);
        drawSidebar(ctx, t, displayPrice, dayPnLPct, dayPnL, bullPower, bearPower, momentum, priceHistory, volumeHistory);

        ctx.save(); ctx.globalAlpha = 0.015;
        for (let i = 0; i < 400; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000'; ctx.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5);
        }
        ctx.restore();
      } else {
        ctx.restore();
        // In Serious Mode, we just draw the chart and price dot which are already handled above
      }

      ctx.save();
      const barY = H - 14;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, H - 20, W, 20);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.beginPath(); ctx.moveTo(0, H - 20); ctx.lineTo(W, H - 20); ctx.stroke();

      ctx.globalAlpha = 0.5;
      ctx.font = '9px monospace';
      ctx.textAlign = 'left';
      const pfSt = PriceFeed.status === 'SIMULATING' ? 'SYNCING...' : (PriceFeed.status || 'SYNCING...');
      const pfSrc = PriceFeed.source || '';
      ctx.fillStyle = pfSt === 'LIVE' ? '#00aa66' : '#776633';
      ctx.fillText('● ' + pfSt + (pfSrc ? ' [' + pfSrc + ']' : ''), MARGIN + 4, barY);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#666';
      ctx.fillText(`${coin}/USDT LIVE ORDER FLOW  ·  www.btctoon.com  ·  LIVE 24/7`, W / 2, barY);
      ctx.textAlign = 'right';
      const nowBar = new Date();
      const barPad = (n: number) => String(n).padStart(2, '0');
      ctx.fillStyle = '#555';
      ctx.fillText(barPad(nowBar.getUTCHours()) + ':' + barPad(nowBar.getUTCMinutes()) + ':' + barPad(nowBar.getUTCSeconds()) + ' UTC', W - MARGIN - 4, barY);
      ctx.restore();

      animationFrameId = requestAnimationFrame(tick);
    }

    tick();

    function drawProEntity(ctx: CanvasRenderingContext2D, b: Animal, type: 'bull' | 'bear', t: number) {
      // In Serious Mode, we render these as subtle "Order Blocks" or "Liquidity Zones"
      // that don't float around like characters, but rather stay near the price action
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, b.life)) * 0.4;
      
      const col = type === 'bull' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 68, 68, 0.1)';
      const borderCol = type === 'bull' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)';
      
      // Draw as a horizontal bar representing an order block
      const barW = 40 + b.size * 20;
      const barH = 2;
      
      ctx.fillStyle = col;
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.rect(b.x - barW / 2, b.y - barH / 2, barW, barH);
      ctx.fill();
      ctx.stroke();
      
      ctx.restore();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      cleanupPriceFeed();
    };
  }, [coin]);

  return (
    <div className="w-full flex flex-col items-center justify-center relative group cursor-pointer" onClick={initAudio}>
      <div className="relative w-full max-w-[1280px] rounded-xl bg-[#030305] shadow-[0_0_80px_rgba(255,80,80,0.08),0_0_80px_rgba(80,180,255,0.08),0_40px_100px_rgba(0,0,0,0.95)] overflow-hidden ring-1 ring-white/10">
        <canvas ref={canvasRef} width={W} height={H} className="w-full h-auto block" />
        <div className="absolute top-4 right-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="bg-black/60 text-white/80 px-3 py-1.5 rounded-full text-xs backdrop-blur-sm border border-white/10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Click to enable audio
          </div>
        </div>
      </div>
    </div>
  );
}
