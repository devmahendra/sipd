const routeController = require("../controllers/routeController");
const approveController = require("../controllers/approveController");
const bankController = require("../controllers/bankController");
const userController = require("../controllers/userController");

module.exports = {
    GET_ROUTE: routeController.getData,
    GET_ROUTE_ID: routeController.getDataById,
    CREATE_ROUTE: routeController.insertData,
    UPDATE_ROUTE: routeController.updateData,
    DELETE_ROUTE: routeController.deleteData,
    
    GET_APPROVE: approveController.getData,
    GET_APPROVE_ID: approveController.getDataById,
    UPDATE_APPROVE: approveController.approveData,
    B_UPDATE_APPROVE: approveController.approveDataBulk,

    GET_BANK: bankController.getData,
    GET_BANK_ID: bankController.getDataById,
    CREATE_BANK: bankController.insertData,
    UPDATE_BANK: bankController.updateData,
    DELETE_BANK: bankController.deleteData,

    GET_USER: userController.getData,
    GET_USER_ID: userController.getDataById,
    CREATE_USER: userController.insertData,
    B_CREATE_USER: userController.insertDataBulk,
    UPDATE_USER: userController.updateData,
    B_UPDATE_USER: userController.updateDataBulk,
    DELETE_USER: userController.deleteData,
    B_DELETE_USER: userController.deleteDataBulk,
};