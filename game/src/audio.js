// audio.js — semua bunyi disintesis WebAudio di kode, tanpa file suara eksternal.
// Sizzle = noise berdesis, ding = order baru, pop = saji benar, buzz = salah/gosong.

let ctx = null;
let muted = false;
let sizzleNode = null;

export function ensureAudio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function toggleMute() {
  muted = !muted;
  if (muted) stopSizzle();
  return muted;
}

export function isMuted() {
  return muted;
}

function tone(freq, seconds, type, gainValue, when = 0) {
  if (muted) return;
  const audio = ensureAudio();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  const t = audio.currentTime + when;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(gainValue || 0.12, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  osc.connect(gain).connect(audio.destination);
  osc.start(t);
  osc.stop(t + seconds + 0.05);
}

export function playClick() {
  tone(620, 0.07, 'triangle', 0.08);
}

export function playDing() {
  tone(880, 0.18, 'sine', 0.14);
  tone(1318, 0.28, 'sine', 0.1, 0.09);
}

export function playPop() {
  tone(520, 0.1, 'triangle', 0.16);
  tone(780, 0.16, 'triangle', 0.14, 0.06);
  tone(1040, 0.22, 'sine', 0.1, 0.12);
}

export function playBuzz() {
  tone(160, 0.25, 'sawtooth', 0.1);
  tone(120, 0.3, 'sawtooth', 0.09, 0.08);
}

export function startSizzle() {
  if (muted || sizzleNode) return;
  const audio = ensureAudio();
  if (!audio) return;
  const length = audio.sampleRate * 1;
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = audio.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 4200;
  const gain = audio.createGain();
  gain.gain.value = 0.035;
  source.connect(filter).connect(gain).connect(audio.destination);
  source.start();
  sizzleNode = { source, gain };
}

export function stopSizzle() {
  if (!sizzleNode) return;
  try {
    sizzleNode.source.stop();
  } catch (_) {
    // sudah berhenti
  }
  sizzleNode = null;
}
