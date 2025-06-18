const { ACTION_READ, ACTION_UPDATE } = require('../constants/actionType');
const approveService = require('../services/approveService');
const checkPermission = require('../helpers/auth/checkPermission');
const getPaginationParams = require('../utils/pagination');
const { respondSuccess, respondError } = require('../helpers/response/responseHandler');
const { snakeToCamelArray, snakeToCamelObject } = require('../helpers/database/snakeToCamel');
const { convertFilterFieldsToSnakeCase } = require('../helpers/database/camelToSnake');

const getProcessName = (req) => req.routeConfig?.name || 'UnknownProcess';

const getData = async (req, res) => {
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, ACTION_READ)) return;

    const processName = getProcessName(req);
    const { page, limit } = getPaginationParams(req);
    const filters = req.body.filters || [];
    const formattedFilters = convertFilterFieldsToSnakeCase(filters);

    try {
        const result = await approveService.getData(page, limit, formattedFilters, processName);
        const formattedData = snakeToCamelArray(result.data);
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
        const result = await approveService.getDataById(id, processName);
        const formattedData = snakeToCamelObject(result);
        respondSuccess(res, req, 200, processName, formattedData);
    } catch (error) {
        respondError(res, req, error.httpCode || 500, processName, error);
    }
};

const approveData = async (req, res) => {
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, ACTION_UPDATE)) return;

    const processName = getProcessName(req);
    const approvalId = req.params.id;
    const approvedBy = req.user?.id || 1;
    const { status } = req.body;
 
    try {
        await approveService.approveData(approvalId, approvedBy, status, processName);
        respondSuccess(res, req, 200, processName);
    } catch (error) {
        respondError(res, req, error.httpCode || 500, processName, error.message);
    }
}


module.exports = { 
    getData,
    getDataById,
    approveData
};