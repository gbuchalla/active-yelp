const Gym = require('../models/gym');
const { joiGymSchema } = require('../joiSchemas');
const { cloudinary } = require('../cloudinary/index');
const forwardGeocode = require('../mapbox/index');


const index = async (req, res) => {
    const allGyms = await Gym.find({});
    res.render('gyms/index', { gyms: allGyms, user: req.user });
};

const renderNewForm = (req, res) => {
    res.render('gyms/new');
};

const createGym = async (req, res, next) => {
    const gymImages = req.files.map(image => ({ url: image.path, fileName: image.filename }));
    const geocodingResults = await forwardGeocode(req.body.gym.location);
    const { type, coordinates } = geocodingResults.body.features[0].geometry;
    const validGymData = await joiGymSchema.validateAsync({
        ...req.body.gym,
        geometry: { type, coordinates },
        images: gymImages
    });
    const newGym = new Gym({ ...validGymData, author: req.user });
    await newGym.save();
    req.flash('success', 'Academia registrada com sucesso!');
    res.redirect(`/gyms/${newGym._id}`);
};

const showGym = async (req, res) => {
    const { id } = req.params;
    const foundGym = await Gym.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
    if (!foundGym) {
        req.flash('failure', 'Não foi possível encontrar esta academia');
        return res.redirect('/gyms');
    };
    res.render('gyms/show', { gym: foundGym, user: req.user });
};

const renderEditForm = async (req, res) => {
    const { id } = req.params;
    const foundGym = await Gym.findById(id);
    if (!foundGym) {
        req.flash('failure', 'Não foi possível encontrar esta academia');
        return res.redirect('/gyms');
    };
    res.render('gyms/edit', { gym: foundGym });
};

const updateGym = async (req, res) => {
    const { id } = req.params;
    const newImages = req.files.map((image) => ({ url: image.path, fileName: image.filename }));
    const geocodingResults = await forwardGeocode(req.body.gym.location);
    const { type, coordinates } = geocodingResults.body.features[0].geometry;
    await joiGymSchema.validateAsync({ ...req.body.gym, geometry: { type, coordinates }, images: newImages });
    const foundGym = await Gym.findById(id);
    foundGym.set({...req.body.gym, geometry: { type, coordinates }});
    foundGym.images.push(...newImages);
    // Lógica de remoção das imagens selecionadas
    if (req.body.deleteImages) {
        const imageIndex = [];
        for (const image of foundGym.images) {
            if (req.body.deleteImages.includes(image.fileName)) {
                imageIndex.push(foundGym.images.indexOf(image));
            };
        };
        imageIndex.sort((a, b) => b - a);
        imageIndex.forEach(index => foundGym.images.splice(index, 1));
        await cloudinary.api.delete_resources(req.body.deleteImages)
            .then(result => console.log('Cloudinary images removal feedback:', result)); // Pode retirar o feedback
    };
    await foundGym.save();
    req.flash('success', 'Dados da academia atualizados!');
    res.redirect(`/gyms/${id}`);
};

const deleteGym = async (req, res) => {
    const { id } = req.params;
    const foundGym = await Gym.findById(id);
    foundGym.images.forEach(async (image) => {
        await cloudinary.uploader.destroy(image.fileName).then(result => console.log(result));
    });
    await foundGym.delete();
    req.flash('info', 'A academia foi removida com sucesso');
    res.redirect('/gyms');
};

module.exports = { index, renderNewForm, createGym, showGym, renderEditForm, updateGym, deleteGym };