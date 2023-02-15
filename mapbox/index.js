// Public access token do mapbox
const accessToken = 'pk.eyJ1IjoiZ3VpZ2JmIiwiYSI6ImNsODF1bGYxMTBlczkzcWwxMHZraGo5eHQifQ.TzbXZaREcejUYaVJ74UP8Q'

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: accessToken});

// Wrapper para o método forwardGeocode. Leva só a localização como parâmetro e apresenta só resultados para o Brasil.
const forwardGeocode = function (location) {
    return geocodingClient.forwardGeocode({
        query: location,
        countries: ['br'], // País(es) nos quais realizar a busca.
        limit: 3 // Número de resultados fornecidos.
    }).send();
};

module.exports = forwardGeocode;