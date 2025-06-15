const pool = require('../configs/db');
const entityServiceMap = require('./entityServiceMap');
const approveRepository = require('../repositories/approveRepository');
const { logData } = require('../helpers/logger');
const { HttpError } = require('../helpers/response/responseHandler');
const { handlePostgresError } = require('../helpers/database/databaseHandler');

const getData = async (page, limit, filters = {}, processName) => {
    try {
        const result = await approveRepository.getData(page, limit, filters);
        logData({
            processName,
            data: `Success retrieve ${result.length} rows`,
        });
        return result;
    } catch (error) {
        const handledError = handlePostgresError(error);
        logData({
            level: 'error',
            processName,
            data: handledError.message,
        });
        throw error;
    }
};

const insertApproval = async (data, client) => {
    const processName = 'INSERT_APPROVAL';
    try {
        const insertData =  await approveRepository.insertData(data, client);
        logData({
            processName,
            data: 'success insert approval data',
        });
        return insertData;
    } catch (error) {
        const handledError = handlePostgresError(error);
        logData({
            level: 'error',
            processName,
            data: handledError.message,
        });
        throw error;
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
    
        if (error instanceof HttpError) {
            throw error;
        }
    
        const handledError = error.code ? handlePostgresError(error) : new HttpError(
            error.message || 'Internal server error',
            error.status || 500
        );
    
        logData({
            httpCode: handledError.httpCode,
            level: 'error',
            processName,
            data: `Error approving data: ${handledError.message}`,
        });
    
        throw handledError;
    } finally {
        client.release();
    }
};

module.exports = {
    getData,
    insertApproval,
    approveData,
};
