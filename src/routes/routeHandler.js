const routeController = require("../controllers/routeController");
const approveController = require("../controllers/approveController");
const bankController = require("../controllers/bankController");

module.exports = {
    GET_ROUTE: routeController.getData,
    GET_ROUTE_ID: routeController.getDataById,
    CREATE_ROUTE: routeController.insertData,
    UPDATE_ROUTE: routeController.updateData,
    DELETE_ROUTE: routeController.deleteData,
    
    GET_APPROVE: approveController.getData,
    GET_APPROVE_ID: approveController.getDataById,
    UPDATE_APPROVE: approveController.approveData,

    GET_BANK: bankController.getData,
    GET_BANK_ID: bankController.getDataById,
    CREATE_BANK: bankController.insertData,
    UPDATE_BANK: bankController.updateData,
    DELETE_BANK: bankController.deleteData,
};