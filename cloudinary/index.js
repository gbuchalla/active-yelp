const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dmxxtoux0',
    api_key: '776224441799444',
    api_secret: 'F2af_AFQcj51duFMBjaHivFKnFs',
    secure: true
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'active-yelp',
        allowed_formats: ['png', 'jpg', 'jpeg']
    },
});

module.exports = { cloudinary, storage };

// cloudinary.v2.api
//     .delete_resources(['image1', 'image2'])
//     .then(result => console.log(result));