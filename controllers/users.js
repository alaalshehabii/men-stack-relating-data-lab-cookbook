const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Community index
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, { username: 1 }).sort({ username: 1 });
    res.render('users/index.ejs', { users });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Show user pantry
router.get('/:userId', async (req, res) => {
  try {
    const otherUser = await User.findById(req.params.userId);
    res.render('users/show.ejs', { otherUser, pantry: otherUser?.pantry || [] });
  } catch (err) {
    console.error(err);
    res.redirect('/users');
  }
});

module.exports = router;
