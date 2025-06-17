const Joi = require("joi");

exports.getDataSchema = {
    body: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).default(10),
    }),
};

exports.insertDataSchema = {
    body: Joi.object({
        name: Joi.string().max(100).required(),
        path: Joi.string().pattern(/^\/[\w\-\/]*$/).required(), // must start with /
        method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH').required(),
        isProtected: Joi.boolean().required(),
        internal: Joi.boolean().required(),
        description: Joi.string().allow('', null),
        menuId: Joi.number().integer().allow('', null),
        actionType: Joi.string().valid('c', 'r', 'u', 'd').required()
    }),
};

exports.approveDataSchema = {
    params: Joi.object({
      id: Joi.allow(null),
    }),
    body: Joi.object({
        changes: Joi.object({}).unknown(true),
        status: Joi.number().integer().valid(2, 5).required(),
        actionType: Joi.string().valid('c', 'r', 'u', 'd').required()
    }),
};