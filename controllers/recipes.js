// controllers/recipes.js
const express = require('express');
const router = express.Router();
const Recipe = require('../models/recipe');
const Ingredient = require('../models/ingredient');
const User = require('../models/user'); // only needed if you also track user.recipes

// Helper: ensure recipe belongs to current user
async function findOwnedRecipe(recipeId, userId) {
  const doc = await Recipe.findById(recipeId);
  if (!doc) return null;
  if (String(doc.owner) !== String(userId)) return null;
  return doc;
}

// Helper: upsert ingredients from comma-separated names, return IDs
async function upsertIngredientsFromCSV(csv) {
  if (!csv || !csv.trim()) return [];
  const names = csv
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);

  const ids = [];
  for (const name of names) {
    const existing = await Ingredient.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      ids.push(existing._id);
    } else {
      const created = await Ingredient.create({ name });
      ids.push(created._id);
    }
  }
  return ids;
}

// INDEX: GET /recipes  (list current user's recipes)
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find({ owner: req.session.user._id }).sort({ createdAt: -1 });
    res.render('recipes/index.ejs', { recipes });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// NEW: GET /recipes/new (form)
router.get('/new', async (req, res) => {
  try {
    const allIngredients = await Ingredient.find({}).sort({ name: 1 });
    res.render('recipes/new.ejs', { allIngredients });
  } catch (err) {
    console.error(err);
    res.redirect('/recipes');
  }
});

// CREATE: POST /recipes
router.post('/', async (req, res) => {
  try {
    const { name, instructions } = req.body;
    const selectedIngredientIds = Array.isArray(req.body.ingredients)
      ? req.body.ingredients.filter(Boolean)
      : req.body.ingredients
      ? [req.body.ingredients]
      : [];

    const newIngredientIds = await upsertIngredientsFromCSV(req.body.newIngredients);
    const allIngredientIds = [...new Set([...selectedIngredientIds, ...newIngredientIds])];

    const recipe = await Recipe.create({
      name,
      instructions,
      owner: req.session.user._id,
      ingredients: allIngredientIds,
    });

    // Optional: also push into user.recipes if you added that field
    // await User.findByIdAndUpdate(req.session.user._id, { $addToSet: { recipes: recipe._id } });

    res.redirect('/recipes');
  } catch (err) {
    console.error(err);
    res.redirect('/recipes');
  }
});

// SHOW: GET /recipes/:recipeId
router.get('/:recipeId', async (req, res) => {
  try {
    const recipe = await findOwnedRecipe(req.params.recipeId, req.session.user._id);
    if (!recipe) return res.redirect('/recipes');
    await recipe.populate('ingredients');
    res.render('recipes/show.ejs', { recipe });
  } catch (err) {
    console.error(err);
    res.redirect('/recipes');
  }
});

// EDIT: GET /recipes/:recipeId/edit
router.get('/:recipeId/edit', async (req, res) => {
  try {
    const recipe = await findOwnedRecipe(req.params.recipeId, req.session.user._id);
    if (!recipe) return res.redirect('/recipes');
    const allIngredients = await Ingredient.find({}).sort({ name: 1 });
    res.render('recipes/edit.ejs', { recipe, allIngredients });
  } catch (err) {
    console.error(err);
    res.redirect('/recipes');
  }
});

// UPDATE: PUT /recipes/:recipeId
router.put('/:recipeId', async (req, res) => {
  try {
    const recipe = await findOwnedRecipe(req.params.recipeId, req.session.user._id);
    if (!recipe) return res.redirect('/recipes');

    const { name, instructions } = req.body;
    const selectedIngredientIds = Array.isArray(req.body.ingredients)
      ? req.body.ingredients.filter(Boolean)
      : req.body.ingredients
      ? [req.body.ingredients]
      : [];

    const newIngredientIds = await upsertIngredientsFromCSV(req.body.newIngredients);
    const allIngredientIds = [...new Set([...selectedIngredientIds, ...newIngredientIds])];

    recipe.name = name;
    recipe.instructions = instructions || '';
    recipe.ingredients = allIngredientIds;

    await recipe.save();
    res.redirect(`/recipes/${recipe._id}`);
  } catch (err) {
    console.error(err);
    res.redirect('/recipes');
  }
});

// DELETE: DELETE /recipes/:recipeId
router.delete('/:recipeId', async (req, res) => {
  try {
    const recipe = await findOwnedRecipe(req.params.recipeId, req.session.user._id);
    if (!recipe) return res.redirect('/recipes');

    await Recipe.deleteOne({ _id: recipe._id });

    // Optional: also pull from user.recipes
    // await User.findByIdAndUpdate(req.session.user._id, { $pull: { recipes: recipe._id } });

    res.redirect('/recipes');
  } catch (err) {
    console.error(err);
    res.redirect('/recipes');
  }
});

module.exports = router;
