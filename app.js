const express = require('express');
const app = express();
const path = require('path');
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

// Gyms routes
app.get('/gyms', async (req, res) => {
    res.send('index route');
});

app.get('/gyms/new', (req, res) => {
    res.send('index route') 
});

app.post('/gyms', async (req, res) => {
    // create gym route handler
});

app.get('/gyms/:id', async (req, res) => {
    res.send('index route')  
});

app.get('/gyms/:id/edit', async (req, res) => {
    res.send('index route') 
})

app.put('/gyms/:id', async (req, res) => {
    // update gym route handler
});

app.delete('/gyms/:id', async (req, res) => {
    // delete gym route handler
});

// Server config
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servindo na porta ${port}`);
});