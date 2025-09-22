// models/user.js
const mongoose = require('mongoose');

// Keep the embedded Food schema (from your pantry feature)
const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },

    // Pantry (embedded) — from the Foods lab
    pantry: [foodSchema],

    // NEW: reference recipes (one-to-many: User -> Recipe)
    recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
