const Joi = require("joi");
const { ACTIONS } = require("../constants/actionType");
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
        name: Joi.string().max(50).required(),
        bankCode: Joi.string().min(1).max(3).required(),
        bankSwift: Joi.string().min(1).max(20).required(),
        description: Joi.string().allow('', null).optional(),
    }),
};

exports.updateDataSchema = {
    params: Joi.object({
        id: Joi.number().integer().min(1).required(),
    }),
    body: Joi.object({
        name: Joi.string().max(50).allow('', null).optional(),
        bankCode: Joi.string().min(1).max(3).allow('', null).optional(), 
        bankSwift: Joi.string().min(1).max(20).allow('', null).optional(),
        description: Joi.string().allow('', null).optional(),
        status: Joi.number().valid(...STATUSES).optional().allow(null),
    }),
};

exports.deleteDataSchema = {
    params: Joi.object({
        id: Joi.number().integer().min(1).required(),
    }),
};