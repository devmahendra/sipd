const routeService = require('../services/routeService');
const checkPermission = require('../helpers/auth/checkPermission');
const getPaginationParams = require('../utils/pagination');
const { respondSuccess, respondError } = require('../helpers/response/responseHandler');

const getProcessName = (req) => req.routeConfig?.name || 'UnknownProcess';

const getRoutes = async (req, res) => {
    const processName = getProcessName(req);
    try {
        const result = await routeService.getRoutes(processName);
        respondSuccess(res, req, 200, processName, { data: result });
    } catch (error) {
        respondError(res, req, 500, processName, error);
    }
};

const getData = async (req, res) => {
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, 'r')) return;

    const processName = getProcessName(req);
    const { page, limit } = getPaginationParams(req);
    const filters = req.body.filters || {};

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
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, 'c')) return;

    const processName = getProcessName(req);
    const entityNameApproval = 'routes';
    const actionTypeApproval = 'c'; 
    const requestedBy = req.user?.id || 1;
    const { name, path, method, isProtected, internal, description, menuId, actionType } = req.body;
    const data = { name, path, method, isProtected, internal, description, menuId, actionType, requestedBy };

    try {
        await routeService.insertData(
            data,
            { entityNameApproval, actionTypeApproval },
            processName
        );
        respondSuccess(res, req, 200, processName, "Create request submitted successfully");
    } catch (error) {
        respondError(res, req, error.httpCode || 500, processName, error);
    }
};

const updateData = async (req, res) => {
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, 'u')) return;

    const processName = getProcessName(req);
    const entityNameApproval = 'routes';
    const actionTypeApproval = 'u';
    const id = parseInt(req.params.id);
    const requestedBy = req.user?.id || 1;
    const { name, path, method, isProtected, internal, description, menuId, actionType } = req.body;
    const newData = { name, path, method, isProtected, internal, description, menuId, actionType, requestedBy };

    try {
        await routeService.updateData(
            id,
            newData,
            { entityNameApproval, actionTypeApproval },
            processName
        );

        respondSuccess(res, req, 200, processName, "Update request submitted successfully");
    } catch (error) {
        respondError(res, req, 500, processName, error);
    }
};

const deleteData = async (req, res) => {
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, 'd')) return;

    const processName = getProcessName(req);
    const entityNameApproval = 'routes';
    const actionTypeApproval = 'd';
    const id = parseInt(req.params.id);
    const requestedBy = req.user?.id || 1;

    try {
        await routeService.updateData(id, requestedBy, { entityNameApproval, actionTypeApproval }, processName);
        respondSuccess(res, req, 200, processName, "Delete request submitted successfully");
    } catch (error) {
        respondError(res, req, 500, processName, error);
    }
};

module.exports = { 
    getRoutes, 
    getData,
    insertData,
    updateData,
    deleteData,
};