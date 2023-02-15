const Joi = require('joi');

const joiGymSchema = Joi.object({
    title: Joi.string()
        .required(),

    location: Joi.string()
        .required(),
    
    geometry: Joi.object({
        type: Joi.string().valid('Point').required(),

        coordinates: Joi.array().items(Joi.number()).length(2).required()
    }),

    description: Joi.string()
        .required(),
    
    images: Joi.array()
        .items(Joi.object({
            url: Joi.string().required(),
            
            fileName: Joi.string().required()
        }))
        .max(8)
});

const joiReviewSchema = Joi.object({
    rating: Joi.number()
        .valid(1, 2, 3, 4, 5)
        .required(),

    description: Joi.string()
        .required()
});

const joiUserSchema = Joi.object({
    username: Joi.string()
        .required(),

    password: Joi.string()
        .required()

});

module.exports = { joiGymSchema, joiReviewSchema, joiUserSchema };