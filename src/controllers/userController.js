const { ACTION_CREATE, ACTION_READ, ACTION_UPDATE, ACTION_DELETE } = require('../constants/actionType');
const { STATUS_PENDING } = require('../constants/statusType');
const userService = require('../services/userService');
const { checkPermission } = require('../helpers/auth/checkPermission');
const { respondSuccess, respondError } = require('../helpers/response/responseHandler');
const { responseBulk } = require('../helpers/response/responseHandlerBulk');
const { snakeToCamelArray, snakeToCamelObject } = require('../helpers/database/snakeToCamel');
const { convertFilterFieldsToSnakeCase } = require('../helpers/database/camelToSnake');
const getPaginationParams = require('../utils/pagination');
const { maskSensitive } = require('../utils/mask');

const getProcessName = (req) => req.routeConfig?.name || 'UnknownProcess';

const getData = async (req, res) => {
    req.body = req.body || {};
    
    const processName = getProcessName(req);
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, ACTION_READ, processName)) return;

    const { page, limit } = getPaginationParams(req);
    const filters = req.body.filters || [];
    const formattedFilters = convertFilterFieldsToSnakeCase(filters);

    try {
        const result = await userService.getData(page, limit, formattedFilters, processName);
        const formattedData = snakeToCamelArray(result.data).map(maskSensitive); 

        respondSuccess(res, req, 200, processName, {
            data: formattedData,
            pagination: {
                totalRecords: result.totalRecords,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
            },
        });
    } catch (error) {
        respondError(res, req, error.httpCode || 500, processName, error);
    }
};

const getDataById = async (req, res) => {
    const processName = getProcessName(req);
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, ACTION_READ, processName)) return;
    const id = parseInt(req.params.id);

    try {
        const result = await userService.getDataById(id, processName);
        const formattedData = maskSensitive(snakeToCamelObject(result)); // ✅ mask single object
        respondSuccess(res, req, 200, processName, formattedData);
    } catch (error) {
        respondError(res, req, error.httpCode || 500, processName, error);
    }
};

const insertData = async (req, res) => {
    const processName = getProcessName(req);
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, ACTION_CREATE, processName)) return;

    const entityNameApproval = 'users';
    const actionTypeApproval = ACTION_CREATE; 
    const pendingStatus = STATUS_PENDING;
    const requestedBy = req.user?.id || 1;
    const { username, firstName, lastName, email, phoneNumber, avatarUrl, branchId, roleId } = req.body;
    const users = {
        ...(username && { username }),
    };
    const userProfile = {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(phoneNumber && { phoneNumber }),
        ...(avatarUrl && { avatarUrl }),
    };
    const userBranch = {
        ...(branchId !== undefined && { branchId }),
    };
    const userRoles = {
        ...(roleId !== undefined && { roleId }),
    };

    try {
        await userService.insertData(
            { users, userProfile, userBranch, userRoles },
            { entityNameApproval, actionTypeApproval, pendingStatus, requestedBy },
            processName
        );
        respondSuccess(res, req, 200, processName, "Create request submitted successfully");
    } catch (error) {
        respondError(res, req, error.httpCode || 500, processName, error);
    }
};

const insertDataBulk = async (req, res) => {
    const processName = getProcessName(req);
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, ACTION_CREATE, processName)) return;
  
    const entityNameApproval = 'users';
    const actionTypeApproval = ACTION_CREATE;
    const pendingStatus = STATUS_PENDING;
    const requestedBy = req.user?.id || 1;
  
    const dataArray = req.body;
  
    return responseBulk({
        req,
        res,
        processName,
        dataArray,
        message: "Bulk insert completed successfully",
        callbackFn: async (data, _index, client) => {
            const { username, firstName, lastName, email, phoneNumber, avatarUrl, branchId, roleId } = data;
    
            const users = { ...(username && { username }) };
            const userProfile = { ...(firstName && { firstName }), ...(lastName && { lastName }), ...(email && { email }), ...(phoneNumber && { phoneNumber }), ...(avatarUrl && { avatarUrl }) };
            const userBranch = { ...(branchId !== undefined && { branchId }) };
            const userRoles = { ...(roleId !== undefined && { roleId }) };
    
            await userService.insertDataBulk(
                client,
                { users, userProfile, userBranch, userRoles },
                { entityNameApproval, actionTypeApproval, pendingStatus, requestedBy }
            );
        }
    });
};  

const updateData = async (req, res) => {
    const processName = getProcessName(req);
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, ACTION_UPDATE, processName)) return;

    const entityNameApproval = 'users';
    const actionTypeApproval = ACTION_UPDATE;
    const pendingStatus = STATUS_PENDING;
    const id = parseInt(req.params.id);
    const requestedBy = req.user?.id || 1;
    const { password, firstName, lastName, email, phoneNumber, avatarUrl, branchId, roleId, status } = req.body;
    const users = {
        ...(password && { password }),
        ...(status !== undefined && { status }),
    };
    const userProfile = {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(phoneNumber && { phoneNumber }),
        ...(avatarUrl && { avatarUrl }),
    };
    const userBranch = {
        ...(branchId !== undefined && { branchId }),
    };
    const userRoles = {
        ...(roleId !== undefined && { roleId }),
    };

    try {
        await userService.updateData(
            id,
            { users, userProfile, userBranch, userRoles },
            { entityNameApproval, actionTypeApproval, pendingStatus, requestedBy },
            processName
        );
        respondSuccess(res, req, 200, processName, "Update request submitted successfully");
    } catch (error) {
        respondError(res, req, error.httpCode || 500, processName, error);
    }
};

const updateDataBulk = async (req, res) => {
    const processName = getProcessName(req);
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, ACTION_UPDATE, processName)) return;

    const entityNameApproval = 'users';
    const actionTypeApproval = ACTION_UPDATE;
    const pendingStatus = STATUS_PENDING;
    const requestedBy = req.user?.id || 1;

    const dataArray = req.body;

    return responseBulk({
        req,
        res,
        processName,
        dataArray,
        message: "Bulk update request submitted successfully",
        callbackFn: async (data, _index, client) => {
            const { id, username, password, firstName, lastName, email, phoneNumber, avatarUrl, branchId, roleId, status } = data;

            const users = {
                ...(username && { username }),
                ...(password && { password }),
                ...(status !== undefined && { status }),
            };
            const userProfile = {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(email && { email }),
                ...(phoneNumber && { phoneNumber }),
                ...(avatarUrl && { avatarUrl }),
            };
            const userBranch = { ...(branchId !== undefined && { branchId }) };
            const userRoles = { ...(roleId !== undefined && { roleId }) };

            await userService.updateDataBulk(
                client,
                {
                    id: parseInt(id),
                    users,
                    userProfile,
                    userBranch,
                    userRoles
                },
                {
                    entityNameApproval,
                    actionTypeApproval,
                    pendingStatus,
                    requestedBy
                }
            );
        }
    });
};

const deleteData = async (req, res) => {
    const processName = getProcessName(req);
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, ACTION_DELETE, processName)) return;

    const entityNameApproval = 'users';
    const actionTypeApproval = ACTION_DELETE;
    const pendingStatus = STATUS_PENDING;
    const id = parseInt(req.params.id);
    const requestedBy = req.user?.id || 1;

    try {
        await userService.deleteData(
            id,
            { entityNameApproval, actionTypeApproval, pendingStatus, requestedBy },
            processName
        );
        respondSuccess(res, req, 200, processName, "Delete request submitted successfully");
    } catch (error) {
        respondError(res, req, error.httpCode || 500, processName, error);
    }
};

const deleteDataBulk = async (req, res) => {
    const processName = getProcessName(req);
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, ACTION_DELETE, processName)) return;

    const entityNameApproval = 'users';
    const actionTypeApproval = ACTION_DELETE;
    const pendingStatus = STATUS_PENDING;
    const requestedBy = req.user?.id || 1;

    const idArray = req.body?.ids?.map(id => parseInt(id)).filter(Boolean) || [];

    return responseBulk({
        req,
        res,
        processName,
        dataArray: idArray,
        message: "Bulk delete completed successfully",
        callbackFn: async (id, _index, client) => {
            await userService.deleteDataBulk(
                id,
                { entityNameApproval, actionTypeApproval, pendingStatus, requestedBy },
                client
            );
        },
    });
};


module.exports = { 
    getData,
    getDataById,
    insertData,
    insertDataBulk,
    updateData,
    updateDataBulk,
    deleteData,
    deleteDataBulk
};