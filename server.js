// server.js
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();

const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Middleware
const isSignedIn = require('./middleware/is-signed-in.js');
const passUserToView = require('./middleware/pass-user-to-view.js');

// Controllers
const authController = require('./controllers/auth.js');
const foodsController = require('./controllers/foods.js');
const usersController = require('./controllers/users.js');

// Port
const port = process.env.PORT ? process.env.PORT : '3000';

// --- DB
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err.message);
});

// --- CORE MIDDLEWARE
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(express.static('public')); // serve CSS, images, etc.
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  })
);
app.use(passUserToView);

// --- ROUTES
app.get('/', (req, res) => {
  res.render('index.ejs');
});
app.use('/auth', authController);

app.use(isSignedIn);
app.use('/users/:userId/foods', foodsController);
app.use('/users', usersController);

app.get('/vip-lounge', (req, res) => {
  res.send(`Welcome to the party ${req.session.user.username}.`);
});

// --- START
app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});

