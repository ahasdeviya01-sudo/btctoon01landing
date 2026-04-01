export function rand(a: number, b: number) { return a + Math.random() * (b - a); }
export function lerp(a: number, b: number, t: number) { return a + (b - a) * clamp(t, 0, 1); }
export function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }

export const W = 1280, H = 720;
export const MARGIN = 24;
export const GAP = 24;

export const INNER_W = W - MARGIN * 2 - GAP;
export const PANEL_L_W = Math.round(INNER_W * 0.618); 
export const PANEL_R_W = INNER_W - PANEL_L_W;         

export const PANEL_L_X = MARGIN;
export const PANEL_R_X = PANEL_L_X + PANEL_L_W + GAP;
export const PANEL_Y = MARGIN;
export const PANEL_H = H - MARGIN * 2;

export const HUD_H       = 60;
export const CHART_TOP   = PANEL_Y + HUD_H + 16;
export const CHART_BOT   = PANEL_Y + PANEL_H - 24;
export const CHART_H     = CHART_BOT - CHART_TOP;
export const PRICE_RIGHT_GAP = 80;
export const PRICE_X     = PANEL_L_X + PANEL_L_W - PRICE_RIGHT_GAP;
export const HISTORY_LEN = 350; 

export const FALLBACK_PRICE = 70600;
