const mongoose = require('mongoose');
const Review = require('./review');

const imageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    }
});

imageSchema.set('toJSON', { virtuals: true });

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('image/upload', 'image/upload/c_fill,h_200,w_200');
});

imageSchema.virtual('carouselUrl').get(function () {
    return this.url.replace('image/upload', 'image/upload/c_fill,ar_1.25');
});

imageSchema.virtual('previewCardUrl').get(function () {
    return this.url.replace('image/upload', 'image/upload/c_fill,ar_1.25');
});


const gymSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    geometry: { // Para GeoJSONs do tipo 'Point'
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // As APIs do mapbox exigem longitude como 1ª coordenada
            required: true
        }
    },
    description: {
        type: String,
        required: true
    },
    images: [imageSchema],
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