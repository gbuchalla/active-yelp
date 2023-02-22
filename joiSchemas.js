const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} não pode incluir HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);


const joiGymSchema = Joi.object({
    title: Joi.string()
        .required()
        .escapeHTML(),

    location: Joi.string()
        .required()
        .escapeHTML(),
    
    geometry: Joi.object({
        type: Joi.string().valid('Point').required(),

        coordinates: Joi.array().items(Joi.number()).length(2).required()
    }),

    description: Joi.string()
        .required()
        .escapeHTML(),
    
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
        .escapeHTML()
});

const joiUserSchema = Joi.object({
    username: Joi.string()
        .required(),

    password: Joi.string()
        .required()

});

module.exports = { joiGymSchema, joiReviewSchema, joiUserSchema };