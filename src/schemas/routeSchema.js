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

exports.insertDataSchema = {
    body: Joi.object({
        name: Joi.string().max(100).required(),
        path: Joi.string().pattern(/^\/[\w\-\/]*$/).required(), // must start with /
        method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH').required(),
        isProtected: Joi.boolean().required(),
        internal: Joi.boolean().required(),
        description: Joi.string().allow('', null).optional(),
        menuId: Joi.number().integer().allow(null).optional(),
        actionType: Joi.string().valid(...ACTIONS).required()
    }),
};

exports.updateDataSchema = {
  params: Joi.object({
    id: Joi.number().integer().min(1).required(),
  }),
  body: Joi.object({
      name: Joi.string().max(100).optional().allow('', null),
      path: Joi.string().pattern(/^\/[\w\-\/]*$/).optional().allow('', null), // must start with /
      method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH').optional().allow('', null),
      isProtected: Joi.boolean().optional().allow(null),
      internal: Joi.boolean().optional().allow(null),
      description: Joi.string().allow('', null).optional(),
      menuId: Joi.number().integer().allow(null).optional(),
      actionType: Joi.string().valid(...ACTIONS).optional().allow('', null),
      status: Joi.number().valid(...STATUSES).optional().allow(null),
  }),
};

exports.deleteDataSchema = {
  params: Joi.object({
    id: Joi.number().integer().min(1).required(),
  }),
};