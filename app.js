const express = require('express');
const app = express();
const path = require('path');

// Setups e instanciamentos do Express
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

// Gyms routes
app.get('/gyms', async (req, res) => {
    // 
});

app.get('/gyms/new', (req, res) => {
    // 
});

app.post('/gyms', async (req, res) => {
    //
});

app.get('/gyms/:id', async (req, res) => {
    //  
});

app.get('/gyms/:id/edit', async (req, res) => {
    // 
})

// Server config
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servindo na porta ${port}`);
});