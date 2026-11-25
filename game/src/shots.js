// shots.js — mode deterministik untuk screenshot: ?shot=start|play|serve|end&seed=1
// Mengatur state game ke satu frame yang tetap, supaya screenshot selalu sama.

import { makeOrder, resetOrderIds } from './orders.js';
import { recipeById } from './recipes.js';
import { makeStations } from './stations.js';

function baseState(seed) {
  resetOrderIds();
  const orders = [
    makeOrder(recipeById('nasi-goreng'), 32),
    makeOrder(recipeById('ayam-bakar'), 24),
    makeOrder(recipeById('tumis-sayur'), 40),
  ];
  return {
    screen: 'playing',
    timeLeft: 142,
    elapsed: 38,
    coins: 80,
    score: 240,
    reputation: 3,
    combo: 1,
    bestCombo: 2,
    served: 2,
    failed: 0,
    rushLevel: 1,
    orders,
    stations: makeStations(),
    activePlate: 0,
    banner: 'Masak sesuai resep di tiket — sajikan sebelum countdown habis!',
    bannerTone: 'info',
    flashOrderId: null,
    frozen: true,
    endNote: '',
    seed: seed || 1,
  };
}

export function applyShot(state, shot, seed) {
  const fresh = baseState(seed);
  Object.assign(state, fresh);
  if (shot === 'start') {
    state.screen = 'start';
    state.timeLeft = 180;
    state.coins = 0;
    state.score = 0;
    state.served = 0;
    state.banner = 'Klik untuk mulai shift malam ini!';
    return state;
  }
  if (shot === 'play') {
    // COVER: piring A rakit 2 bahan, wajan A masak, piring B matang siap saji.
    state.screen = 'playing';
    state.timeLeft = 142;
    state.stations[0].plate = ['nasi', 'telur'];
    state.stations[0].pan = { ingredients: ['nasi', 'telur', 'cabai'], progress: 2.2, readySeconds: 0, burnt: false };
    state.stations[1].pan = { ingredients: ['nasi', 'ayam', 'sayur'], progress: 4, readySeconds: 1.5, burnt: false };
    state.stations[1].cookedRecipeId = 'nasi-ayam';
    state.flashOrderId = state.orders[2] ? state.orders[2].id : null;
    state.banner = 'Wajan A mendesis… Piring B sudah matang, siap saji!';
    state.bannerTone = 'info';
    return state;
  }
  if (shot === 'serve') {
    state.screen = 'playing';
    state.timeLeft = 128;
    state.coins = 120;
    state.score = 360;
    state.combo = 2;
    state.served = 3;
    state.stations[0].pan = { ingredients: ['ayam', 'cabai', 'bawang'], progress: 4, readySeconds: 0.5, burnt: false };
    state.stations[0].cookedRecipeId = 'ayam-bakar';
    state.stations[1].plate = ['sayur', 'bawang'];
    state.flashOrderId = state.orders[1] ? state.orders[1].id : null;
    state.banner = 'TERS AJI! Ayam Bakar Senja +50 koin, combo x2! 🎉';
    state.bannerTone = 'good';
    return state;
  }
  if (shot === 'end') {
    state.screen = 'end';
    state.timeLeft = 0;
    state.coins = 320;
    state.score = 1240;
    state.served = 12;
    state.failed = 1;
    state.bestCombo = 4;
    state.reputation = 2;
    state.endNote = '12 piring tersaji, 1 order gagal — warung tetap buka besok malam.';
    return state;
  }
  return state;
}

export function shotFromUrl(search) {
  const params = new URLSearchParams(search || '');
  return {
    shot: params.get('shot') || null,
    seed: Number(params.get('seed') || 1) || 1,
  };
}
