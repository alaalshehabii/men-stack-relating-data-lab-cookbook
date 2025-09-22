// controllers/ingredients.js
const express = require('express');
const router = express.Router();
const Ingredient = require('../models/ingredient');

// INDEX + CREATE form combined: GET /ingredients
router.get('/', async (req, res) => {
  try {
    const ingredients = await Ingredient.find({}).sort({ name: 1 });
    res.render('ingredients/index.ejs', { ingredients });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// CREATE: POST /ingredients
router.post('/', async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    if (!name) return res.redirect('/ingredients');

    // Avoid duplicate names (case-insensitive)
    const exists = await Ingredient.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (exists) return res.redirect('/ingredients');

    await Ingredient.create({ name });
    res.redirect('/ingredients');
  } catch (err) {
    console.error(err);
    res.redirect('/ingredients');
  }
});

module.exports = router;
