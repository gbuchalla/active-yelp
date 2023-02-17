const { joiReviewSchema } = require('../joiSchemas');
const Gym = require('../models/gym');
const Review = require('../models/review');

const createReview = async (req, res) => {
    const { id } = req.params;
    const validReviewData = await joiReviewSchema.validateAsync(req.body.review);
    const newReview = new Review({ ...validReviewData, author: req.user });
    const foundGym = await Gym.findById(id);
    foundGym.reviews.push(newReview);
    await newReview.save();
    await foundGym.save();
    req.flash('success', 'Review adicionada!');
    res.redirect(`/gyms/${id}`);
};

const deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const foundGym = await Gym.findById(id);
    await Review.findByIdAndDelete(reviewId);
    foundGym.reviews.pull({ _id: reviewId });
    await foundGym.save();
    req.flash('info', 'A review foi removida com sucesso');
    res.redirect(`/gyms/${id}`)
};

module.exports = { createReview, deleteReview };

