const dotenv = require('dotenv').config();
if (dotenv.error) throw dotenv.error;

const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const engine = require('ejs-mate')

const User = require('./models/user');
const ExpressError = require('./utils/newExpressError');
const userRoutes = require('./routes/users');
const gymRoutes = require('./routes/gyms');
const reviewRoutes = require('./routes/reviews');



// Setup e tratamento de erros da conexão com a database
mongoose.connect('mongodb://127.0.0.1:27017/active-yelp')
    .then(() => console.log('Conectado com a database'))
    .catch(error => console.log(`Algo deu errado na conexão inicial com a database.\n Erro:\n ${error}`))

mongoose.connection.on('error', error => {
    console.log(`Um erro ocorreu na conexão com a database.\nErro:\n${error}`)
});

// Setups e instanciamentos
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', engine);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const sessionConfig = {
    secret: 'random secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 semana,
        // secure: true // Utilizar só em ambiente de produção (deve ser utilizado somente em https).
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middlewares
app.use('*', (req, res, next) => {
    res.locals.user = req.user;
    res.locals.success = req.flash('success');
    res.locals.failure = req.flash('failure');
    res.locals.info = req.flash('info');
    next();
})

// Homepage route
app.get('/', (req, res) => {
    res.render('home', { user: req.user });
});

// Routes
app.use('/', userRoutes);
app.use('/gyms', gymRoutes);
app.use('/gyms/:id/reviews', reviewRoutes);


// Middleware de tratamento de erro

app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'Página não encontrada.'))
});

app.use((err, req, res, next) => {
    const { name, status = 500, message = 'Ops, algo deu errado.', stack } = err;
    res.status(status).send(`Error Message: ${message}... Error Stack: ${stack}`);
    console.log(`\nError\nName: ${name}\nStatus: ${status}\nMessage: ${message}\nStack: ${stack}\n\n Full Error:\n`, err);
});

// Configuração do servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servindo na porta ${port}`);
});