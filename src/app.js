const path = require('path');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const webRoutes = require('./routes/webRoutes');
const apiRoutes = require('./routes/apiRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

if (env.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 8 * 60 * 60 * 1000 },
  })
);

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((req, res, next) => {
  res.locals.appName = 'EquiWork';
  next();
});

app.use('/api', apiRoutes);
app.use(webRoutes);

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'Recurso no encontrado' });
  }
  res.status(404).render('pages/error', {
    title: 'No encontrado',
    message: 'La página solicitada no existe',
    status: 404,
  });
});

app.use(errorHandler);

module.exports = app;
