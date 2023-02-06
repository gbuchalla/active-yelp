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
const { cloudinary, storage } = require('./cloudinary/index');

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
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', catchAsync(async (req, res, next) => {
    const { username, password } = req.body
    await joiUserSchema.validateAsync({ username, password });
    User.register({ username }, password, (err, newUser) => {
        if (err) {
            return next(new ExpressError(err.status, `Algo deu errado no registro de usuário: ${err.message}`));
        }
        req.login(newUser, error => {
            if (error) {
                return next(new ExpressError(error.status, `Um erro ocorreu no login do usuário: ${error.message}`));
            }
            res.redirect('/gyms');
        });
    });
}));

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

app.post('/gyms', upload.array('images', 8), catchAsync(async (req, res, next) => {
    const gymImages = req.files.map(image => ({ url: image.path, fileName: image.filename }));
    const validGymData = await joiGymSchema.validateAsync({ ...req.body.gym, images: gymImages });
    const newGym = new Gym({ ...validGymData, author: req.user });
    await newGym.save();
    console.log(newGym);
    res.redirect(`/gyms/${newGym._id}`);
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
    const validGymData = await joiGymSchema.validateAsync(req.body.gym);
    await Gym.findByIdAndUpdate(id, validGymData);
    res.redirect(`/gyms/${id}`);
}));

app.delete('/gyms/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const foundGym = await Gym.findById(id);
    foundGym.images.forEach(async (image) => {
        await cloudinary.uploader.destroy(image.fileName).then(result => console.log(result));
    });
    await foundGym.delete();
    res.redirect('/gyms');
}));

// Review routes
app.post('/gyms/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const validReviewData = await joiReviewSchema.validateAsync(req.body.review);
    const newReview = new Review({ ...validReviewData, author: req.user });
    const foundGym = await Gym.findById(id);
    foundGym.reviews.push(newReview);
    await newReview.save();
    await foundGym.save();
    res.redirect(`/gyms/${id}`);
}));

app.delete('/gyms/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const foundGym = await Gym.findById(id);
    await Review.findByIdAndDelete(reviewId);
    foundGym.reviews.pull({ _id: reviewId });
    await foundGym.save();
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