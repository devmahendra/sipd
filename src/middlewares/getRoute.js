const { getRoutes } = require("../repositories/routeRepository");
const { logData } = require("../helpers/logger");

module.exports = async function getRouteConfigs() {
    let processName = "GET_ROUTES";

    try {
        const rows = await getRoutes();

        if (!rows.length) {
            logData({
                processName,
                data: "No active routes found in database",
            });
            return {};
        }

        const routeMap = {};
        for (const route of rows) {
            routeMap[route.name] = route;
        }

        logData({
            processName,
            data: `Loaded ${rows.length} routes from database`,
        });

        return routeMap;
    } catch (err) {
        logData({
            level: "error",
            processName,
            data: `DB query failed: ${err.message}`,
        });
        return {};
    }
};