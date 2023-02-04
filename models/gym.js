const mongoose = require('mongoose');
const Review = require('./review');

const gymSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

gymSchema.post('findOneAndDelete', async (deletedGym) => {
    await Review.deleteMany({ _id: { $in: deletedGym.reviews } })
});

const Gym = mongoose.model('Gym', gymSchema);

module.exports = Gym;