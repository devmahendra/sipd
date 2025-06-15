const approveService = require('../services/approveService');
const checkPermission = require('../helpers/auth/checkPermission');
const getPaginationParams = require('../utils/pagination');
const { respondSuccess, respondError } = require('../helpers/response/responseHandler');

const getProcessName = (req) => req.routeConfig?.name || 'UnknownProcess';

const getData = async (req, res) => {
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, 'r')) return;

    const processName = getProcessName(req);
    const { page, limit } = getPaginationParams(req);
    const filters = req.body.filters || {};

    try {
        const result = await approveService.getData(page, limit, filters, processName);
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

const approveData = async (req, res) => {
    if (process.env.NODE_ENV === 'production' && !checkPermission(req, res, 'u')) return;

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
    approveData
};