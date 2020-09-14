const Joi = require('@hapi/joi');
const validation = {};

validation.validateParameters = async (parameters) => {
    const schema = Joi.object().keys({
        email: Joi.string()
            .email({ minDomainSegments: 2 })
            .required(),
    });

    return schema.validateAsync(parameters);
};

module.exports = validation;
