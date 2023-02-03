const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const Gym = require('./models/gym');
const User = require('./models/user');
const Review = require('./models/review');
const ExpressError = require('./utils/newExpressError');
const catchAsync = require('./utils/catchAsync');


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
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res, next) => {
    const { username, password } = req.body
    User.register({ username }, password, (err, newUser) => {
        if (err) {
            return next(new ExpressError(err.status, `Algo deu errado no registro de usuário: ${err.message}`));
        }
        console.log('Usuário registrado com sucesso.\nUsuário:', newUser);
        req.login(newUser, e => {
            if (e) return next(e);
            console.log('req.user:', req.user);
            res.redirect('/gyms');
        })
    })
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/gyms')
});

app.post('/logout', (req, res) => {
    req.logout(err => {
        if (err) return next(err);
    });
    res.redirect('/gyms');
});

// Gyms routes
app.get('/gyms', catchAsync(async (req, res) => {
    const allGyms = await Gym.find({});
    console.log('req.user', req.user);
    res.render('index', { gyms: allGyms, user: req.user });
}));

app.get('/gyms/new', (req, res) => {
    res.render('new');
});

app.post('/gyms', catchAsync(async (req, res, next) => {
    if (Object.values(req.body.gym).some((data) => data === '')) {
        next(new ExpressError(400, 'Dado inserido da academia considerado inválido'));
    } else {
        const newGym = new Gym(req.body.gym);
        await newGym.save();
        res.redirect(`/gyms/${newGym._id}`);
    }
}));

app.get('/gyms/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundGym = await Gym.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        });
    res.render('show', { gym: foundGym, user: req.user });
}));

app.get('/gyms/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundGym = await Gym.findById(id);
    res.render('edit', { gym: foundGym });
}));

app.put('/gyms/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Gym.findByIdAndUpdate(id, req.body.gym)
    res.redirect(`/gyms/${id}`);
}));

app.delete('/gyms/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Gym.findByIdAndDelete(id);
    res.redirect('/gyms');
}));

// Review routes
app.post('/gyms/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const { rating, description } = req.body.review;
    const newReview = new Review({ rating, description, author: req.user });
    const foundGym = await Gym.findById(id);
    foundGym.reviews.push(newReview);
    await newReview.save();
    await foundGym.save();
    res.redirect(`/gyms/${id}`);
}));

app.delete('/gyms/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    const foundGym = await Gym.findById(id);
    foundGym.reviews.pull({ _id: reviewId });
    foundGym.save();
    res.redirect(`/gyms/${id}`)
}));


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