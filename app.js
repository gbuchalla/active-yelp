const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');

const Gym = require('./models/gym');
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

// Funções middleware

// Homepage route
app.get('/', (req, res) => {
    res.send('Homepage');
});

// Gyms routes
app.get('/gyms', catchAsync(async (req, res) => {
    const allGyms = await Gym.find({});
    res.render('index', { gyms: allGyms });
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
    const foundGym = await Gym.findById(id);
    res.render('show', { gym: foundGym });
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