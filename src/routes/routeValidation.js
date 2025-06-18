const routeSchema = require("../schemas/routeSchema");
const approveSchema = require("../schemas/approveSchema");
const bankSchema = require("../schemas/bankSchema");

module.exports = {
    GET_ROUTE: routeSchema.getDataSchema,
    GET_ROUTE_ID: routeSchema.getDataIdSchema,
    CREATE_ROUTE: routeSchema.insertDataSchema,
    UPDATE_ROUTE: routeSchema.updateDataSchema,
    DELETE_ROUTE: routeSchema.deleteDataSchema,
    
    GET_APPROVE: approveSchema.getData,
    UPDATE_APPROVE: approveSchema.updateDataSchema,

    GET_BANK: bankSchema.getDataSchema,
    GET_BANK_ID: bankSchema.getDataIdSchema,
    CREATE_BANK: bankSchema.insertDataSchema,
    UPDATE_BANK: bankSchema.updateDataSchema,
    DELETE_BANK: bankSchema.deleteDataSchema,
};