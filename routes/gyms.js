const express = require('express');
const router = express.Router();
const gyms = require('../controllers/gyms');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isGymAuthor } = require('../middlewares');
const multer = require('multer');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage: storage });

router.route('/')
    .get(catchAsync(gyms.index))
    .post(isLoggedIn, upload.array('images', 8), catchAsync(gyms.createGym));

router.get('/new', isLoggedIn, gyms.renderNewForm);

router.route('/:id')
    .get(catchAsync(gyms.showGym))
    .put(isLoggedIn, isGymAuthor, upload.array('images'), catchAsync(gyms.updateGym))
    .delete(isLoggedIn, isGymAuthor, catchAsync(gyms.deleteGym));

router.get('/:id/edit', isLoggedIn, isGymAuthor, catchAsync(gyms.renderEditForm));

module.exports = router;