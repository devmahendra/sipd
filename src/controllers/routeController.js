const { ACTION_CREATE, ACTION_READ, ACTION_UPDATE, ACTION_DELETE } = require('../constants/actionType');
const { STATUS_PENDING } = require('../constants/statusType');
const routeService = require('../services/routeService');
const checkPermission = require('../helpers/auth/checkPermission');
const { respondSuccess, respondError } = require('../helpers/response/responseHandler');
const getPaginationParams = require('../utils/pagination');

const getProcessName = (req) => req.routeConfig?.name || 'UnknownProcess';

const getData = async (req, res) => {
    const processName = getProcessName(req);
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, ACTION_READ, processName)) return;

    const { page, limit } = getPaginationParams(req);
    const filters = req.body.filters || [];

    try {
        const result = await routeService.getData(page, limit, filters, processName);
        respondSuccess(res, req, 200, processName, {
            data: result.data,
            pagination: {
                totalRecords: result.totalRecords,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
            },
        });
    } catch (error) {
        respondError(res, req, 500, processName, error);
    }
};

const insertData = async (req, res) => {
    const processName = getProcessName(req);
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, ACTION_CREATE, processName)) return;

    const entityNameApproval = 'routes';
    const actionTypeApproval = ACTION_CREATE; 
    const pendingStatus = STATUS_PENDING;
    const requestedBy = req.user?.id || 1;
    const { name, path, method, isProtected, internal, description, menuId, actionType } = req.body;
    const data = { name, path, method, isProtected, internal, description, menuId, actionType, requestedBy };

    try {
        await routeService.insertData(
            data,
            { entityNameApproval, actionTypeApproval, pendingStatus, requestedBy },
            processName
        );
        respondSuccess(res, req, 200, processName, "Create request submitted successfully");
    } catch (error) {
        respondError(res, req, error.httpCode || 500, processName, error);
    }
};

const updateData = async (req, res) => {
    const processName = getProcessName(req);
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, ACTION_UPDATE, processName)) return;

    const entityNameApproval = 'routes';
    const actionTypeApproval = ACTION_UPDATE;
    const pendingStatus = STATUS_PENDING;
    const id = parseInt(req.params.id);
    const requestedBy = req.user?.id || 1;
    const { name, path, method, isProtected, internal, description, menuId, actionType, status } = req.body;
    const newData = { name, path, method, isProtected, internal, description, menuId, actionType, status };

    try {
        await routeService.updateData(
            id,
            newData,
            { entityNameApproval, actionTypeApproval, pendingStatus, requestedBy },
            processName
        );
        respondSuccess(res, req, 200, processName, "Update request submitted successfully");
    } catch (error) {
        respondError(res, req, error.httpCode || 500, processName, error);
    }
};

const deleteData = async (req, res) => {
    const processName = getProcessName(req);
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, ACTION_DELETE, processName)) return;

    const entityNameApproval = 'routes';
    const actionTypeApproval = ACTION_DELETE;
    const pendingStatus = STATUS_PENDING;
    const id = parseInt(req.params.id);
    const requestedBy = req.user?.id || 1;

    try {
        await routeService.deleteData(
            id,
            requestedBy,
            pendingStatus,
            { entityNameApproval, actionTypeApproval, requestedBy },
            processName
        );
        respondSuccess(res, req, 200, processName, "Delete request submitted successfully");
    } catch (error) {
        respondError(res, req, error.httpCode || 500, processName, error);
    }
};

module.exports = { 
    getData,
    insertData,
    updateData,
    deleteData,
};