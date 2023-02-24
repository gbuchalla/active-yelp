const Gym = require('./models/gym');
const Review = require('./models/review'); 
const ExpressError = require('./utils/newExpressError')

const isLoggedIn = (req, res, next) => {
    if (!req.user) {
        req.session.returnTo = req.originalUrl.substring(0, req.originalUrl.indexOf('/reviews'));
        req.flash('error', 'É necessário entrar em uma conta para fazer isso');
        return res.redirect('/login');
    }
    next();
}

const isGymAuthor = async (req, res, next) => {
    const foundGym = await Gym.findById(req.params.id);
    if (String(req.user._id) !== String(foundGym.author._id)) {
        req.flash('error', 'É necessário ter a autoria da academia para fazer isso');
        return res.redirect(`/campgrounds/${req.params.id}`);
    };
    next();
};

const isReviewAuthor = async (req, res, next) => {
    const foundReview = await Review.findById(req.params.reviewId);
    if (String(req.user._id) !== String(foundReview.author._id)) {
        req.flash('error', 'É necessário ter a autoria da review para fazer isso');
        return res.redirect(`/gyms/${req.params.id}`)
    };
    next();
};

module.exports = { isLoggedIn, isGymAuthor, isReviewAuthor }