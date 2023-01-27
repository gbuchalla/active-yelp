const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');

const Gym = require('./models/gym');


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

// Homepage route
app.get('/', (req, res) => {
    res.send('Homepage');
});

// Gyms routes
app.get('/gyms', async (req, res) => {
    const allGyms = await Gym.find({});
    res.render('index', { gyms: allGyms });
});

app.get('/gyms/new', (req, res) => {
    res.render('new');
});

app.post('/gyms', async (req, res) => {
    const newGym = new Gym(req.body.gym);
    await newGym.save();
    res.redirect('/gyms');
});

app.get('/gyms/:id', async (req, res) => {
    const { id } = req.params;
    const foundGym = await Gym.findById(id);
    res.render('show', { gym: foundGym });
});

app.get('/gyms/:id/edit', async (req, res) => {
    const { id } = req.params;
    const foundGym = await Gym.findById(id);
    res.render('edit', { gym: foundGym });
})

app.put('/gyms/:id', async (req, res) => {
    const { id } = req.params;
    await Gym.findByIdAndUpdate(id, req.body.gym)
    res.redirect(`/gyms/${id}`);
});

app.delete('/gyms/:id', async (req, res) => {
    const { id } = req.params;
    await Gym.findByIdAndDelete(id);
    res.redirect('/gyms');
});

// Server config
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servindo na porta ${port}`);
});