// recipes.js — empat resep warung malam, masing-masing kombinasi tiga bahan.
// Nama dan kombinasi adalah ciptaan sendiri untuk game ini.

export const RECIPES = [
  {
    id: 'nasi-goreng',
    name: 'Nasi Goreng Senja',
    ingredients: ['nasi', 'telur', 'cabai'],
    coins: 40,
    score: 120,
    emoji: '🍳',
    tagline: 'wok hei, pedas manis',
  },
  {
    id: 'ayam-bakar',
    name: 'Ayam Bakar Senja',
    ingredients: ['ayam', 'cabai', 'bawang'],
    coins: 50,
    score: 150,
    emoji: '🍗',
    tagline: 'arang, manis gurih',
  },
  {
    id: 'tumis-sayur',
    name: 'Tumis Sayur',
    ingredients: ['sayur', 'bawang', 'telur'],
    coins: 30,
    score: 90,
    emoji: '🥬',
    tagline: 'ringan, cepat, segar',
  },
  {
    id: 'nasi-ayam',
    name: 'Nasi Ayam Spesial',
    ingredients: ['nasi', 'ayam', 'sayur'],
    coins: 60,
    score: 180,
    emoji: '🍛',
    tagline: 'porsi jumbo warung',
  },
];

export function recipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id) || null;
}

// Cocok bila isi piring berisi tepat tiga bahan resep itu, urutan bebas.
export function matchRecipe(ingredientIds) {
  if (!Array.isArray(ingredientIds) || ingredientIds.length !== 3) return null;
  const sorted = [...ingredientIds].sort();
  return (
    RECIPES.find((recipe) => {
      const want = [...recipe.ingredients].sort();
      return want.every((id, i) => id === sorted[i]);
    }) || null
  );
}

// Resep yang masih mungkin dibuat dari bahan yang sudah ada di piring.
export function possibleRecipes(ingredientIds) {
  return RECIPES.filter((recipe) =>
    ingredientIds.every((id) => recipe.ingredients.includes(id)),
  );
}

export function recipeNames() {
  return RECIPES.map((recipe) => recipe.name);
}
