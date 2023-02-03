const mongoose = require('mongoose');
const Review = require('./review');

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

gymSchema.post('findOneAndDelete', async (deletedGym) => {
    await Review.deleteMany({ _id: { $in: deletedGym.reviews } })
});

const Gym = mongoose.model('Gym', gymSchema);

module.exports = Gym;