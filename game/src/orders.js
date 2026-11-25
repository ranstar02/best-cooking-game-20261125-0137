// orders.js — papan order: tiket datang, hitung mundur, kadaluarsa, dan service rush.
// Satu tiket = satu resep + satu countdown sendiri.

import { RECIPES } from './recipes.js';

let nextOrderId = 1;

export function makeOrder(recipe, secondsLeft, rng) {
  const pick = recipe || RECIPES[Math.floor((rng ? rng() : Math.random()) * RECIPES.length)];
  return {
    id: nextOrderId++,
    recipeId: pick.id,
    name: pick.name,
    ingredients: [...pick.ingredients],
    coins: pick.coins,
    score: pick.score,
    secondsLeft: secondsLeft ?? 45,
    totalSeconds: secondsLeft ?? 45,
    bornAt: Date.now(),
  };
}

export function resetOrderIds() {
  nextOrderId = 1;
}

// Seberapa cepat order baru datang, tergantung umur shift (rush tiap 60 detik).
export function spawnIntervalSeconds(elapsedSeconds) {
  if (elapsedSeconds >= 120) return 7;
  if (elapsedSeconds >= 60) return 9;
  return 12;
}

export function orderCountdownSeconds(elapsedSeconds) {
  if (elapsedSeconds >= 120) return 28;
  if (elapsedSeconds >= 60) return 35;
  return 45;
}

export function rushLevel(elapsedSeconds) {
  if (elapsedSeconds >= 120) return 3;
  if (elapsedSeconds >= 60) return 2;
  return 1;
}

// Turunkan semua countdown; kembalikan tiket yang habis waktunya.
export function tickOrders(orders, dtSeconds) {
  const expired = [];
  for (const order of orders) {
    order.secondsLeft -= dtSeconds;
    if (order.secondsLeft <= 0) expired.push(order);
  }
  return expired;
}

export function removeOrder(orders, id) {
  const at = orders.findIndex((order) => order.id === id);
  if (at >= 0) return orders.splice(at, 1)[0];
  return null;
}

export function findOrderForRecipe(orders, recipeId) {
  return orders.find((order) => order.recipeId === recipeId) || null;
}
