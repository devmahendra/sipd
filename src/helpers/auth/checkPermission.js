const { logData } = require("../logger");
const defaultResponse = require("../response/responseDefault");


/**
 * Check if the user has a required permission for any of the given menu IDs
 * @param {object} user - Authenticated user with menus
 * @param {number[]|number} menuIds - Single menuId or array of menuIds
 * @param {string} action - One of 'r', 'c', 'u', 'd'
 * @returns {boolean}
 */
const hasPermission = (user, menuIds, action) => {
    if (!user || !Array.isArray(user.menus)) return false;

    const menuIdList = Array.isArray(menuIds) ? menuIds : [menuIds];

    return menuIdList.some((menuId) => {
        const permission = user.menus.find((menu) => menu.id === Number(menuId));
        return permission?.[action] === true;
    });
};

/**
 * Middleware permission checker
 * @param {Request} req 
 * @param {Response} res 
 * @param {string} permissionType - 'r', 'c', 'u', 'd'
 * @param {string} [processName] - Optional name for logging
 * @returns {boolean}
 */
const checkPermission = (req, res, permissionType, processName = "CHECK_PERMISSION") => {
    const { user, routeConfig } = req;
    const menuIds = routeConfig?.menu_ids || routeConfig?.menu_id;

    const httpCode = 403;

    if (!hasPermission(user, menuIds, permissionType)) {
        const message = `Permission denied for user ${user?.id || "unknown"} on menu ${menuIds}`;
        logData({
            level: "warn",
            processName,
            httpCode,
            data: message,
        });

        res.status(httpCode).json(defaultResponse("FORBIDDEN", message, req));
        return false;
    }

    return true;
};

/**
 * Checks if the user has permission to access approval data
 * based on the entity_name and their assigned menus.
 * @param {string} requiredAction - e.g., 'r', 'u'
 */
const checkApprovalPermission = (requiredAction) => {
    return (req, res, next) => {
        const processName = req.routeName || "CHECK_APPROVAL_PERMISSION";
        const user = req.user;
        const menuIds = req.menuIds || [];

        const entityName = req.body?.filters?.find(f => f.field === "entityName")?.value;

        if (!entityName) {
            const message = `Missing 'entityName' in request filters`;
            logData({ level: "warn", processName, data: message });
            return res.status(400).json(defaultResponse("INVALID_REQUEST", message, req));
        }

        if (!user || !Array.isArray(user.menus)) {
            const message = `Invalid user or missing permissions`;
            logData({ level: "warn", processName, data: message });
            return res.status(403).json(defaultResponse("FORBIDDEN", message, req));
        }

        const hasPermission = user.menus.some(menu =>
            Array.isArray(menu.entityNames) &&
            menu.entityNames.includes(entityName) &&
            menu[requiredAction] === true &&
            menuIds.includes(menu.id)
        );

        if (!hasPermission) {
            const message = `Permission denied for entity "${entityName}"`;
            logData({ level: "warn", processName, data: message });
            return res.status(403).json(defaultResponse("FORBIDDEN", message, req));
        }

        next();
    };
};


module.exports = { checkPermission, checkApprovalPermission};
