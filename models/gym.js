const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
    title: String,
    location: String,
    price: String,
    description: String,
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

const Gym = mongoose.model('Gym', gymSchema);

module.exports = Gym;