// main.js — loop permainan Sizzle & Serve: state, timer, spawn order, dan aksi pemain.
// File ini yang merangkai config + recipes + orders + stations + input + audio + render.

import { SHIFT_SECONDS } from './config.js';
import { findOrderForRecipe, makeOrder, orderCountdownSeconds, removeOrder, rushLevel, spawnIntervalSeconds, tickOrders } from './orders.js';
import { recipeById } from './recipes.js';
import { addToPlate, isReadyToServe, makeStations, serveStation, startCooking, tickStation, tossStation } from './stations.js';
import { hitTest, keyAction } from './input.js';
import { playBuzz, playClick, playDing, playPop, startSizzle, stopSizzle, toggleMute } from './audio.js';
import { drawGame } from './render.js';
import { applyShot, shotFromUrl } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = 1280;
canvas.height = 800;

export const state = {
  screen: 'start',
  timeLeft: SHIFT_SECONDS,
  elapsed: 0,
  coins: 0,
  score: 0,
  reputation: 3,
  combo: 0,
  bestCombo: 0,
  served: 0,
  failed: 0,
  rushLevel: 1,
  orders: [],
  stations: makeStations(),
  activePlate: 0,
  banner: 'Klik untuk mulai shift malam ini!',
  bannerTone: 'info',
  flashOrderId: null,
  frozen: false,
  endNote: '',
  seed: 1,
  spawnTimer: 8,
};

let lastTime = performance.now();
let flashTimer = 0;

function setBanner(message, tone) {
  state.banner = message;
  state.bannerTone = tone || 'info';
}

function startGame() {
  state.screen = 'playing';
  state.timeLeft = SHIFT_SECONDS;
  state.elapsed = 0;
  state.coins = 0;
  state.score = 0;
  state.reputation = 3;
  state.combo = 0;
  state.bestCombo = 0;
  state.served = 0;
  state.failed = 0;
  state.rushLevel = 1;
  state.orders = [makeOrder(null, 45), makeOrder(null, 40)];
  state.stations = makeStations();
  state.activePlate = 0;
  state.spawnTimer = 10;
  state.endNote = '';
  setBanner('Shift dimulai! Rakit 3 bahan, masak, sajikan!', 'info');
  playDing();
}

function endGame(won) {
  state.screen = 'end';
  state.endNote = won
    ? `${state.served} piring tersaji — warung tetap buka besok malam.`
    : 'Reputasi habis — pelanggan kecewa pulang.';
  stopSizzle();
}

function loseReputation(reason) {
  state.reputation -= 1;
  state.failed += 1;
  state.combo = 0;
  setBanner(reason, 'bad');
  playBuzz();
  if (state.reputation <= 0) endGame(false);
}

function doServeTicket(index) {
  const order = state.orders[index];
  if (!order) return;
  const recipe = recipeById(order.recipeId);
  const ready = state.stations.find((station) => isReadyToServe(station) && station.cookedRecipeId === order.recipeId);
  if (!ready) {
    const anyReady = state.stations.find((station) => isReadyToServe(station));
    if (anyReady) {
      setBanner('Resep tidak cocok dengan tiket itu — cek bahan di piring matang!', 'bad');
    } else {
      setBanner('Belum ada piring matang untuk tiket itu — masak dulu!', 'bad');
    }
    state.timeLeft = Math.max(0, state.timeLeft - 5);
    state.coins = Math.max(0, state.coins - 5);
    playBuzz();
    return;
  }
  const servedRecipe = serveStation(ready);
  if (!servedRecipe) return;
  removeOrder(state.orders, order.id);
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  const multiplier = 1 + Math.min(2, state.combo - 1) * 0.5;
  const coins = Math.round(order.coins * multiplier);
  const score = Math.round(order.score * multiplier);
  state.coins += coins;
  state.score += score;
  state.served += 1;
  state.flashOrderId = order.id;
  flashTimer = 1.2;
  setBanner(`TERS AJI! ${recipe.name} +${coins} koin, combo x${state.combo}! 🎉`, 'good');
  playPop();
}

function doCook(index) {
  const station = state.stations[index];
  const result = startCooking(station);
  if (!result.ok) {
    setBanner(result.reason, 'bad');
    playBuzz();
    return;
  }
  setBanner(`${station.label}: wajan menyala — sizzle!`, 'info');
  startSizzle();
  playClick();
}

function handleAction(action) {
  if (action.kind === 'start') {
    startGame();
    return;
  }
  if (action.kind === 'restart') {
    startGame();
    return;
  }
  if (state.screen !== 'playing') return;
  if (action.kind === 'ingredient') {
    const station = state.stations[state.activePlate];
    const result = addToPlate(station, action.id);
    if (result.ok) {
      playClick();
      setBanner(`Bahan masuk ${station.label} (${station.plate.length}/3).`, 'info');
    } else {
      setBanner(result.reason, 'bad');
      playBuzz();
    }
    return;
  }
  if (action.kind === 'ticket') {
    doServeTicket(action.index);
    return;
  }
  if (action.kind === 'plate' || action.kind === 'select-plate') {
    state.activePlate = action.index;
    playClick();
    return;
  }
  if (action.kind === 'pan') {
    state.activePlate = action.index;
    const station = state.stations[action.index];
    if (station.pan) return;
    if (station.plate.length === 3) doCook(action.index);
    else setBanner('Piring butuh 3 bahan dulu sebelum dimasak.', 'bad');
    return;
  }
  if (action.kind === 'cook') {
    doCook(state.activePlate);
    return;
  }
  if (action.kind === 'serve-any') {
    const order = state.orders[0];
    if (order) doServeTicket(0);
    return;
  }
  if (action.kind === 'toss') {
    tossStation(state.stations[state.activePlate]);
    setBanner('Piring dibuang — rakit lagi dari awal.', 'bad');
    playBuzz();
    return;
  }
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * 1280,
    y: ((event.clientY - rect.top) / rect.height) * 800,
  };
}

canvas.addEventListener('click', (event) => {
  const point = canvasPoint(event);
  handleAction(hitTest(point.x, point.y, state));
});

window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'm') {
    toggleMute();
    return;
  }
  handleAction(keyAction(event.key, state));
});

function tick(dt) {
  if (state.screen !== 'playing' || state.frozen) return;
  state.elapsed += dt;
  state.timeLeft -= dt;
  state.rushLevel = rushLevel(state.elapsed);
  if (flashTimer > 0) {
    flashTimer -= dt;
    if (flashTimer <= 0) state.flashOrderId = null;
  }
  for (const station of state.stations) {
    const result = tickStation(station, dt);
    if (result === 'cooked') {
      setBanner(`${station.label} matang! Sajikan sebelum gosong (8 dtk).`, 'good');
      playDing();
    } else if (result === 'burnt') {
      setBanner(`${station.label} GOSONG! Buang dan rakit lagi.`, 'bad');
      playBuzz();
      stopSizzle();
    }
  }
  const anyCooking = state.stations.some((s) => s.pan && s.pan.progress < 4);
  if (!anyCooking) stopSizzle();
  const expired = tickOrders(state.orders, dt);
  for (const order of expired) {
    removeOrder(state.orders, order.id);
    loseReputation(`Order #${order.id} (${order.name}) kadaluarsa — reputasi −1.`);
    if (state.screen !== 'playing') break;
  }
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0 && state.orders.length < 3) {
    state.orders.push(makeOrder(null, orderCountdownSeconds(state.elapsed)));
    state.spawnTimer = spawnIntervalSeconds(state.elapsed);
    setBanner('Order baru masuk! 📋', 'info');
    playDing();
  }
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    endGame(true);
  }
}

function frame(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  tick(dt);
  drawGame(ctx, state);
  requestAnimationFrame(frame);
}

// Mode screenshot deterministik: bekukan timer supaya frame selalu sama.
const { shot, seed } = shotFromUrl(window.location.search);
if (shot) {
  applyShot(state, shot, seed);
} else {
  state.orders = [makeOrder(null, 45), makeOrder(null, 40)];
}
requestAnimationFrame(frame);

// Untuk pengujian otomatis dari konsol browser.
window.__sizzle = { state, startGame, handleAction };
