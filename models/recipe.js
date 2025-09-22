// models/recipe.js
const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    instructions: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ingredients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recipe', recipeSchema);
