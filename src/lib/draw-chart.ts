import {
  CHART_BOT, CHART_H, CHART_TOP, HISTORY_LEN, PANEL_L_X, PANEL_L_W, PRICE_X, FALLBACK_PRICE, PRICE_RIGHT_GAP
} from './constants';
import { PriceFeed } from './price-feed';

export function drawUnknownZone(ctx: CanvasRenderingContext2D, lineY: number, noiseOff: number) {
  const x0 = PRICE_X, x1 = PANEL_L_X + PANEL_L_W;
  ctx.fillStyle = 'rgba(40,35,35,0.55)';
  ctx.fillRect(x0, CHART_TOP, x1 - x0, lineY - CHART_TOP);
  ctx.fillStyle = 'rgba(30,35,40,0.55)';
  ctx.fillRect(x0, lineY, x1 - x0, CHART_BOT - lineY);
  ctx.save();
  ctx.globalAlpha = 0.045;
  for (let y = CHART_TOP; y < CHART_BOT; y += 4) {
    const noise = Math.sin(y * 0.4 + noiseOff * 3) * 3 + Math.cos(y * 0.17 + noiseOff) * 2;
    ctx.strokeStyle = y < lineY ? '#cc4444' : '#4488cc';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + 7 + noise, y); ctx.stroke();
  }
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  ctx.beginPath(); ctx.moveTo(x0, CHART_TOP); ctx.lineTo(x0, CHART_BOT); ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.18;
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#888';
  ctx.textAlign = 'center';
  ctx.fillText('?', x0 + (x1 - x0) / 2, CHART_TOP + 30);
  ctx.restore();
}

export function drawChart(
  ctx: CanvasRenderingContext2D, 
  lineY: number, 
  priceHistory: number[], 
  volumeHistory: number[], 
  priceToY: (p: number) => number, 
  isPro: boolean = false,
  mousePos?: { x: number, y: number }
) {
  const slice = priceHistory.slice(-HISTORY_LEN);
  const vSlice = volumeHistory.slice(-HISTORY_LEN);
  const startX = PANEL_L_X;
  const chartWidth = PRICE_X - startX;
  
  if (!isPro) {
    const bearGrad = ctx.createLinearGradient(0, CHART_TOP, 0, lineY);
    bearGrad.addColorStop(0, 'rgba(120,20,20,0.22)');
    bearGrad.addColorStop(1, 'rgba(80,10,10,0.05)');
    ctx.fillStyle = bearGrad;
    ctx.fillRect(startX, CHART_TOP, PRICE_X - startX, lineY - CHART_TOP);
    const bullGrad = ctx.createLinearGradient(0, lineY, 0, CHART_BOT);
    bullGrad.addColorStop(0, 'rgba(10,50,100,0.05)');
    bullGrad.addColorStop(1, 'rgba(10,80,160,0.22)');
    ctx.fillStyle = bullGrad;
    ctx.fillRect(startX, lineY, PRICE_X - startX, CHART_BOT - lineY);
  } else {
    // Pro mode: cleaner background with subtle grid
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(startX, CHART_TOP, chartWidth + PRICE_RIGHT_GAP, CHART_BOT - CHART_TOP);
    
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);
    // Vertical grid lines (Time)
    const gridStepX = chartWidth / 10;
    for (let i = 0; i <= 10; i++) {
      const gx = startX + i * gridStepX;
      ctx.beginPath(); ctx.moveTo(gx, CHART_TOP); ctx.lineTo(gx, CHART_BOT); ctx.stroke();
    }
    // Horizontal grid lines (Price)
    const gridStepY = CHART_H / 8;
    for (let i = 0; i <= 8; i++) {
      const gy = CHART_TOP + i * gridStepY;
      ctx.beginPath(); ctx.moveTo(startX, gy); ctx.lineTo(startX + chartWidth + PRICE_RIGHT_GAP, gy); ctx.stroke();
    }
    ctx.restore();
  }

  // Volume bars at the bottom
  ctx.save();
  const maxV = Math.max(...vSlice, 1);
  ctx.globalAlpha = isPro ? 0.25 : 0.15;
  vSlice.forEach((v, i) => {
    const pIdx = priceHistory.length - HISTORY_LEN + i;
    const isUpSeg = pIdx > 0 ? priceHistory[pIdx] >= priceHistory[pIdx - 1] : true;
    ctx.fillStyle = isUpSeg ? '#22c55e' : '#ff4444';
    const vH = (v / maxV) * (CHART_H * 0.2);
    const x = startX + (i / (HISTORY_LEN - 1)) * chartWidth;
    ctx.fillRect(x - 1, CHART_BOT - vH, isPro ? 2 : 2, vH);
  });
  ctx.restore();

  const isUp = priceHistory[priceHistory.length - 1] >= (PriceFeed.dayOpen || FALLBACK_PRICE);

  if (isPro) {
    // Draw Candlesticks for Serious Mode
    const candleSize = 5;
    const numCandles = Math.floor(HISTORY_LEN / candleSize);
    const candleWidth = (chartWidth / numCandles) * 0.7;
    
    for (let i = 0; i < numCandles; i++) {
      const startIdx = i * candleSize;
      const endIdx = startIdx + candleSize;
      const candleSlice = slice.slice(startIdx, endIdx);
      if (candleSlice.length === 0) continue;
      
      const open = candleSlice[0];
      const close = candleSlice[candleSlice.length - 1];
      const high = Math.max(...candleSlice);
      const low = Math.min(...candleSlice);
      
      const isCandleUp = close >= open;
      const color = isCandleUp ? '#22c55e' : '#ff4444';
      
      const x = startX + (i / numCandles) * chartWidth + (chartWidth / numCandles) / 2;
      const yOpen = priceToY(open);
      const yClose = priceToY(close);
      const yHigh = priceToY(high);
      const yLow = priceToY(low);
      
      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();
      
      // Body
      ctx.fillStyle = color;
      const bodyH = Math.max(1, Math.abs(yClose - yOpen));
      const bodyY = Math.min(yOpen, yClose);
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyH);
    }
  } else {
    // Price line fill (Area)
    ctx.beginPath();
    slice.forEach((p, i) => {
      const x = startX + (i / (HISTORY_LEN - 1)) * chartWidth;
      const y = priceToY(p);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(PRICE_X, CHART_BOT); 
    ctx.lineTo(startX, CHART_BOT); 
    ctx.closePath();
    
    const fillGrad = ctx.createLinearGradient(0, CHART_TOP, 0, CHART_BOT);
    if (isUp) {
      fillGrad.addColorStop(0, 'rgba(0,200,80,0.25)');
      fillGrad.addColorStop(1, 'rgba(0,200,80,0.01)');
    } else {
      fillGrad.addColorStop(0, 'rgba(255,60,60,0.01)');
      fillGrad.addColorStop(1, 'rgba(255,60,60,0.25)');
    }
    ctx.fillStyle = fillGrad; ctx.fill();

    // Price line stroke
    ctx.save();
    ctx.shadowColor = isUp ? '#22c55e' : '#ff4444';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = isUp ? '#22c55e' : '#ff4444';
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    slice.forEach((p, i) => {
      const x = startX + (i / (HISTORY_LEN - 1)) * chartWidth;
      const y = priceToY(p);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();
  }

  // Current price crosshair and label
  ctx.save();
  ctx.globalAlpha = isPro ? 0.8 : 0.35;
  ctx.strokeStyle = isUp ? '#22c55e' : '#ff4444';
  ctx.lineWidth = 1; 
  if (isPro) {
    ctx.setLineDash([2, 2]);
  } else {
    ctx.setLineDash([4, 4]);
  }
  ctx.beginPath(); ctx.moveTo(startX, lineY); ctx.lineTo(startX + chartWidth + PRICE_RIGHT_GAP, lineY); ctx.stroke();
  ctx.setLineDash([]);
  
  // Price Axis (Y-axis) on the right
  const mn = Math.min(...slice) * 0.9997;
  const mx = Math.max(...slice) * 1.0003;
  ctx.font = '9px monospace';
  ctx.textAlign = 'left';
  
  if (isPro) {
    // Draw price scale on the right
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(PRICE_X, CHART_TOP, PRICE_RIGHT_GAP, CHART_H);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath(); ctx.moveTo(PRICE_X, CHART_TOP); ctx.lineTo(PRICE_X, CHART_BOT); ctx.stroke();

    ctx.fillStyle = '#888';
    for (let i = 0; i <= 8; i++) {
      const frac = i / 8;
      const pVal = mx - frac * (mx - mn);
      const yPos = CHART_TOP + frac * CHART_H;
      ctx.fillText(pVal.toFixed(1), PRICE_X + 8, yPos + 3);
    }

    // Current price tag
    const lastPrice = priceHistory[priceHistory.length - 1];
    const tagCol = isUp ? '#22c55e' : '#ff4444';
    ctx.fillStyle = tagCol;
    ctx.beginPath();
    ctx.moveTo(PRICE_X, lineY);
    ctx.lineTo(PRICE_X + 6, lineY - 8);
    ctx.lineTo(PRICE_X + 70, lineY - 8);
    ctx.lineTo(PRICE_X + 70, lineY + 8);
    ctx.lineTo(PRICE_X + 6, lineY + 8);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(lastPrice.toFixed(2), PRICE_X + 38, lineY + 4);

    // Crosshair rendering
    if (mousePos && mousePos.x >= startX && mousePos.x <= PRICE_X + PRICE_RIGHT_GAP && mousePos.y >= CHART_TOP && mousePos.y <= CHART_BOT) {
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      
      // Vertical line
      ctx.beginPath(); ctx.moveTo(mousePos.x, CHART_TOP); ctx.lineTo(mousePos.x, CHART_BOT); ctx.stroke();
      // Horizontal line
      ctx.beginPath(); ctx.moveTo(startX, mousePos.y); ctx.lineTo(PRICE_X + PRICE_RIGHT_GAP, mousePos.y); ctx.stroke();
      
      // Price label on crosshair (Y-axis)
      const crossPrice = mx - ((mousePos.y - CHART_TOP) / CHART_H) * (mx - mn);
      ctx.fillStyle = '#333';
      ctx.fillRect(PRICE_X, mousePos.y - 8, PRICE_RIGHT_GAP, 16);
      ctx.fillStyle = '#fff';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(crossPrice.toFixed(2), PRICE_X + 38, mousePos.y + 3);

      // Time label on crosshair (X-axis)
      if (mousePos.x <= PRICE_X) {
        ctx.fillStyle = '#333';
        ctx.fillRect(mousePos.x - 25, CHART_BOT, 50, 14);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        // Simulate a time based on X position
        const now = new Date();
        const secondsAgo = Math.round((PRICE_X - mousePos.x) / (chartWidth / HISTORY_LEN) * 0.15);
        const timeAtX = new Date(now.getTime() - secondsAgo * 1000);
        const timeStr = `${String(timeAtX.getHours()).padStart(2, '0')}:${String(timeAtX.getMinutes()).padStart(2, '0')}:${String(timeAtX.getSeconds()).padStart(2, '0')}`;
        ctx.fillText(timeStr, mousePos.x, CHART_BOT + 10);
      }
      
      ctx.setLineDash([]);
    }
  } else {
    // Simple Y-axis labels
    ctx.fillStyle = '#555';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const frac = i / 4;
      const pVal = mx - frac * (mx - mn);
      const yPos = CHART_TOP + frac * CHART_H;
      ctx.fillText('$' + pVal.toFixed(0), PRICE_X - 4, yPos + 3);
    }
  }
  ctx.restore();

  // Legend / Info in top left
  if (isPro) {
    ctx.save();
    const lastPrice = priceHistory[priceHistory.length - 1];
    const openPrice = slice[0];
    const highPrice = Math.max(...slice);
    const lowPrice = Math.min(...slice);
    const change = lastPrice - openPrice;
    const changePct = (change / openPrice) * 100;
    
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#888';
    let lx = startX + 10;
    let ly = CHART_TOP + 15;
    
    ctx.fillText('O:', lx, ly); ctx.fillStyle = '#fff'; ctx.fillText(openPrice.toFixed(1), lx + 15, ly);
    lx += 60; ctx.fillStyle = '#888'; ctx.fillText('H:', lx, ly); ctx.fillStyle = '#fff'; ctx.fillText(highPrice.toFixed(1), lx + 15, ly);
    lx += 60; ctx.fillStyle = '#888'; ctx.fillText('L:', lx, ly); ctx.fillStyle = '#fff'; ctx.fillText(lowPrice.toFixed(1), lx + 15, ly);
    lx += 60; ctx.fillStyle = '#888'; ctx.fillText('C:', lx, ly); ctx.fillStyle = '#fff'; ctx.fillText(lastPrice.toFixed(1), lx + 15, ly);
    lx += 60; 
    ctx.fillStyle = change >= 0 ? '#22c55e' : '#ff4444';
    ctx.fillText(`${change >= 0 ? '+' : ''}${change.toFixed(1)} (${changePct.toFixed(2)}%)`, lx, ly);
    ctx.restore();
  }

  // Watermark
  ctx.save();
  ctx.font = isPro ? 'bold 10px monospace' : 'bold 11px monospace';
  ctx.letterSpacing = '2px';
  ctx.globalAlpha = isPro ? 0.15 : 0.25;
  ctx.fillStyle = isPro ? '#fff' : (isUp ? '#22c55e' : '#ff4444');
  ctx.textAlign = 'left';
  if (isPro) {
    ctx.fillText('btctoon.com \u2122 // REAL-TIME ORDER FLOW', startX + 16, CHART_TOP + 40);
  } else {
    ctx.fillText('▲ BEAR TERRITORY', startX + 16, CHART_TOP + 22);
    ctx.textAlign = 'left';
    ctx.fillText('▼ BULL TERRITORY', startX + 16, CHART_BOT - 16);
  }
  ctx.restore();

  // Subtle scanline overlay for retro feel
  if (!isPro) {
    ctx.save();
    ctx.globalAlpha = 0.02;
    for (let y = CHART_TOP; y < CHART_BOT; y += 2) {
      ctx.fillStyle = '#000';
      ctx.fillRect(startX, y, PRICE_X - startX, 1);
    }
    ctx.restore();
  }
}

export function drawPriceDot(ctx: CanvasRenderingContext2D, lineY: number, t: number, priceHistory: number[], isPro: boolean = false) {
  const isUp = priceHistory[priceHistory.length - 1] >= (PriceFeed.dayOpen || FALLBACK_PRICE);
  const col = isUp ? '#22c55e' : '#ff4444';
  
  if (isPro) {
    ctx.save();
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(PRICE_X, lineY, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(PRICE_X, lineY, 4, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    return;
  }

  const pulse = (Math.sin(t * 0.14) + 1) / 2;
  ctx.save();
  ctx.globalAlpha = 0.2 + pulse * 0.25;
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(PRICE_X, lineY, 14 + pulse * 5, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.shadowColor = col; ctx.shadowBlur = 18;
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(PRICE_X, lineY, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawBattlePowerBars(ctx: CanvasRenderingContext2D, lineY: number, bearPower: number, bullPower: number) {
  ctx.save();
  const barX = PANEL_L_X;
  const bearBarH = Math.max(4, Math.min((lineY - CHART_TOP) * bearPower * 0.6, lineY - CHART_TOP - 10));
  ctx.fillStyle = 'rgba(180,30,30,0.15)';
  ctx.fillRect(barX, lineY - bearBarH, 6, bearBarH);
  ctx.fillStyle = '#ff4444'; ctx.shadowColor = '#ff4444'; ctx.shadowBlur = 6;
  ctx.fillRect(barX, lineY - bearBarH, 4, bearBarH);
  ctx.shadowBlur = 0;
  const bullBarH = Math.max(4, Math.min((CHART_BOT - lineY) * bullPower * 0.6, CHART_BOT - lineY - 10));
  ctx.fillStyle = 'rgba(20,80,180,0.15)';
  ctx.fillRect(barX, lineY, 6, bullBarH);
  ctx.fillStyle = '#4488ff'; ctx.shadowColor = '#4488ff'; ctx.shadowBlur = 6;
  ctx.fillRect(barX, lineY, 4, bullBarH);
  ctx.restore();
}
