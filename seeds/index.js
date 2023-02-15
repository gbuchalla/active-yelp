const mongoose = require('mongoose');
const Gym = require('../models/gym');
const Review = require('../models/review');

const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

const dbUrl = 'mongodb://127.0.0.1:27017/active-yelp';

mongoose.connect(dbUrl)
    .then(() => console.log('Conexão estabelecida com o MongoDB.'))
    .catch((err) => console.log('Algo deu errado na conexão com o MongoDB', err));
mongoose.connection.on('error', error => {
    console.log(`Um erro ocorreu na conexão com a database.\nErro:\n${error}`)
});

const gymTitles = [];
const gymCities = [];
const gymCoordinates = [];

// Número de seed gyms = i.
for (let i = 1; i <= 150; i++) {
    const descriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
    const place = places[Math.floor(Math.random() * places.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    gymTitles[i - 1] = descriptor + ' ' + place;
    gymCities[i - 1] = city.nome + ', ' + city.estado;
    gymCoordinates[i - 1] = [city.longitude, city.latitude];  // As APIs do mapbox exigem longitude como 1ª coordenada
};


const gyms = [];

for (let i = 0; i < gymTitles.length; i++) {
    gyms.push({
        title: gymTitles[i],
        location: gymCities[i],
        geometry: {
            type: 'Point',
            coordinates: gymCoordinates[i]
        },
        description: 'Academia espaçosa, cheia de equipamentos e com uma equipe atenciosa.',
        images: [{
            url: `https://source.unsplash.com/random/?empty-gym&${i}`, // Adição parâmetros aleatórios (i e i+0.5) para variar as imagens geradas.
            fileName: `gymImage${i}`
        },
        {
            url: `https://source.unsplash.com/random/?empty-gym&${i + 0.5}`,
            fileName: `gymImage${i + 0.5}`
        }],
        author: "63dffe88c49295fa4e990043" // _id de um user da database utilizada
    })
};

//*Caso queira DELETAR todas gyms e reviews existentes, e então adicionar as seeds:

Gym.deleteMany({}).then(async (res) => {
    console.log('Gyms deletadas:', res);
    await Review.deleteMany({}).then(results => console.log('Reviews deletadas:', results));
    await Gym.insertMany(gyms).then(docs => console.log(docs));
    await mongoose.connection.close().then(() => console.log('conexão com a database encerrada'));
})
    .catch(err => console.log(err));


//*Caso queira SÓ INSERIR as seeds, sem deletar nada antes:

// Gym.insertMany(gyms, (err, docs) => {
//     if (err) return console.log(err);
//     console.log(docs)
//     mongoose.connection.close().then(() => console.log('conexão com a database encerrada'));
//  });




