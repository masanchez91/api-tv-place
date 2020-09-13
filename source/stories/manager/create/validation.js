const Joi = require('@hapi/joi');
const validation = {};

validation.validateParameters = parameters => {
	const schema = Joi.object().keys({
		name: Joi.string()
			.trim()
			.min(4)
			.max(180)
			.required(),
		lastName: Joi.string()
			.trim()
			.min(4)
			.max(180)
			.required(),
		email: Joi.string()
			.email({ minDomainSegments: 2 })
			.required(),
		phone: Joi.string()
			.trim()
			.min(10)
			.max(13)
			.optional(),
	});

	return schema.validateAsync(parameters);
}

module.exports = validation;
