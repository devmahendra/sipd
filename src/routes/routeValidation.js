const routeSchema = require("../schemas/routeSchema");
const approveSchema = require("../schemas/approveSchema");
const bankSchema = require("../schemas/bankSchema");
const userSchema = require("../schemas/userSchema");

module.exports = {
    GET_ROUTE: routeSchema.getDataSchema,
    GET_ROUTE_ID: routeSchema.getDataIdSchema,
    CREATE_ROUTE: routeSchema.insertDataSchema,
    UPDATE_ROUTE: routeSchema.updateDataSchema,
    DELETE_ROUTE: routeSchema.deleteDataSchema,
    
    GET_APPROVE: approveSchema.getData,
    GET_APPROVE_ID: approveSchema.getDataIdSchema,
    UPDATE_APPROVE: approveSchema.updateDataSchema,
    B_UPDATE_APPROVE: approveSchema.updateDataBulkSchema,

    GET_BANK: bankSchema.getDataSchema,
    GET_BANK_ID: bankSchema.getDataIdSchema,
    CREATE_BANK: bankSchema.insertDataSchema,
    UPDATE_BANK: bankSchema.updateDataSchema,
    DELETE_BANK: bankSchema.deleteDataSchema,

    GET_USER: userSchema.getDataSchema,
    GET_USER_ID: userSchema.getDataIdSchema,
    CREATE_USER: userSchema.insertDataSchema,
    B_CREATE_USER: userSchema.insertDataBulkSchema,
    UPDATE_USER: userSchema.updateDataSchema,
    B_UPDATE_USER: userSchema.updateDataBulkSchema,
    DELETE_USER: userSchema.deleteDataSchema,
    B_DELETE_USER: userSchema.deleteDataBulkSchema,
};