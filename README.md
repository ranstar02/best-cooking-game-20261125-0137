# Sizzle & Serve — Dapur Senja

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/ranstar02/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/ranstar02/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Kamu juru masak di warung malam kecil. Pesanan datang di papan order, masak sebelum
timer habis, sajikan tepat waktu — jangan sampai gosong.

## Cara main

- **Klik bahan** di counter (atau tombol **1–6**) → masuk ke piring aktif (maks 3 bahan).
- **Klik wajan** saat piring penuh → masak ±4 detik. Dibiarkan >8 detik setelah matang = **GOSONG**, harus dibuang.
- **Klik tiket order** yang cocok dengan isi piring matang → sajikan, dapat koin + skor.
  Sajian salah = penalti −5 detik shift dan −5 koin.
- Order baru datang berkala; tiap order punya countdown sendiri (habis = reputasi −1).
  Shift 180 detik; reputasi habis (3 order gagal) = game over.
- Tiap 60 detik masuk **Service Rush**: order datang lebih cepat, countdown lebih pendek.
- Combo: sajian benar beruntun menaikkan multiplier koin/skor.

Resep (masing-masing 3 bahan):

| Resep | Bahan |
| --- | --- |
| Nasi Goreng Senja | Nasi + Telur + Cabai |
| Ayam Bakar Senja | Ayam + Cabai + Bawang |
| Tumis Sayur | Sayur + Bawang + Telur |
| Nasi Ayam Spesial | Nasi + Ayam + Sayur |

Kontrol: `1–6` bahan, `A`/`B` pilih piring, `Spasi` masak, `S` sajikan, `X` buang, `M` bisu.

## Run it

```sh
node serve.ts
# buka http://localhost:8080
```

Mode screenshot deterministik: `?shot=start|play|serve|end&seed=1`.

Game ini vanilla JS + canvas, tanpa library, tanpa aset eksternal, tanpa network.
Semua gambar digambar di canvas, semua bunyi disintesis WebAudio di kode.

Struktur kode:

- `game/src/config.js` — konstanta, warna, bahan, tata letak
- `game/src/recipes.js` — empat resep dan pencocokan
- `game/src/orders.js` — papan order, spawn, rush
- `game/src/stations.js` — piring + wajan (rakit, masak, gosong, saji)
- `game/src/input.js` — klik mouse dan keyboard
- `game/src/audio.js` — synth WebAudio (sizzle, ding, pop)
- `game/src/render.js` — semua gambar canvas
- `game/src/shots.js` — mode deterministik untuk screenshot
- `game/src/main.js` — loop permainan

---

<sub>Entered on [make.fun](https://make.fun/?ref=0m7x29es&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
