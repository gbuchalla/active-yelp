const express = require('express');
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews');
const { isLoggedIn, isReviewAuthor } = require('../middlewares');
const catchAsync = require('../utils/catchAsync');

router.post('/', isLoggedIn, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;