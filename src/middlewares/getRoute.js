const { getRoutes } = require("../repositories/routeRepository");
const { logData } = require("../helpers/logger");
const { STATUS_ACTIVE } = require('../constants/statusType');

module.exports = async function getRouteConfigs() {
    let processName = "GET_ROUTES";
    const status = STATUS_ACTIVE;

    try {
        const rows = await getRoutes(status);
        if (!rows.length) {
            logData({
                level: "warn",
                processName,
                data: "No active routes found in database",
            });
            return {};
        }

        const routeMap = {};
        for (const route of rows) {
            routeMap[route.name] = {
                ...route,
                menu_ids: route.menu_ids || [], // array of menu_id
            };
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