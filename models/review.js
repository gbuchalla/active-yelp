const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rating: Number,
    description: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;