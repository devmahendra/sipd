const routeSchema = require("../schemas/routeSchema");
const approveSchema = require("../schemas/approveSchema");

module.exports = {
    GET_ROUTE: routeSchema.getDataSchema,
    CREATE_ROUTE: routeSchema.insertDataSchema,
    UPDATE_ROUTE: routeSchema.updateDataSchema,
    DELETE_ROUTE: routeSchema.deleteDataSchema,
    
    GET_APPROVE: approveSchema.getData,
    UPDATE_APPROVE: approveSchema.updateDataSchema,
};