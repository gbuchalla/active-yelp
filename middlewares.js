const Gym = require('./models/gym');
const Review = require('./models/review'); 
const ExpressError = require('./utils/newExpressError')

const isLoggedIn = (req, res, next) => {
    if (!req.user) return next(new ExpressError(401, 'É necessário entrar em uma conta para fazer isso'));
    next();
}

const isGymAuthor = async (req, res, next) => {
    const foundGym = await Gym.findById(req.params.id);
    if (String(req.user._id) !== String(foundGym.author._id)) {
        return next(new ExpressError(401, 'É necessário ter a autoria da academia para fazer isso'));
    };
    next();
};

const isReviewAuthor = async (req, res, next) => {
    const foundReview = await Review.findById(req.params.reviewId);
    if (String(req.user._id) !== String(foundReview.author._id)) {
        return next(new ExpressError(401, 'É necessário ter a autoria da review para fazer isso'));
    };
    next();
};

module.exports = { isLoggedIn, isGymAuthor, isReviewAuthor }