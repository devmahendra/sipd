const { logData } = require("../logger");
const defaultResponse = require("../response/responseDefault");

/**
 * Checks if user has the required permission.
 * @param {object} user
 * @param {string} menuId
 * @param {string} action - 'r', 'c', etc.
 * @returns {boolean}
 */
const hasPermission = (user, menuId, action) => {
    if (!user || !Array.isArray(user.menus)) return false;
    const permission = user.menus.find(menu => menu.id === Number(menuId));
    return !!(permission && permission[action]);
};

const checkPermission = (req, res, permissionType, processName) => {
    const { user, menuId } = req;
    const httpCode = 403;

    if (!hasPermission(user, menuId, permissionType)) {
        const message = `Permission denied for user ${user?.id || "unknown"}`;
        logData({
            level: "warn",
            processName,
            data: message,
            httpCode,
        });
        res.status(httpCode).json(defaultResponse("FORBIDDEN", message, req));
        return false;
    }

    return true;
};

module.exports = checkPermission;
