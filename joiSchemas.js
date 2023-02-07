const Joi = require('joi');

const joiGymSchema = Joi.object({
    title: Joi.string()
        .required(),

    location: Joi.string()
        .required(),

    description: Joi.string()
        .required(),
    
    images: Joi.array()
        .items(Joi.object({
            url: Joi.string(),
            fileName: Joi.string()
        }).required())
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