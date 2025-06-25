const Joi = require("joi");
const { STATUS_ACTIVE, STATUS_REJECTED } = require('../constants/statusType');

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

exports.updateDataSchema = {
    params: Joi.object({
        id: Joi.number().integer().min(1).required(),
    }),
    body: Joi.object({
        status: Joi.number().integer().min(1).valid(STATUS_ACTIVE, STATUS_REJECTED).required(),
    }),
};

exports.updateDataBulkSchema = {
    body: Joi.array()
      .items(
        Joi.object({
          id: Joi.number().integer().min(1).required(),
          status: Joi.number()
            .valid(STATUS_ACTIVE, STATUS_REJECTED)
            .required(),
        })
      )
      .max(100)
      .required(),
};

exports.deleteDataSchema = {
    params: Joi.object({
        id: Joi.number().integer().min(1).required(),
    }),
};