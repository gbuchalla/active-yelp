// Public Acccess Token do mapbox
const accessToken = 'pk.eyJ1IjoiZ3VpZ2JmIiwiYSI6ImNsODF1bGYxMTBlczkzcWwxMHZraGo5eHQifQ.TzbXZaREcejUYaVJ74UP8Q'

mapboxgl.accessToken = accessToken;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: gym.geometry.coordinates, // Importante usar JSON.stringify.
    zoom: 9,
    projection: 'globe'
});
map.on('style.load', () => {
    map.setFog({});
});

// Adiciona marcadores nas coordenadas da gym.
const marker = new mapboxgl.Marker({ color: 'darkGreen' })
    .setLngLat(gym.geometry.coordinates)
    .addTo(map)
    
// Adiciona zoom e controle de rotação ao mapa.
const nav = new mapboxgl.NavigationControl({
    visualizePitch: true // permite rotacionar o mapa em torno da 'direção X'
});
map.addControl(nav, 'top-right');