const dotenv = require('dotenv').config();
if (dotenv.error) throw dotenv.error;

const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const multer = require('multer');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const Gym = require('./models/gym');
const User = require('./models/user');
const Review = require('./models/review');
const { joiGymSchema, joiReviewSchema, joiUserSchema } = require('./joiSchemas');
const ExpressError = require('./utils/newExpressError');
const catchAsync = require('./utils/catchAsync');
const { isLoggedIn, isGymAuthor, isReviewAuthor } = require('./middlewares');
const { cloudinary, storage } = require('./cloudinary/index');
const users = require('./controllers/users');
const gyms = require('./controllers/gyms');
const reviews = require('./controllers/reviews');


const upload = multer({ storage: storage });

// Setup e tratamento de erros da conexão com a database
mongoose.connect('mongodb://127.0.0.1:27017/active-yelp')
    .then(() => console.log('Conectado com a database'))
    .catch(error => console.log(`Algo deu errado na conexão inicial com a database.\n Erro:\n ${error}`))

mongoose.connection.on('error', error => {
    console.log(`Um erro ocorreu na conexão com a database.\nErro:\n${error}`)
});

// Setups e instanciamentos do Express
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(session({ secret: 'random secret', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Homepage route
app.get('/', (req, res) => {
    res.send('Homepage');
});

// User routes
app.get('/register', users.renderRegister);

app.post('/register', catchAsync(users.register));

app.get('/login', users.renderLogin);

app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), users.login);

app.post('/logout', users.logout);

// Gyms routes
app.get('/gyms', catchAsync(gyms.index));

app.get('/gyms/new', isLoggedIn, gyms.renderNewForm);

app.post('/gyms', isLoggedIn, upload.array('images', 8), catchAsync(gyms.createGym));

app.get('/gyms/:id', catchAsync(gyms.showGym));

app.get('/gyms/:id/edit', isLoggedIn, isGymAuthor, catchAsync(gyms.renderEditForm));

app.put('/gyms/:id', isLoggedIn, isGymAuthor, upload.array('images'), catchAsync(gyms.updateGym));

app.delete('/gyms/:id', isLoggedIn, isGymAuthor, catchAsync(gyms.deleteGym));

// Review routes
app.post('/gyms/:id', isLoggedIn, catchAsync(reviews.createReview));

app.delete('/gyms/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));


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