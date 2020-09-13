const Joi = require('@hapi/joi');
const validation = {};

validation.validateParameters = async (parameters) => {
    const schema = Joi.object().keys({
        email: Joi.string()
			.email({ minDomainSegments: 2 })
			.required(),
        password: Joi.string()
            .trim()
            .max(255)
            .required(),
    });
    return schema.validateAsync(parameters);
};

module.exports = validation;
