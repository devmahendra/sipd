const pool = require('../configs/db');
const entityServiceMap = require('./entityServiceMap');
const approveRepository = require('../repositories/approveRepository');
const { logData } = require('../helpers/logger');
const { HttpError } = require('../helpers/response/responseHandler');
const { handleServiceError } = require('../helpers/response/responseHandler');

const getData = async (page, limit, formattedFilters = [], processName) => {
    try {
        const result = await approveRepository.getData(page, limit, formattedFilters);
        logData({
            level: 'debug',
            processName,
            data: `Success retrieve ${result.totalRecords} rows`,
        });
        return result;
    } catch (error) {
        handleServiceError(error, processName);
    }
};

const getDataById = async (id, processName) => {
    try {
        const result = await approveRepository.getDataByIdWithoutStatus(id);
        if (!result) {
            throw new HttpError(`Data with ID: ${id} not found`, 404);
        }
        return result; 
    } catch (error) {
        handleServiceError(error, processName);
    }
};

const insertApproval = async (data, pendingStatus, client) => {
    const processName = 'INSERT_APPROVAL';
    const approvalData = { ...data, pendingStatus};

    try {
        const insertData =  await approveRepository.insertData(approvalData, client);
        logData({
            level: 'debug',
            processName,
            data: 'Success insert approval data',
        });
        return insertData;
    } catch (error) {
        handleServiceError(error, processName);
    }
};

const approveData = async (approvalId, approvedBy, status, processName) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const getData = await approveRepository.getDataById(approvalId, status, client);
        if (!getData) {
            throw new HttpError(`Approval ID: ${approvalId} not found or already processed`, 404);
        }

        const {
            entity_id: entityId,
            entity_name: entityName,
            changes,
            action_type: actionType,
            requested_by: requestedBy,
        } = getData;

        const entityService = entityServiceMap[entityName];

        if (!entityService || typeof entityService.applyApproval !== 'function') {
            throw new HttpError(`Unhandled entity type: ${entityName}`, 404);
        }

        await entityService.applyApproval({ entityId, changes, status, actionType, requestedBy, client });

        const result = await approveRepository.approveData(approvalId, approvedBy, status, client);

        await client.query('COMMIT');

        logData({
            level: 'debug',
            processName,
            data: `Approved ${entityName} ID: ${entityId} by user: ${approvedBy}`,
        });

        return {
            ...result,
            entityId,
            entityName,
            approvedBy,
            status,
        };
    } catch (error) {
        await client.query('ROLLBACK');
        handleServiceError(error, processName);
    } finally {
        client.release();
    }
};

module.exports = {
    getData,
    getDataById,
    insertApproval,
    approveData,
};
