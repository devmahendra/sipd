const Joi = require("joi");
const { STATUSES } = require('../constants/statusType');

const filterSchema = Joi.object({
    field: Joi.string().required(),
  
    operator: Joi.string()
        .valid('ilike', '=', '>', '<', '>=', '<=', 'between')
        .required(),
  
    value: Joi.alternatives()
        .conditional('operator', {
            is: 'between',
            then: Joi.array().length(2).items(
            Joi.alternatives().try(Joi.string(), Joi.number(), Joi.date())
            ).required(),
            otherwise: Joi.alternatives().try(
            Joi.string(),
            Joi.number(),
            Joi.boolean(),
            Joi.date()
            ).required()
        })
});

exports.getDataSchema = {
    body: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).default(10),
        filters: Joi.array().items(filterSchema).default([])
    }),
};

exports.getDataIdSchema = {
    params: Joi.object({
        id: Joi.number().integer().min(1).required(),
    }),
};

exports.insertDataSchema = {
    body: Joi.object({
        username: Joi.string().max(50).required(),
        firstName: Joi.string().max(100).optional(),
        lastName: Joi.string().max(100).allow('', null).optional(),
        email: Joi.string().email().max(100).required(),
        phoneNumber: Joi.string().max(20).allow('', null).optional(),
        avatarUrl: Joi.string().allow('', null).optional(),
        branchId: Joi.number().integer().min(1).required(),
        roleId: Joi.number().integer().min(1).required()
      })
};

exports.updateDataSchema = {
    params: Joi.object({
        id: Joi.number().integer().min(1).required(),
    }),
    body: Joi.object({
        username: Joi.string().max(50).allow('', null).optional(),
        password: Joi.string().min(6).max(100).allow('', null).optional(),
        firstName: Joi.string().max(100).allow('', null).optional(),
        lastName: Joi.string().max(100).allow('', null).optional(),
        email: Joi.string().email().max(100).allow('', null).optional(),
        phoneNumber: Joi.string().max(20).allow('', null).optional(),
        avatarUrl: Joi.string().allow('', null).optional(),
        branchId: Joi.number().integer().min(1).required(),
        roleId: Joi.number().integer().min(1).required(),
        status: Joi.number().valid(...STATUSES).optional().allow(null),
    }),
};

exports.deleteDataSchema = {
    params: Joi.object({
        id: Joi.number().integer().min(1).required(),
    }),
};