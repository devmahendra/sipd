const pool = require('../configs/db');
const approveService = require('./approveService');
const routeRepository = require('../repositories/routeRepository');
const { logData } = require("../helpers/logger");
const buildApprovalPayload = require('../helpers/approval/buildApprovalPayload');
const { handlePostgresError } = require('../helpers/database/databaseHandler');

const getData = async (page, limit, filters = {}, processName) => {
    try {
        const result = await routeRepository.getData(page, limit, filters);
        logData({
            level: 'debug',
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

const insertData = async (data, approvalInfo, processName) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const insertedData = await routeRepository.insertData(data, client);
        const approvalPayload = buildApprovalPayload(
            approvalInfo.entityNameApproval,
            insertedData.id,
            approvalInfo.actionTypeApproval,
            data.requestedBy,
            {},          
            insertedData     
        );
        await approveService.insertApproval(approvalPayload, client);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        const handledError = handlePostgresError(error, processName);
        logData({
            httpCode: handledError.httpCode,
            processName,
            data: handledError.message,
        });
        throw handledError;
    } finally {
        client.release();
    }
};


module.exports = { 
    getData,
    insertData,
};
