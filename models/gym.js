const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
    title: String,
    location: String,
    price: String,
    description: String,
});

const Gym = mongoose.model('Gym', gymSchema);

module.exports = Gym;