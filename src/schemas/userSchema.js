const Joi = require("joi");
const { STATUSES } = require('../constants/statusType');

// 🔸 Reusable filter for GET
const filterSchema = Joi.object({
    field: Joi.string().required(),

    operator: Joi.string()
        .valid('ilike', '=', '>', '<', '>=', '<=', 'between')
        .required(),

    value: Joi.alternatives()
        .conditional('operator', {
        is: 'between',
        then: Joi.array()
            .length(2)
            .items(Joi.alternatives().try(Joi.string(), Joi.number(), Joi.date()))
            .required(),
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
        filters: Joi.array().items(filterSchema).default([]),
    }),
};

exports.getDataIdSchema = {
    params: Joi.object({
        id: Joi.number().integer().min(1).required(),
    }),
};

// 🔁 Common fields for insert/update
const userFieldSchema = {
    username: Joi.string().max(50).pattern(/^\S+$/),
    password: Joi.string().min(6).max(100).allow('', null),
    firstName: Joi.string().max(100).allow('', null),
    lastName: Joi.string().max(100).allow('', null),
    email: Joi.string().email().max(100).allow('', null),
    phoneNumber: Joi.string().max(20).allow('', null),
    avatarUrl: Joi.string().allow('', null),
    branchId: Joi.number().integer().min(1),
    roleId: Joi.number().integer().min(1),
    status: Joi.number().valid(...STATUSES).optional().allow(null),
};

// 🔸 Insert (with required fields)
const insertUserBase = Joi.object({
    ...userFieldSchema,
    username: userFieldSchema.username.required(),
    email: userFieldSchema.email.required(),
    branchId: userFieldSchema.branchId.required(),
    roleId: userFieldSchema.roleId.required(),
});

// 🔸 Update (requires ID, all else optional)
const updateUserBase = Joi.object({
    id: Joi.number().integer().min(1).required(),
    ...userFieldSchema,
});

exports.insertDataSchema = {
    body: insertUserBase,
};

exports.insertDataBulkSchema = {
    body: Joi.array().items(insertUserBase).min(1).max(100).required(),
};

exports.updateDataSchema = {
    params: Joi.object({
        id: Joi.number().integer().min(1).required(),
    }),
    body: updateUserBase.fork(['id'], schema => schema.forbidden()),
};

exports.updateDataBulkSchema = {
    body: Joi.array().items(updateUserBase).min(1).max(100).required(),
};

exports.deleteDataSchema = {
    params: Joi.object({
        id: Joi.number().integer().min(1).required(),
    }),
};

exports.deleteDataBulkSchema = {
    body: Joi.object({
        ids: Joi.array().items(Joi.number().integer().min(1)).min(1).max(100).required(),
    }),
};
