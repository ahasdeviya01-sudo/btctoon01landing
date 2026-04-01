/* ── Real audio playback using preloaded sound files ── */

let audioCtx: AudioContext | null = null;
let audioStarted = false;

/** Map of sound‑id → decoded AudioBuffer (preloaded once) */
const buffers: Record<string, AudioBuffer> = {};

/** Background music HTMLAudioElement (loops) */
let bgMusic: HTMLAudioElement | null = null;

/** Mapping from playSound id → public asset path */
const SOUND_MAP: Record<string, string> = {
  missile:     '/sounds/missile.wav',
  explosion:   '/sounds/explotion.wav',   // filename has typo in asset
  bull_charge: '/sounds/bull.wav',
  bear_dump:   '/sounds/bear.wav',
};

/** Fetch + decode a single audio file into an AudioBuffer */
async function loadBuffer(ctx: AudioContext, id: string, url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const arrayBuf = await res.arrayBuffer();
    buffers[id] = await ctx.decodeAudioData(arrayBuf);
  } catch {
    // silent — fall back to no sound for this id
  }
}

/**
 * Initialise audio – call on first user interaction (click / tap).
 * Preloads all SFX buffers and starts looping background music.
 */
export function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  if (!audioStarted) {
    audioStarted = true;

    // Preload all SFX
    const ctx = audioCtx;
    for (const [id, url] of Object.entries(SOUND_MAP)) {
      loadBuffer(ctx, id, url);
    }

    // Background music via <audio> element (loops, low volume)
    if (!bgMusic) {
      bgMusic = new Audio('/sounds/background.mp3');
      bgMusic.loop = true;
      bgMusic.volume = 0.15;
      bgMusic.play().catch(() => {/* autoplay blocked – ignore */});
    }
  }
}

/**
 * Play a preloaded sound effect.
 * @param id   One of 'missile' | 'explosion' | 'bull_charge' | 'bear_dump'
 * @param vol  Volume 0‑1 (default 0.8)
 */
export function playSound(id: string, vol = 0.8) {
  if (!audioStarted || !audioCtx) return;

  const buf = buffers[id];
  if (!buf) return; // not yet loaded or unknown id

  const source = audioCtx.createBufferSource();
  source.buffer = buf;

  const gain = audioCtx.createGain();
  gain.gain.value = Math.max(0, Math.min(1, vol));

  source.connect(gain);
  gain.connect(audioCtx.destination);
  source.start(0);
}
