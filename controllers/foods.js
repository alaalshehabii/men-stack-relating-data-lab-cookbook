const express = require('express');
const router = express.Router({ mergeParams: true });
const User = require('../models/user');

function ensureSelf(req, res, next) {
  if (!req.session?.user) return res.redirect('/auth/sign-in');
  if (String(req.session.user._id) !== String(req.params.userId)) {
    return res.status(403).send('Forbidden: not your pantry');
  }
  next();
}

// INDEX
router.get('/', ensureSelf, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    res.render('foods/index.ejs', { pantry: user?.pantry || [] });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// NEW
router.get('/new', ensureSelf, (req, res) => {
  res.render('foods/new.ejs');
});

// CREATE
router.post('/', ensureSelf, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    user.pantry.push({ name: req.body.name });
    await user.save();
    res.redirect(`/users/${req.params.userId}/foods`);
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// EDIT
router.get('/:itemId/edit', ensureSelf, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const item = user.pantry.id(req.params.itemId);
    res.render('foods/edit.ejs', { item });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// UPDATE
router.put('/:itemId', ensureSelf, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const item = user.pantry.id(req.params.itemId);
    item.set({ name: req.body.name });
    await user.save();
    res.redirect(`/users/${req.params.userId}/foods`);
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// DELETE
router.delete('/:itemId', ensureSelf, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const item = user.pantry.id(req.params.itemId);
    if (item) item.deleteOne();
    await user.save();
    res.redirect(`/users/${req.params.userId}/foods`);
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = router;
