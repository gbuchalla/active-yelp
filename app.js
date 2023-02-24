const dotenv = require('dotenv').config();
if (dotenv.error) throw dotenv.error;

const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const engine = require('ejs-mate')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const User = require('./models/user');
const ExpressError = require('./utils/newExpressError');
const userRoutes = require('./routes/users');
const gymRoutes = require('./routes/gyms');
const reviewRoutes = require('./routes/reviews');


// Setup e tratamento de erros da conexão com a database
mongoose.set('strictQuery', false);

const localDb = 'mongodb://127.0.0.1:27017/active-yelp'
const dbUrl = (process.env.NODE_ENV === 'production') ? process.env.DB_URL : localDb

mongoose.connect(dbUrl)
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

app.use(mongoSanitize({ replaceWith: '_' }));
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
}));

// URLs para config do HTTP header 'Content Security Policy', usado pelo Helmet
const scriptSrcUrls = [
    'https://stackpath.bootstrapcdn.com',
    'https://api.tiles.mapbox.com',
    'https://api.mapbox.com',
    'https://kit.fontawesome.com',
    'https://cdnjs.cloudflare.com',
    'https://cdn.jsdelivr.net',
];
const styleSrcUrls = [
    'https://kit-free.fontawesome.com',
    'https://stackpath.bootstrapcdn.com',
    'https://cdn.jsdelivr.net',
    'https://api.mapbox.com',
    'https://api.tiles.mapbox.com',
    'https://fonts.googleapis.com',
    'https://use.fontawesome.com',
];
const connectSrcUrls = [
    'https://api.mapbox.com',
    'https://*.tiles.mapbox.com',
    'https://events.mapbox.com',
];
const fontSrcUrls = [];

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["blob:"],
        objectSrc: [],
        imgSrc: [
            "'self'",
            'blob:',
            'data:',
            `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
            'https://images.unsplash.com',
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
    },
}));


const store = new MongoDBStore({
    uri: dbUrl,
    databaseName: 'active-yelp',
    collection: 'sessions'
}, function (error) {
    if (error) console.log('MongoDBStore connection error', error)
});

store.on('error', (err) => {
    console.log('session db store error:\n', err);
});

const sessionConfig = {
    name: 'session.name',
    secret: 'randomsecret',
    store: store,
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 semana
        secure: (process.env.NODE_ENV === 'production') ? true : null // Usar somente em modo de production, em https
    }
};

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
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    next();
});

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

app.use(async (err, req, res, next) => {
    let { statusCode = 500, message = 'Ops, algo deu errado.' } = err;
    if (err.name === 'ValidationError') statusCode = 400;
    res.status(statusCode).render('error', { err });
});

// Configuração do servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servindo na porta ${port}`);
});