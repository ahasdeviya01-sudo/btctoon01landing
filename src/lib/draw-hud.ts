import {
  PANEL_L_X, PANEL_L_W, PANEL_Y, HUD_H, PANEL_R_X, PANEL_R_W, PANEL_H, FALLBACK_PRICE
} from './constants';
import { PriceFeed } from './price-feed';
import { rand } from './constants';

export function drawLeftHUD(ctx: CanvasRenderingContext2D, t: number, momentum: number) {
  ctx.save();
  // HUD background with subtle gradient
  const hudGrad = ctx.createLinearGradient(PANEL_L_X, PANEL_Y, PANEL_L_X, PANEL_Y + HUD_H);
  hudGrad.addColorStop(0, 'rgba(12,12,18,0.98)');
  hudGrad.addColorStop(1, 'rgba(8,8,12,0.95)');
  ctx.fillStyle = hudGrad;
  ctx.beginPath(); ctx.roundRect(PANEL_L_X, PANEL_Y, PANEL_L_W, HUD_H, [12, 12, 0, 0]); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PANEL_L_X, PANEL_Y + HUD_H); ctx.lineTo(PANEL_L_X + PANEL_L_W, PANEL_Y + HUD_H); ctx.stroke();
  
  // 1. The Main Title
  ctx.font = '32px "VT323", monospace';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.fillText(`${PriceFeed.coin}/USDT BATTLEGROUND`, PANEL_L_X + 20, PANEL_Y + 38);

  // 2. Animated btctoon.com ™ watermark — drifts randomly across the canvas
  ctx.save();
  ctx.font = '22px "VT323", monospace';
  const pulse = (Math.sin(t * 0.06) + 1) / 2;
  // Smooth pseudo-random drift using incommensurate sin/cos frequencies
  const wmX = 120 + (Math.sin(t * 0.007) * 0.4 + 0.5) * 900
            + Math.sin(t * 0.013 + 1.7) * 60;
  const wmY = 100 + (Math.cos(t * 0.005) * 0.4 + 0.5) * 480
            + Math.cos(t * 0.011 + 2.3) * 40;
  ctx.fillStyle = `rgba(0, 255, 136, ${0.35 + pulse * 0.35})`;
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 4 + pulse * 10;
  ctx.textAlign = 'center';
  ctx.fillText('btctoon.com \u2122', wmX, wmY);
  ctx.restore();

  // 3. Status Indicators
  const pfStatus = PriceFeed.status || 'SIMULATING';
  const pfSource = PriceFeed.source || '';
  const pulseDot = (Math.sin(t * 0.1) + 1) / 2;
  const _sCols: Record<string, number[]> = { LIVE: [0, 255, 136], CONNECTING: [255, 170, 0], RECONNECTING: [255, 170, 0], SIMULATING: [255, 80, 80] };
  const [_sr, _sg, _sb] = _sCols[pfStatus] || [136, 136, 136];
  ctx.fillStyle = `rgba(${_sr},${_sg},${_sb},${(0.4 + pulseDot * 0.6).toFixed(2)})`;
  ctx.beginPath(); ctx.arc(PANEL_L_X + 25, PANEL_Y + 50, 3, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  const _sLabels: Record<string, string> = { LIVE: 'LIVE DATA', CONNECTING: 'CONNECTING...', RECONNECTING: 'RECONNECTING...', SIMULATING: 'SIMULATION MODE' };
  const statusLabel = (_sLabels[pfStatus] || pfStatus) + (pfSource && pfStatus === 'LIVE' ? ' [' + pfSource + ']' : '');
  ctx.font = '11px monospace'; ctx.fillStyle = pfStatus === 'LIVE' ? '#00aa66' : '#888'; ctx.letterSpacing = '2px';
  ctx.fillText(statusLabel, PANEL_L_X + 35, PANEL_Y + 54);

  // 4. Live clock
  ctx.save();
  const now = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const timeStr = pad2(now.getUTCHours()) + ':' + pad2(now.getUTCMinutes()) + ':' + pad2(now.getUTCSeconds()) + ' UTC';
  ctx.font = '11px monospace';
  ctx.fillStyle = '#555';
  ctx.textAlign = 'right';
  ctx.fillText(timeStr, PANEL_L_X + PANEL_L_W - 140, PANEL_Y + 54);
  ctx.restore();

  // 5. Momentum Text
  ctx.textAlign = 'right';
  ctx.font = 'bold 14px monospace';
  if (momentum > 0.15) {
    ctx.fillStyle = '#4488ff'; ctx.fillText('▲ BULLS PUSHING', PANEL_L_X + PANEL_L_W - 20, PANEL_Y + 38);
  } else if (momentum < -0.15) {
    ctx.fillStyle = '#ff4444'; ctx.fillText('▼ BEARS PUSHING', PANEL_L_X + PANEL_L_W - 20, PANEL_Y + 38);
  } else {
    ctx.fillStyle = '#888'; ctx.fillText('NEUTRAL', PANEL_L_X + PANEL_L_W - 20, PANEL_Y + 38);
  }
  ctx.restore();
}

export function drawSidebar(
  ctx: CanvasRenderingContext2D, 
  t: number, 
  displayPrice: number, 
  dayPnLPct: number, 
  dayPnL: number, 
  bullPower: number, 
  bearPower: number, 
  momentum: number, 
  priceHistory: number[], 
  volumeHistory: number[]
) {
  ctx.save();
  // ─── Background ───
  const sbGrad = ctx.createLinearGradient(PANEL_R_X, PANEL_Y, PANEL_R_X, PANEL_Y + PANEL_H);
  sbGrad.addColorStop(0, '#0c0d14'); sbGrad.addColorStop(0.5, '#0a0b11'); sbGrad.addColorStop(1, '#08090e');
  ctx.fillStyle = sbGrad;
  ctx.beginPath(); ctx.roundRect(PANEL_R_X, PANEL_Y, PANEL_R_W, PANEL_H, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; ctx.stroke();

  const pad = 24, lx = PANEL_R_X + pad, rx = PANEL_R_X + PANEL_R_W - pad, barW = PANEL_R_W - pad * 2;
  let Y = PANEL_Y + 22;
  const isUp = dayPnLPct >= 0;
  const pnlCol = isUp ? '#22c55e' : '#ff4444';
  const formattedPrice = '$' + displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sep = () => { ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.beginPath(); ctx.moveTo(lx, Y); ctx.lineTo(rx, Y); ctx.stroke(); };

  // ═══ 1. MARKET PRICE ═══
  ctx.textAlign = 'left'; ctx.fillStyle = '#777'; ctx.font = '11px monospace'; ctx.letterSpacing = '2px';
  ctx.fillText('MARKET PRICE', lx, Y); ctx.letterSpacing = '0px';
  Y += 38;
  ctx.fillStyle = '#fff'; ctx.font = '52px "VT323", monospace';
  ctx.shadowColor = 'rgba(255,255,255,0.15)'; ctx.shadowBlur = 8;
  ctx.fillText(formattedPrice, lx, Y); ctx.shadowBlur = 0;

  // ═══ 2. PNL ═══
  Y += 28;
  ctx.fillStyle = pnlCol; ctx.font = '26px "VT323", monospace';
  ctx.shadowColor = pnlCol; ctx.shadowBlur = 4;
  ctx.fillText((isUp ? '+' : '') + dayPnLPct.toFixed(2) + '%  ' + (isUp ? '+$' : '-$') + Math.abs(dayPnL).toFixed(2), lx, Y);
  ctx.shadowBlur = 0;

  // ═══ 3. 24H STATS ═══
  Y += 20; sep(); Y += 16;
  ctx.fillStyle = '#555'; ctx.font = '10px monospace';
  ctx.fillText('24H HIGH', lx, Y); ctx.fillText('24H LOW', lx + 140, Y); ctx.fillText(`VOL(${PriceFeed.coin})`, lx + 280, Y);
  Y += 16;
  ctx.fillStyle = '#ddd'; ctx.font = 'bold 13px monospace';
  ctx.fillText('$' + Math.floor(PriceFeed.dayHigh || FALLBACK_PRICE + 200).toLocaleString(), lx, Y);
  ctx.fillText('$' + Math.floor(PriceFeed.dayLow || FALLBACK_PRICE - 200).toLocaleString(), lx + 140, Y);
  const volDisplay = (PriceFeed.isLive && PriceFeed.volume > 0)
    ? Math.round(PriceFeed.volume).toLocaleString('en-US')
    : (volumeHistory.reduce((a, b) => a + b, 0) * 1.5).toLocaleString('en-US', { maximumFractionDigits: 0 });
  ctx.fillText(volDisplay, lx + 280, Y);

  // ═══ 4. FEAR & GREED GAUGE ═══
  Y += 18; sep(); Y += 16;
  ctx.fillStyle = '#777'; ctx.font = '11px monospace'; ctx.letterSpacing = '2px';
  ctx.fillText('FEAR & GREED INDEX', lx, Y); ctx.letterSpacing = '0px';
  Y += 12;

  const bullRatio = bullPower / Math.max(bullPower + bearPower, 1);
  const fgRaw = 50 + momentum * 35 + (bullRatio - 0.5) * 30;
  const fgVal = Math.max(0, Math.min(100, fgRaw));

  const gCx = PANEL_R_X + PANEL_R_W / 2, gCy = Y + 42, gR = 38;
  const startAngle = Math.PI, endAngle = Math.PI * 2;

  const segColors = ['#ff2244', '#ff6622', '#ffaa00', '#88cc22', '#00cc66'];
  for (let i = 0; i < 5; i++) {
    const a0 = startAngle + (endAngle - startAngle) * (i / 5);
    const a1 = startAngle + (endAngle - startAngle) * ((i + 1) / 5);
    ctx.beginPath(); ctx.arc(gCx, gCy, gR, a0, a1);
    ctx.lineWidth = 6; ctx.strokeStyle = segColors[i]; ctx.globalAlpha = 0.3; ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const valAngle = startAngle + (endAngle - startAngle) * (fgVal / 100);
  const arcGrad = ctx.createLinearGradient(gCx - gR, gCy, gCx + gR, gCy);
  arcGrad.addColorStop(0, '#ff2244'); arcGrad.addColorStop(0.25, '#ff6622');
  arcGrad.addColorStop(0.5, '#ffaa00'); arcGrad.addColorStop(0.75, '#88cc22'); arcGrad.addColorStop(1, '#00cc66');
  ctx.beginPath(); ctx.arc(gCx, gCy, gR, startAngle, valAngle);
  ctx.lineWidth = 6; ctx.strokeStyle = arcGrad; ctx.stroke();

  const needleAngle = startAngle + (endAngle - startAngle) * (fgVal / 100);
  const nx = gCx + Math.cos(needleAngle) * (gR - 12);
  const ny = gCy + Math.sin(needleAngle) * (gR - 12);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(gCx, gCy); ctx.lineTo(nx, ny); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(gCx, gCy, 3, 0, Math.PI * 2); ctx.fill();

  const fgLabels = ['EXTREME FEAR', 'FEAR', 'NEUTRAL', 'GREED', 'EXTREME GREED'];
  const fgLabel = fgLabels[Math.min(4, Math.floor(fgVal / 20))];
  const fgLabelCol = segColors[Math.min(4, Math.floor(fgVal / 20))];
  ctx.textAlign = 'center';
  ctx.font = 'bold 20px "VT323", monospace'; ctx.fillStyle = '#fff';
  ctx.fillText(Math.round(fgVal).toString(), gCx, gCy + 6);
  ctx.font = '9px monospace'; ctx.fillStyle = fgLabelCol;
  ctx.fillText(fgLabel, gCx, gCy + 18);
  ctx.textAlign = 'left';
  Y = gCy + 30;

  // ═══ 5. RSI INDICATOR ═══
  sep(); Y += 14;
  let gains = 0, losses = 0;
  const rsiLen = Math.min(14, priceHistory.length - 1);
  for (let i = priceHistory.length - rsiLen; i < priceHistory.length; i++) {
    const d = priceHistory[i] - priceHistory[i - 1];
    if (d > 0) gains += d; else losses -= d;
  }
  const rs = losses === 0 ? 100 : gains / losses;
  const rsiVal = 100 - (100 / (1 + rs));

  ctx.fillStyle = '#777'; ctx.font = '11px monospace'; ctx.letterSpacing = '1px';
  ctx.fillText('RSI (14)', lx, Y);
  ctx.letterSpacing = '0px';
  ctx.textAlign = 'right';
  const rsiColor = rsiVal > 70 ? '#ff4444' : rsiVal < 30 ? '#00cc66' : '#aaa';
  ctx.fillStyle = rsiColor; ctx.font = 'bold 13px monospace';
  ctx.fillText(rsiVal.toFixed(1), rx, Y);
  ctx.textAlign = 'left';

  Y += 10;
  const rbH = 6;
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.beginPath(); ctx.roundRect(lx, Y, barW, rbH, 3); ctx.fill();
  ctx.fillStyle = 'rgba(0,200,100,0.08)';
  ctx.fillRect(lx, Y, barW * 0.3, rbH);
  ctx.fillStyle = 'rgba(255,60,60,0.08)';
  ctx.fillRect(lx + barW * 0.7, Y, barW * 0.3, rbH);
  const rsiX = lx + barW * (rsiVal / 100);
  ctx.fillStyle = rsiColor;
  ctx.shadowColor = rsiColor; ctx.shadowBlur = 4;
  ctx.beginPath(); ctx.arc(rsiX, Y + rbH / 2, 4, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  Y += rbH + 10;
  ctx.font = '8px monospace'; ctx.fillStyle = '#444';
  ctx.fillText('OVERSOLD', lx, Y);
  ctx.textAlign = 'right'; ctx.fillText('OVERBOUGHT', rx, Y);
  ctx.textAlign = 'left';

  // ═══ 6. VOLATILITY METER ═══
  Y += 14;
  const volWindow = priceHistory.slice(-30);
  const volMean = volWindow.reduce((a, b) => a + b, 0) / volWindow.length;
  const volStd = Math.sqrt(volWindow.reduce((a, b) => a + (b - volMean) ** 2, 0) / volWindow.length);
  const volPct = Math.min(100, (volStd / volMean) * 10000);

  ctx.fillStyle = '#777'; ctx.font = '11px monospace'; ctx.letterSpacing = '1px';
  ctx.fillText('VOLATILITY', lx, Y); ctx.letterSpacing = '0px';
  ctx.textAlign = 'right';
  const volCol = volPct > 60 ? '#ff4444' : volPct > 30 ? '#ffaa00' : '#00cc66';
  ctx.fillStyle = volCol; ctx.font = 'bold 13px monospace';
  ctx.fillText(volPct.toFixed(1) + '%', rx, Y);
  ctx.textAlign = 'left';

  Y += 10;
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.beginPath(); ctx.roundRect(lx, Y, barW, rbH, 3); ctx.fill();
  const volFillGrad = ctx.createLinearGradient(lx, 0, lx + barW, 0);
  volFillGrad.addColorStop(0, '#00cc66'); volFillGrad.addColorStop(0.5, '#ffaa00'); volFillGrad.addColorStop(1, '#ff2244');
  ctx.fillStyle = volFillGrad; ctx.globalAlpha = 0.7;
  ctx.beginPath(); ctx.roundRect(lx, Y, barW * (volPct / 100), rbH, 3); ctx.fill();
  ctx.globalAlpha = 1;

  // ═══ 7. TRADE INTENSITY ═══
  Y += rbH + 14;
  const tIntensity = Math.min(100, volumeHistory.slice(-5).reduce((a, b) => a + b, 0) / 5 * 200);
  ctx.fillStyle = '#777'; ctx.font = '11px monospace'; ctx.letterSpacing = '1px';
  ctx.fillText('TRADE INTENSITY', lx, Y); ctx.letterSpacing = '0px';
  ctx.textAlign = 'right';
  const tiCol = tIntensity > 70 ? '#ff6622' : tIntensity > 40 ? '#ffaa00' : '#4488ff';
  ctx.fillStyle = tiCol; ctx.font = 'bold 13px monospace';
  ctx.fillText(Math.round(tIntensity).toString(), rx, Y);
  ctx.textAlign = 'left';

  Y += 10;
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.beginPath(); ctx.roundRect(lx, Y, barW, rbH, 3); ctx.fill();
  const tiPulse = 0.85 + Math.sin(t * 0.08) * 0.15;
  ctx.fillStyle = tiCol; ctx.globalAlpha = tiPulse * 0.8;
  ctx.beginPath(); ctx.roundRect(lx, Y, barW * (tIntensity / 100), rbH, 3); ctx.fill();
  ctx.globalAlpha = 1;

  // ═══ 8. POWER DISTRIBUTION ═══
  Y += rbH + 14; sep(); Y += 14;
  ctx.fillStyle = '#777'; ctx.font = '11px monospace'; ctx.letterSpacing = '2px';
  ctx.fillText('POWER DISTRIBUTION', lx, Y); ctx.letterSpacing = '0px';
  Y += 14;
  const pdH = 10;
  const bullW = barW * bullPower / (bullPower + bearPower);
  ctx.fillStyle = '#ff4444';
  ctx.beginPath(); ctx.roundRect(lx, Y, barW, pdH, 5); ctx.fill();
  ctx.fillStyle = '#4488ff';
  ctx.shadowColor = '#4488ff'; ctx.shadowBlur = 4;
  ctx.beginPath(); ctx.roundRect(lx, Y, bullW, pdH, [5, 0, 0, 5]); ctx.fill();
  ctx.shadowBlur = 0;
  Y += pdH + 12;
  ctx.font = '10px monospace';
  ctx.fillStyle = '#4488ff'; ctx.fillText('BULLS ' + Math.round(bullW / barW * 100) + '%', lx, Y);
  ctx.fillStyle = '#ff4444'; ctx.textAlign = 'right'; ctx.fillText(Math.round((1 - bullW / barW) * 100) + '% BEARS', rx, Y);
  ctx.textAlign = 'left';

  // ═══ 9. ORDER FLOW ═══
  Y += 16; sep(); Y += 14;
  ctx.fillStyle = '#777'; ctx.font = '11px monospace'; ctx.letterSpacing = '2px';
  ctx.fillText('ORDER FLOW', lx, Y); ctx.letterSpacing = '0px';

  const halfW = barW / 2 - 8;
  const ltx = lx, rtx = lx + halfW + 16;
  Y += 14;

  ctx.fillStyle = '#555'; ctx.font = '9px monospace';
  ctx.fillText('PRICE', ltx, Y); ctx.textAlign = 'right'; ctx.fillText('SIZE', ltx + halfW, Y); ctx.textAlign = 'left';
  let tY = Y + 14;
  let tradesToRender = PriceFeed.trades.slice(0, 6);
  tradesToRender.forEach((tr, i) => {
    ctx.globalAlpha = 1 - i * 0.12;
    ctx.fillStyle = tr.type === 'buy' ? '#22c55e' : '#ff4444'; ctx.font = '10px monospace';
    ctx.fillText('$' + tr.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }), ltx, tY);
    ctx.textAlign = 'right'; ctx.fillStyle = '#999';
    ctx.fillText(tr.size, ltx + halfW, tY); ctx.textAlign = 'left';
    tY += 15;
  });
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#555'; ctx.font = '9px monospace';
  ctx.fillText('PRICE', rtx, Y); ctx.textAlign = 'right'; ctx.fillText('SIZE', rtx + halfW, Y); ctx.textAlign = 'left';
  let oY = Y + 14;
  ctx.font = '10px monospace';
  let askP = displayPrice;
  for (let i = 0; i < 3; i++) {
    askP += rand(2, 12);
    ctx.fillStyle = '#ff4444';
    ctx.fillText(askP.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }), rtx, oY);
    ctx.textAlign = 'right'; ctx.fillStyle = '#666';
    ctx.fillText((rand(0.1, 3)).toFixed(3), rtx + halfW, oY); ctx.textAlign = 'left';
    oY += 15;
  }
  ctx.textAlign = 'center'; ctx.fillStyle = isUp ? '#22c55e' : '#ff4444'; ctx.font = 'bold 10px monospace';
  ctx.fillText(formattedPrice, rtx + halfW / 2, oY); oY += 15; ctx.textAlign = 'left';
  ctx.font = '10px monospace';
  let bidP = displayPrice;
  for (let i = 0; i < 3; i++) {
    bidP -= rand(2, 12);
    ctx.fillStyle = '#22c55e';
    ctx.fillText(bidP.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }), rtx, oY);
    ctx.textAlign = 'right'; ctx.fillStyle = '#666';
    ctx.fillText((rand(0.1, 3)).toFixed(3), rtx + halfW / 2 + halfW / 2, oY); ctx.textAlign = 'left';
    oY += 15;
  }

  // ═══ 10. MOMENTUM ═══
  Y = PANEL_Y + PANEL_H - 48;
  sep(); Y += 14;
  ctx.fillStyle = '#555'; ctx.font = '10px monospace'; ctx.letterSpacing = '1px';
  ctx.fillText('MOMENTUM', lx, Y); ctx.letterSpacing = '0px';
  ctx.textAlign = 'right'; ctx.fillStyle = momentum >= 0 ? '#4488ff' : '#ff4444'; ctx.font = 'bold 12px monospace';
  ctx.fillText((momentum >= 0 ? '+' : '') + momentum.toFixed(3), rx, Y); ctx.textAlign = 'left';

  Y += 10;
  const mBarH = 6, mCenterX = lx + barW / 2;
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.beginPath(); ctx.roundRect(lx, Y, barW, mBarH, 3); ctx.fill();
  const mFill = momentum * (barW / 2);
  if (momentum >= 0) { ctx.fillStyle = '#4488ff'; ctx.shadowColor = '#4488ff'; ctx.shadowBlur = 3; ctx.fillRect(mCenterX, Y, mFill, mBarH); }
  else { ctx.fillStyle = '#ff4444'; ctx.shadowColor = '#ff4444'; ctx.shadowBlur = 3; ctx.fillRect(mCenterX + mFill, Y, -mFill, mBarH); }
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(mCenterX, Y - 1); ctx.lineTo(mCenterX, Y + mBarH + 1); ctx.stroke();

  ctx.restore();
}
