const Joi = require('@hapi/joi');
const validation = {};

validation.validateParametersRecoverAccount = async (parameters) => {
    const schema = Joi.object().keys({
        email: Joi.string()
            .email({ minDomainSegments: 2 })
            .required(),
    });

    return schema.validateAsync(parameters);
};

validation.validateParametersRecoverPassword = async (parameters) => {
    const schema = Joi.object().keys({
        token: Joi.object().required(),
        newPassword: Joi.string()
            .trim()
            .min(6)
            .max(255)
            .required(),
        confirmPassword: Joi.string()
            .trim()
            .min(6)
            .max(255)
            .required(),
    });

    return schema.validateAsync(parameters);
};

module.exports = validation;
