// render.js — semua gambar digambar di canvas dengan bentuk + warna sendiri.
// Tidak ada gambar eksternal: tiap bahan punya ikon bentuknya sendiri.

import {
  COLORS,
  INGREDIENTS,
  LAYOUT,
  binRect,
  formatClock,
  ingredientById,
  stationRect,
  ticketRect,
} from './config.js';
import { recipeById } from './recipes.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight, align) {
  ctx.fillStyle = color || COLORS.cream;
  ctx.font = `${weight || 700} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function pill(ctx, x, y, w, h, fill, stroke) {
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// Ikon bahan, digambar dari bentuk dasar. cx,cy = tengah, r = radius.
export function drawIngredient(ctx, id, cx, cy, r) {
  const item = ingredientById(id);
  if (!item) return;
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'nasi') {
    ctx.fillStyle = '#b8a06a';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.35, r * 0.95, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.1, r * 0.42, 0, Math.PI * 2);
    ctx.arc(r * 0.25, -r * 0.25, r * 0.45, 0, Math.PI * 2);
    ctx.arc(r * 0.35, r * 0.1, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8d9a8';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.3, r * 0.1, 0, Math.PI * 2);
    ctx.arc(r * 0.3, -r * 0.05, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'telur') {
    ctx.fillStyle = '#fff8e1';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.75, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(r * 0.1, r * 0.05, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff9d00';
    ctx.beginPath();
    ctx.arc(r * 0.05, 0, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'cabai') {
    ctx.strokeStyle = item.color;
    ctx.lineWidth = r * 0.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, -r * 0.1, r * 0.7, Math.PI * 1.15, Math.PI * 0.45);
    ctx.stroke();
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.moveTo(r * 0.55, -r * 0.75);
    ctx.lineTo(r * 0.85, -r * 0.95);
    ctx.lineTo(r * 0.75, -r * 0.5);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'ayam') {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.ellipse(-r * 0.1, -r * 0.15, r * 0.6, r * 0.7, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff3e0';
    ctx.beginPath();
    ctx.arc(r * 0.45, r * 0.45, r * 0.22, 0, Math.PI * 2);
    ctx.arc(r * 0.65, r * 0.25, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e65100';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(r * 0.3, r * 0.3);
    ctx.lineTo(r * 0.55, r * 0.55);
    ctx.stroke();
  } else if (id === 'sayur') {
    ctx.fillStyle = item.color;
    for (const [dx, dy, rot] of [[-0.3, -0.1, -0.6], [0.25, -0.25, 0.5], [0, 0.3, 0]]) {
      ctx.save();
      ctx.translate(dx * r, dy * r);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.55, r * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = '#c8e6c9';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, 0);
    ctx.lineTo(r * 0.5, 0);
    ctx.stroke();
  } else if (id === 'bawang') {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e9d5ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
    ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#66bb6a';
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, -r * 0.7);
    ctx.lineTo(0, -r * 1.05);
    ctx.lineTo(r * 0.2, -r * 0.7);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawTicket(ctx, order, index, flashId) {
  const rect = ticketRect(index);
  const recipe = recipeById(order.recipeId);
  const urgent = order.secondsLeft <= 10;
  const flashed = flashId === order.id;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 14);
  ctx.fillStyle = flashed ? '#5a3d7a' : '#3b2a55';
  ctx.fill();
  ctx.strokeStyle = flashed ? COLORS.gold : urgent ? COLORS.tomato : COLORS.boardEdge;
  ctx.lineWidth = flashed ? 3 : urgent ? 3 : 2;
  ctx.stroke();
  text(ctx, `#${order.id} ${order.name}`, rect.x + 14, rect.y + 18, 17, COLORS.cream, 800);
  text(ctx, `+${order.coins} koin`, rect.x + rect.w - 14, rect.y + 18, 15, COLORS.gold, 800, 'right');
  order.ingredients.forEach((id, i) => {
    drawIngredient(ctx, id, rect.x + 40 + i * 52, rect.y + 52, 18);
  });
  text(ctx, recipe ? recipe.tagline : '', rect.x + 176, rect.y + 52, 13, '#cbb8e8', 600);
  const barW = rect.w - 28;
  const frac = Math.max(0, order.secondsLeft / order.totalSeconds);
  roundRect(ctx, rect.x + 14, rect.y + rect.h - 16, barW, 8, 4);
  ctx.fillStyle = '#241a33';
  ctx.fill();
  roundRect(ctx, rect.x + 14, rect.y + rect.h - 16, barW * frac, 8, 4);
  ctx.fillStyle = urgent ? COLORS.tomato : COLORS.leaf;
  ctx.fill();
  text(ctx, `${Math.ceil(order.secondsLeft)} dtk`, rect.x + rect.w - 14, rect.y + rect.h - 28, 12, urgent ? COLORS.tomato : '#cbb8e8', 700, 'right');
}

function drawStation(ctx, station, active, message) {
  const base = stationRect(station.index);
  const activeColor = active ? COLORS.gold : '#5b4a7a';
  roundRect(ctx, base.x, base.y, base.w, base.h, 18);
  ctx.fillStyle = '#2a1d40';
  ctx.fill();
  ctx.strokeStyle = activeColor;
  ctx.lineWidth = active ? 3 : 2;
  ctx.stroke();
  text(ctx, `${station.label} ${active ? '● AKTIF' : ''}`, base.x + 20, base.y + 26, 17, COLORS.cream, 800);
  text(ctx, stationStatusText(station), base.x + base.w - 20, base.y + 26, 14, station.pan?.burnt ? COLORS.tomato : COLORS.gold, 700, 'right');

  // Wajan (kiri)
  const panCx = base.x + 150;
  const panCy = base.y + 150;
  ctx.fillStyle = '#1a1a22';
  ctx.beginPath();
  ctx.ellipse(panCx, panCy + 46, 112, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#37474f';
  ctx.beginPath();
  ctx.ellipse(panCx, panCy + 38, 108, 34, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#546e7a';
  ctx.beginPath();
  ctx.ellipse(panCx, panCy + 38, 108, 30, 0, Math.PI, 0);
  ctx.fill();
  if (station.pan) {
    station.pan.ingredients.forEach((id, i) => {
      drawIngredient(ctx, id, panCx - 52 + i * 52, panCy + 22, 20);
    });
    if (station.pan.progress < 4 && !station.pan.burnt) {
      const frac = station.pan.progress / 4;
      roundRect(ctx, panCx - 90, panCy - 78, 180, 12, 6);
      ctx.fillStyle = '#241a33';
      ctx.fill();
      roundRect(ctx, panCx - 90, panCy - 78, 180 * frac, 12, 6);
      ctx.fillStyle = COLORS.warn;
      ctx.fill();
      text(ctx, 'MEMASAK…', panCx, panCy - 96, 13, COLORS.warn, 800, 'center');
      // uap
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(panCx - 40 + i * 40, panCy - 30);
        ctx.quadraticCurveTo(panCx - 30 + i * 40, panCy - 55, panCx - 40 + i * 40, panCy - 68);
        ctx.stroke();
      }
    } else if (station.pan.burnt) {
      text(ctx, '🔥 GOSONG', panCx, panCy - 88, 16, COLORS.tomato, 800, 'center');
    } else {
      text(ctx, '✦ MATANG ✦', panCx, panCy - 88, 16, COLORS.gold, 800, 'center');
    }
  } else {
    text(ctx, 'Wajan kosong', panCx, panCy + 20, 14, '#9a8fc0', 600, 'center');
    text(ctx, 'klik wajan bila piring penuh', panCx, panCy + 44, 12, '#7d6fa8', 600, 'center');
  }

  // Piring (kanan)
  const plateCx = base.x + 430;
  const plateCy = base.y + 150;
  ctx.fillStyle = '#f5efe0';
  ctx.beginPath();
  ctx.ellipse(plateCx, plateCy + 30, 118, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8dcc0';
  ctx.beginPath();
  ctx.ellipse(plateCx, plateCy + 28, 88, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  if (station.plate.length > 0) {
    station.plate.forEach((id, i) => {
      drawIngredient(ctx, id, plateCx - 48 + i * 48, plateCy + 14, 20);
    });
  } else if (station.pan && station.pan.progress >= 4 && !station.pan.burnt) {
    station.pan.ingredients.forEach((id, i) => {
      drawIngredient(ctx, id, plateCx - 48 + i * 48, plateCy + 14, 20);
    });
    text(ctx, 'SIAP SAJI', plateCx, plateCy - 52, 15, COLORS.gold, 800, 'center');
  } else {
    text(ctx, 'Piring kosong', plateCx, plateCy + 14, 14, '#8a7a5a', 600, 'center');
    text(ctx, 'klik bahan di counter', plateCx, plateCy + 38, 12, '#a89a7a', 600, 'center');
  }
  // slot kosong piring
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = i < station.plate.length ? COLORS.gold : '#cbbfa0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(plateCx - 48 + i * 48, plateCy + 62, 10, 0, Math.PI * 2);
    ctx.stroke();
  }
  text(ctx, 'Klik piring = pilih • X = buang', base.x + 20, base.y + base.h - 18, 13, '#9a8fc0', 600);
  pill(ctx, base.x + 330, base.y + base.h - 40, 130, 36, '#5b3a1e', '#8a5a30');
  text(ctx, '🗑 Buang (X)', base.x + 395, base.y + base.h - 22, 14, COLORS.cream, 700, 'center');
  void message;
}

function stationStatusText(station) {
  if (station.pan?.burnt) return 'GOSONG! Buang dulu';
  if (station.pan && station.pan.progress >= 4) return 'MATANG — siap saji!';
  if (station.pan) return 'Sedang dimasak…';
  if (station.plate.length === 3) return 'Penuh — klik wajan untuk masak';
  if (station.plate.length > 0) return `Rakit: ${station.plate.length}/3 bahan`;
  return 'Piring kosong';
}

export function drawGame(ctx, state) {
  const W = 1280;
  const H = 800;
  // Dinding dapur senja
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, COLORS.night);
  grad.addColorStop(0.55, '#241633');
  grad.addColorStop(1, COLORS.nightDeep);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  // jendela senja
  ctx.fillStyle = '#ff9a3d';
  roundRect(ctx, 1080, 96, 160, 120, 12);
  ctx.fill();
  ctx.fillStyle = '#ff6b35';
  ctx.beginPath();
  ctx.arc(1160, 176, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd23d';
  ctx.beginPath();
  ctx.arc(1160, 176, 22, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, '🌇 SENJA', 1160, 108, 12, '#5a2a00', 800, 'center');

  // Top bar
  roundRect(ctx, 0, 0, W, 76, 0);
  ctx.fillStyle = '#241633';
  ctx.fill();
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(0, 74, W, 2);
  text(ctx, '🍳 SIZZLE & SERVE', 24, 30, 26, COLORS.gold, 800);
  text(ctx, 'Dapur Senja — warung malam', 24, 58, 14, '#cbb8e8', 600);
  // Timer shift
  const urgent = state.timeLeft <= 30;
  pill(ctx, 480, 12, 320, 52, urgent ? '#5a1a1a' : '#3b2a55', urgent ? COLORS.tomato : COLORS.boardEdge);
  text(ctx, `⏱ SHIFT ${formatClock(state.timeLeft)}`, 640, 38, 26, urgent ? '#ffb3ab' : COLORS.cream, 800, 'center');
  text(ctx, `🪙 ${state.coins} koin`, 860, 30, 20, COLORS.gold, 800);
  text(ctx, `⭐ Skor ${state.score}`, 860, 56, 16, COLORS.cream, 700);
  const hearts = '❤'.repeat(state.reputation) + '♡'.repeat(Math.max(0, 3 - state.reputation));
  text(ctx, hearts, 1080, 30, 22, COLORS.tomato, 800);
  text(ctx, `Combo x${state.combo}  •  Saji: ${state.served}`, 1080, 56, 14, COLORS.cream, 600);
  if (state.rushLevel >= 2) {
    pill(ctx, 1080, 96, 176, 30, '#5a1a1a', COLORS.tomato);
    text(ctx, '🔥 SERVICE RUSH!', 1168, 111, 14, '#ffb3ab', 800, 'center');
  }

  // Papan order
  roundRect(ctx, LAYOUT.board.x, LAYOUT.board.y, LAYOUT.board.w, LAYOUT.board.h, 16);
  ctx.fillStyle = COLORS.board;
  ctx.fill();
  ctx.strokeStyle = COLORS.boardEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, '📋 PAPAN ORDER — klik tiket yang cocok untuk menyajikan', LAYOUT.board.x + 16, LAYOUT.board.y + 18, 16, COLORS.cream, 800);
  if (state.orders.length === 0) {
    text(ctx, 'Belum ada order… sebentar lagi datang.', 640, LAYOUT.board.y + 84, 16, '#cbb8e8', 600, 'center');
  }
  state.orders.slice(0, 3).forEach((order, i) => drawTicket(ctx, order, i, state.flashOrderId));

  // Counter bahan
  roundRect(ctx, LAYOUT.counter.x, LAYOUT.counter.y, LAYOUT.counter.w, LAYOUT.counter.h, 16);
  ctx.fillStyle = COLORS.counterTop;
  ctx.fill();
  ctx.strokeStyle = COLORS.counterEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, '🧺 COUNTER — klik bahan (atau tombol 1–6) masuk ke piring aktif', LAYOUT.counter.x + 16, LAYOUT.counter.y + 18, 16, COLORS.cream, 800);
  INGREDIENTS.forEach((item, i) => {
    const rect = binRect(i);
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
    ctx.fillStyle = '#4a3626';
    ctx.fill();
    ctx.strokeStyle = '#8a6a45';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawIngredient(ctx, item.id, rect.x + 44, rect.y + 44, 26);
    text(ctx, item.name, rect.x + 78, rect.y + 32, 18, COLORS.cream, 800);
    text(ctx, item.blurb, rect.x + 78, rect.y + 56, 13, '#d9c8a8', 600);
    pill(ctx, rect.x + rect.w - 36, rect.y + 8, 26, 26, '#241a33', '#8a6a45');
    text(ctx, item.key, rect.x + rect.w - 23, rect.y + 22, 14, COLORS.cream, 800, 'center');
  });

  // Banner pesan
  roundRect(ctx, LAYOUT.banner.x, LAYOUT.banner.y, LAYOUT.banner.w, LAYOUT.banner.h, 10);
  ctx.fillStyle = state.bannerTone === 'bad' ? '#5a1a1a' : state.bannerTone === 'good' ? '#1e4d2a' : '#33264d';
  ctx.fill();
  text(ctx, state.banner || 'Masak sesuai resep di tiket — sajikan sebelum countdown habis!', 640, LAYOUT.banner.y + 22, 17, COLORS.cream, 700, 'center');

  // Dua stasiun
  state.stations.forEach((station, i) => drawStation(ctx, station, state.activePlate === i, state.banner));

  // Hint bawah
  text(ctx, '1–6 bahan  •  A/B pilih piring  •  Spasi masak  •  S sajikan  •  X buang  •  M bisu', 640, LAYOUT.hint.y + 14, 14, '#9a8fc0', 600, 'center');

  if (state.screen === 'start') drawStartOverlay(ctx, state);
  if (state.screen === 'end') drawEndOverlay(ctx, state);
}

function drawStartOverlay(ctx, state) {
  ctx.fillStyle = 'rgba(20, 11, 36, 0.95)';
  ctx.fillRect(0, 0, 1280, 800);
  pill(ctx, 340, 150, 600, 130, '#3b2a55', COLORS.gold);
  text(ctx, '🍳 SIZZLE & SERVE', 640, 196, 44, COLORS.gold, 800, 'center');
  text(ctx, '— DAPUR SENJA —', 640, 240, 22, COLORS.cream, 800, 'center');
  text(ctx, 'Kamu juru masak warung malam. Rakit 3 bahan di piring,', 640, 330, 20, COLORS.cream, 700, 'center');
  text(ctx, 'masak di wajan, sajikan sebelum order kadaluarsa.', 640, 360, 20, COLORS.cream, 700, 'center');
  text(ctx, 'Shift 3 menit • 3 nyawa reputasi • Jangan sampai gosong!', 640, 396, 17, '#cbb8e8', 600, 'center');
  pill(ctx, 490, 440, 300, 64, COLORS.gold, '#e8a100');
  text(ctx, '▶  KLIK UNTUK MULAI', 640, 472, 22, '#241a12', 800, 'center');
  text(ctx, 'Resep: Nasi Goreng • Ayam Bakar • Tumis Sayur • Nasi Ayam Spesial', 640, 540, 15, '#cbb8e8', 600, 'center');
  void state;
}

function drawEndOverlay(ctx, state) {
  ctx.fillStyle = 'rgba(20, 11, 36, 0.95)';
  ctx.fillRect(0, 0, 1280, 800);
  const won = state.reputation > 0 && state.timeLeft <= 0;
  text(ctx, won ? '🌙 SHIFT SELESAI!' : '💔 WARUNG TUTUP', 640, 170, 44, won ? COLORS.gold : COLORS.tomato, 800, 'center');
  text(ctx, won ? 'Warung malam selamat sampai tutup!' : 'Reputasi habis — pelanggan kecewa pulang.', 640, 220, 19, COLORS.cream, 600, 'center');
  pill(ctx, 390, 270, 500, 214, '#3b2a55', COLORS.boardEdge);
  text(ctx, `⭐ Skor akhir: ${state.score}`, 640, 310, 26, COLORS.cream, 800, 'center');
  text(ctx, `🪙 Koin: ${state.coins}   •   🍽 Sajian: ${state.served}`, 640, 356, 20, COLORS.gold, 700, 'center');
  text(ctx, `Combo terbaik: x${state.bestCombo}   •   Order gagal: ${state.failed}`, 640, 396, 17, '#cbb8e8', 600, 'center');
  text(ctx, state.endNote || '', 640, 436, 15, '#cbb8e8', 600, 'center');
  pill(ctx, 490, 600, 300, 64, COLORS.gold, '#e8a100');
  text(ctx, '↻  MAIN LAGI (R)', 640, 632, 22, '#241a12', 800, 'center');
}
