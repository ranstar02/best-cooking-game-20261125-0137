// config.js — angka, warna, dan tata letak dapur "Sizzle & Serve — Dapur Senja".
// Satu-satunya tempat konstanta permainan tinggal, supaya file lain tinggal memakai.

export const VIEW = { width: 1280, height: 800 };

export const SHIFT_SECONDS = 180;
export const COOK_SECONDS = 4;
export const BURN_SECONDS = 8;
export const MAX_REPUTATION = 3;
export const PLATE_CAPACITY = 3;

export const COLORS = {
  night: '#1b1030',
  nightDeep: '#140b24',
  counterTop: '#3a2a1c',
  counterEdge: '#6b4a2f',
  board: '#2c1e3f',
  boardEdge: '#7a5ba6',
  cream: '#fff3d6',
  ink: '#241a12',
  gold: '#ffc53d',
  tomato: '#ff5a4e',
  leaf: '#58c96b',
  sky: '#4fc3f7',
  warn: '#ff8a3d',
};

// Enam bahan counter, urutan ini juga urutan tombol keyboard 1-6.
export const INGREDIENTS = [
  { id: 'nasi', name: 'Nasi', key: '1', color: '#fdf6e3', accent: '#d9c48a', blurb: 'pul en' },
  { id: 'telur', name: 'Telur', key: '2', color: '#ffd23d', accent: '#fff3c4', blurb: 'mata sapi' },
  { id: 'cabai', name: 'Cabai', key: '3', color: '#e53935', accent: '#ff8a80', blurb: 'pedas!' },
  { id: 'ayam', name: 'Ayam', key: '4', color: '#ff8f2b', accent: '#ffcc80', blurb: 'paha' },
  { id: 'sayur', name: 'Sayur', key: '5', color: '#43a047', accent: '#a5d6a7', blurb: 'segar' },
  { id: 'bawang', name: 'Bawang', key: '6', color: '#8e5fc0', accent: '#d1b3ff', blurb: 'wangi' },
];

export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id) || null;
}

// Tata letak tetap (canvas 1280x800) supaya klik, gambar, dan screenshot selalu sama.
export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 76 },
  board: { x: 24, y: 88, w: 1232, h: 132 },
  ticketWidth: 392,
  ticketGap: 24,
  counter: { x: 24, y: 236, w: 1232, h: 138 },
  binWidth: 192,
  binGap: 16,
  banner: { x: 24, y: 386, w: 1232, h: 44 },
  stationWidth: 600,
  stationGap: 32,
  stationY: 446,
  stationHeight: 300,
  hint: { x: 24, y: 758, w: 1232, h: 30 },
};

export function ticketRect(index) {
  return {
    x: LAYOUT.board.x + 16 + index * (LAYOUT.ticketWidth + LAYOUT.ticketGap),
    y: LAYOUT.board.y + 34,
    w: LAYOUT.ticketWidth,
    h: 84,
  };
}

export function binRect(index) {
  return {
    x: LAYOUT.counter.x + 16 + index * (LAYOUT.binWidth + LAYOUT.binGap),
    y: LAYOUT.counter.y + 34,
    w: LAYOUT.binWidth,
    h: 88,
  };
}

export function stationRect(index) {
  return {
    x: 24 + index * (LAYOUT.stationWidth + LAYOUT.stationGap),
    y: LAYOUT.stationY,
    w: LAYOUT.stationWidth,
    h: LAYOUT.stationHeight,
  };
}

// RNG deterministik kecil untuk mode screenshot (?seed=1).
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function formatClock(seconds) {
  const safe = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function clamp(value, low, high) {
  return Math.min(high, Math.max(low, value));
}
