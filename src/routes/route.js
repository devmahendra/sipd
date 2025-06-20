const express = require("express");
const router = express.Router();
const getRouteConfigs = require("../middlewares/getRoute");
const getToken = require("../middlewares/getToken");
const validateRequest = require("../middlewares/validateRequest");
const handlerMap = require("./routeHandler");
const validationMap = require("./routeValidation");
const { logData } = require("../helpers/logger");

module.exports = async function initializeRoutes(app) {
    const routeConfigsObj = await getRouteConfigs();
    const routeConfigs = Object.values(routeConfigsObj);
    let processName = "GET_ROUTES";

    routeConfigs.forEach((route) => {
        const middlewares = [
        (req, res, next) => {
            req.routeConfig = route;
            req.routeId = route.id;
            req.routeName = route.name;
            req.menuIds = route.menu_ids;
            next();
        },
        ];

        if (route.protected) {
            middlewares.push(getToken);
        }

        if (validationMap[route.name]) {
            route.validation = validationMap[route.name];
            middlewares.push(validateRequest(route));
        }

        const handler = handlerMap[route.name];

        if (!handler) {
            logData({
                level: "warn",
                processName,
                data: `No handler for route ${route.name}`,
            });
            return;
        }

        router[route.method.toLowerCase()](route.path, ...middlewares, handler);
    });

    app.use("/api", router);
};
