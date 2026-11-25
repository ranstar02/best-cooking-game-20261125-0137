// stations.js — dua stasiun dapur: tiap stasiun punya satu piring (rakit, maks 3 bahan)
// dan satu wajan (masak 4 detik, gosong bila dibiarkan 8 detik setelah matang).

import { BURN_SECONDS, COOK_SECONDS, PLATE_CAPACITY } from './config.js';
import { matchRecipe } from './recipes.js';

export function makeStation(index) {
  return {
    index,
    label: index === 0 ? 'Stasiun A' : 'Stasiun B',
    plate: [], // id bahan di piring, sesuai urutan diklik
    pan: null, // null | { ingredients, progress, readySeconds, burnt }
    cookedRecipeId: null,
  };
}

export function makeStations() {
  return [makeStation(0), makeStation(1)];
}

export function addToPlate(station, ingredientId) {
  if (station.pan) return { ok: false, reason: 'wajan sedang dipakai' };
  if (station.plate.length >= PLATE_CAPACITY) return { ok: false, reason: 'piring penuh' };
  station.plate.push(ingredientId);
  return { ok: true };
}

export function clearPlate(station) {
  station.plate = [];
  station.cookedRecipeId = null;
}

// Piring berisi 3 bahan -> pindahkan ke wajan dan mulai memasak.
export function startCooking(station) {
  if (station.pan) return { ok: false, reason: 'wajan sedang dipakai' };
  if (station.plate.length !== PLATE_CAPACITY) {
    return { ok: false, reason: 'piring butuh 3 bahan' };
  }
  station.pan = {
    ingredients: [...station.plate],
    progress: 0,
    readySeconds: 0,
    burnt: false,
  };
  station.plate = [];
  return { ok: true };
}

export function tickStation(station, dtSeconds) {
  if (!station.pan || station.pan.burnt) return 'idle';
  if (station.pan.progress < COOK_SECONDS) {
    station.pan.progress += dtSeconds;
    if (station.pan.progress >= COOK_SECONDS) {
      station.pan.progress = COOK_SECONDS;
      const recipe = matchRecipe(station.pan.ingredients);
      station.cookedRecipeId = recipe ? recipe.id : null;
      return 'cooked';
    }
    return 'cooking';
  }
  station.pan.readySeconds += dtSeconds;
  if (station.pan.readySeconds >= BURN_SECONDS) {
    station.pan.burnt = true;
    station.cookedRecipeId = null;
    return 'burnt';
  }
  return 'ready';
}

// Piring matang siap saji bila wajan selesai masak dan belum gosong.
export function isReadyToServe(station) {
  return !!station.pan && !station.pan.burnt && station.pan.progress >= COOK_SECONDS;
}

export function serveStation(station) {
  if (!isReadyToServe(station)) return null;
  const recipe = matchRecipe(station.pan.ingredients);
  station.pan = null;
  station.cookedRecipeId = null;
  return recipe;
}

export function tossStation(station) {
  station.pan = null;
  station.plate = [];
  station.cookedRecipeId = null;
}

export function stationStatus(station) {
  if (station.pan?.burnt) return 'GOSONG! Buang dulu';
  if (isReadyToServe(station)) return 'MATANG — siap saji!';
  if (station.pan) return 'Sedang dimasak…';
  if (station.plate.length === PLATE_CAPACITY) return 'Penuh — klik wajan untuk masak';
  if (station.plate.length > 0) return `Rakit: ${station.plate.length}/3 bahan`;
  return 'Piring kosong';
}
