// input.js — klik mouse dan keyboard, dipetakan ke zona dapur.
// File ini tidak tahu soal skor; ia hanya melaporkan "apa yang diklik".

import { INGREDIENTS, LAYOUT, binRect, stationRect, ticketRect } from './config.js';

export function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

// Kembalikan aksi: { kind: 'ingredient'|'ticket'|'plate'|'pan'|'start'|'restart'|'none', ... }
export function hitTest(x, y, state) {
  if (state.screen === 'start') {
    return { kind: 'start' };
  }
  if (state.screen === 'end') {
    const box = { x: 490, y: 600, w: 300, h: 64 };
    if (pointInRect(x, y, box)) return { kind: 'restart' };
    return { kind: 'none' };
  }
  for (let i = 0; i < 3; i++) {
    if (pointInRect(x, y, ticketRect(i))) return { kind: 'ticket', index: i };
  }
  for (let i = 0; i < INGREDIENTS.length; i++) {
    if (pointInRect(x, y, binRect(i))) return { kind: 'ingredient', id: INGREDIENTS[i].id };
  }
  for (let s = 0; s < 2; s++) {
    const base = stationRect(s);
    const pan = { x: base.x + 40, y: base.y + 18, w: 220, h: 150 };
    const plate = { x: base.x + 300, y: base.y + 18, w: 260, h: 150 };
    const toss = { x: base.x + 300, y: base.y + 216, w: 120, h: 36 };
    if (pointInRect(x, y, pan)) return { kind: 'pan', index: s };
    if (pointInRect(x, y, plate)) return { kind: 'plate', index: s };
    if (pointInRect(x, y, toss)) return { kind: 'toss', index: s };
  }
  const hintBar = LAYOUT.hint;
  if (pointInRect(x, y, { x: 24, y: 446, w: 1232, h: 300 })) return { kind: 'station-area' };
  void hintBar;
  return { kind: 'none' };
}

// Tombol keyboard: 1-6 bahan, A/B pilih piring aktif, Spasi masak, S sajikan, R restart.
export function keyAction(key, state) {
  const lower = String(key).toLowerCase();
  if (state.screen === 'start' && (lower === 'enter' || lower === ' ')) return { kind: 'start' };
  if (state.screen === 'end' && lower === 'r') return { kind: 'restart' };
  if (state.screen !== 'playing') return { kind: 'none' };
  const byKey = INGREDIENTS.find((item) => item.key === lower);
  if (byKey) return { kind: 'ingredient', id: byKey.id };
  if (lower === 'a') return { kind: 'select-plate', index: 0 };
  if (lower === 'b') return { kind: 'select-plate', index: 1 };
  if (lower === ' ' || lower === 'enter') return { kind: 'cook' };
  if (lower === 's') return { kind: 'serve-any' };
  if (lower === 'x') return { kind: 'toss' };
  return { kind: 'none' };
}
