const pool = require('../configs/db');
const entityServiceMap = require('./entityServiceMap');
const approveRepository = require('../repositories/approveRepository');
const { logData } = require('../helpers/logger');
const { HttpError } = require('../helpers/response/responseHandler');
const { handlePostgresError } = require('../helpers/database/databaseHandler');
const { handleServiceError } = require('../helpers/response/responseHandler');

const getData = async (page, limit, filters = {}, processName) => {
    try {
        const result = await approveRepository.getData(page, limit, filters);
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

const insertApproval = async (data, client) => {
    const processName = 'INSERT_APPROVAL';
    try {
        const insertData =  await approveRepository.insertData(data, client);
        logData({
            level: 'debug',
            processName,
            data: 'success insert approval data',
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
            const httpCode = 404;
            const message = `Approval ID: ${approvalId} not found or already processed`;

            throw new HttpError(message, httpCode);
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
            const httpCode = 404;
            const message = `Unhandled entity type: ${entityName}`;

            throw new HttpError(message, httpCode);
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
    insertApproval,
    approveData,
};
