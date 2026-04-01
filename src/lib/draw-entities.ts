import { Animal, AirAttacker, Jet } from './types';

export function drawBull(ctx: CanvasRenderingContext2D, b: Animal, t: number, camShake: {x: number, y: number}) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, b.life));
  ctx.translate(b.x + camShake.x, b.y + camShake.y);
  ctx.scale(1 * b.size, b.size);
  const bW = 24, bH = 11; 
  ctx.shadowColor = b.angry ? '#00aaff' : '#2266ff'; ctx.shadowBlur = b.angry ? 6 : 0;
  const tailBob = Math.sin(t * 0.05 + b.x) * 3;
  ctx.strokeStyle = b.angry ? '#0055aa' : '#155090'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); 
  ctx.moveTo(-bW + 2, -2); 
  ctx.quadraticCurveTo(-bW - 2, 2, -bW - 4 + tailBob, 8 + tailBob/2); 
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = b.angry ? '#00ffff' : '#1e70b5';
  ctx.beginPath(); ctx.arc(-bW - 4 + tailBob, 9 + tailBob/2, 2.5, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = b.angry ? 4 : 0;
  const hornBaseCol = b.angry ? '#ffd700' : '#e0b030';
  ctx.strokeStyle = hornBaseCol; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(14, -11); ctx.bezierCurveTo(8, -11, 5, -17, 9, -21); ctx.stroke();
  ctx.fillStyle = b.angry ? '#0066cc' : '#1a5fa0';
  ctx.beginPath(); ctx.ellipse(0, 0, bW, bH, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(8, -6, 12, 6, 0.1, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = b.angry ? '#0077dd' : '#1e70b5';
  ctx.beginPath(); ctx.ellipse(18, -4, 9, 10, 0.1, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = b.angry ? '#0055aa' : '#155090';
  ctx.beginPath(); ctx.ellipse(20, 3, 7, 5, 0.1, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = hornBaseCol; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(22, -11); ctx.bezierCurveTo(28, -11, 31, -17, 27, -21); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = b.angry ? '#00ffff' : '#fff';   
  ctx.beginPath(); ctx.arc(13, -6, 2.0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(13.5, -6, 1.0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = b.angry ? '#00ffff' : '#fff'; 
  ctx.beginPath(); ctx.arc(23, -6, 2.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(24, -6, 1.2, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = b.angry ? '#004fa0' : '#155090';
  [[-9, bH-1], [-1, bH-1], [7, bH-1], [14, bH-1]].forEach(([lx]) => {
    const bob = Math.sin(t * 0.25 + lx) * 2.5;
    ctx.fillRect(lx - 2.5, bH - 1 + bob, 5, 9);
  });
  if (b.angry) {
    ctx.strokeStyle = 'rgba(0,180,255,0.4)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(18, -4, 15 + i * 5, -0.5, 0.5); ctx.stroke(); }
  }
  ctx.restore();
}

export function drawBear(ctx: CanvasRenderingContext2D, b: Animal, t: number, camShake: {x: number, y: number}) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, b.life));
  ctx.translate(b.x + camShake.x, b.y + camShake.y);
  ctx.scale(-1 * b.size, b.size);
  const bW = 20, bH = 15;
  ctx.shadowColor = b.angry ? '#ff2200' : '#cc5010'; ctx.shadowBlur = b.angry ? 5 : 0;
  ctx.fillStyle = b.angry ? '#5a0000' : '#4a2008';
  ctx.beginPath(); ctx.arc(bW, -3, 4.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = b.angry ? '#6a0a0a' : '#5a2010';
  ctx.beginPath(); ctx.arc(-bW + 8, -12, 4.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = b.angry ? '#7a0000' : '#6a3010';
  ctx.beginPath(); ctx.ellipse(0, 0, bW, bH, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = b.angry ? '#8a1010' : '#7a4020';
  ctx.beginPath(); ctx.arc(-bW + 2, -3, 12, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = b.angry ? '#991515' : '#8a4020';
  ctx.beginPath(); ctx.arc(-bW - 3, -11, 5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = b.angry ? '#ff4444' : '#d07050'; 
  ctx.beginPath(); ctx.arc(-bW - 3, -11, 2.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(200,130,80,0.4)';
  ctx.beginPath(); ctx.ellipse(-bW - 2, -2, 6, 4, 0, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(-bW - 2, -3, 1.8, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = b.angry ? '#ff0' : '#fff';
  ctx.beginPath(); ctx.arc(-bW, -7, 2.0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(-bW - 1, -7, 1.0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = b.angry ? '#ff0' : '#fff';
  ctx.beginPath(); ctx.arc(-bW + 5, -6, 2.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(-bW + 4, -6, 1.2, 0, Math.PI*2); ctx.fill();
  if (b.angry) {
    ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
    [[-bW - 9, -9], [-bW - 13, -4], [-bW - 13, 1]].forEach(([cx2, cy2]) => {
      ctx.beginPath(); ctx.moveTo(cx2, cy2); ctx.lineTo(cx2 - 7, cy2 - 3); ctx.stroke();
    });
  }
  ctx.fillStyle = b.angry ? '#600' : '#5a2808';
  [[-9, bH - 1], [-1, bH - 1], [7, bH - 1], [14, bH - 1]].forEach(([lx]) => {
    const bob = Math.sin(t * 0.2 + lx) * 2.5;
    ctx.fillRect(lx - 2.5, bH - 1 + bob, 5, 9);
  });
  ctx.restore();
}

export function drawAirUnit(ctx: CanvasRenderingContext2D, u: AirAttacker, camShake: {x: number, y: number}) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, u.life));
  ctx.translate(u.x + camShake.x, u.y + camShake.y);
  ctx.rotate(u.angle);
  if (u.type === 'bear') {
    ctx.fillStyle = '#8b0000'; ctx.shadowColor = '#ff2200'; ctx.shadowBlur = 5;
    ctx.beginPath(); ctx.ellipse(0, 0, 16, 9, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(139,0,0,0.5)';
    ctx.beginPath(); ctx.moveTo(-4, -7); ctx.lineTo(-18, -22); ctx.lineTo(8, -7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-4, 7);  ctx.lineTo(-18, 22);  ctx.lineTo(8, 7);  ctx.fill();
    ctx.fillStyle = '#ff0'; ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(9, -3, 2.5, 0, Math.PI*2); ctx.fill();
  } else {
    ctx.fillStyle = '#1a5fa0'; ctx.shadowColor = '#22aaff'; ctx.shadowBlur = 5;
    ctx.beginPath(); ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(80,200,255,0.25)';
    ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-36, -7); ctx.lineTo(-36, 7); ctx.fill();
    ctx.fillStyle = '#f0c040'; ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.moveTo(16, -3); ctx.lineTo(24, 0); ctx.lineTo(16, 3); ctx.fill();
  }
  ctx.restore();
}

export function drawJet(ctx: CanvasRenderingContext2D, j: Jet, camShake: {x: number, y: number}) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, j.life));
  ctx.translate(j.x + camShake.x, j.y + camShake.y);
  const facing = j.vx > 0 ? 1 : -1;
  ctx.scale(facing, 1);
  ctx.fillStyle = j.type === 'bear' ? '#b30000' : '#1a5fa0';
  ctx.beginPath();
  ctx.moveTo(35, 0); ctx.lineTo(5, -6); ctx.lineTo(-25, -12); ctx.lineTo(-25, -4);
  ctx.lineTo(-15, 0); ctx.lineTo(-25, 4); ctx.lineTo(-25, 12); ctx.lineTo(5, 6); ctx.fill();
  ctx.fillStyle = j.type === 'bear' ? '#ff3300' : '#00aaff';
  ctx.beginPath();
  ctx.moveTo(5, 0); ctx.lineTo(-15, 20); ctx.lineTo(-25, 20); ctx.lineTo(-10, 0); ctx.fill();
  ctx.fillStyle = '#ffaa00';
  ctx.shadowColor = '#ffaa00'; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.arc(-26, 0, 2 + Math.random() * 3, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}
