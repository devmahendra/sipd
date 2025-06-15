const routeController = require("../controllers/routeController");
const approveController = require("../controllers/approveController");

module.exports = {
    GET_ROUTE: routeController.getData,
    CREATE_ROUTE: routeController.insertData,
    UPDATE_ROUTE: routeController.updateData,
    DELETE_ROUTE: routeController.deleteData,
    
    GET_APPROVE: approveController.getData,
    UPDATE_APPROVE: approveController.approveData,
};