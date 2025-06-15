const pool = require('../configs/db');
const approveService = require('./approveService');
const routeRepository = require('../repositories/routeRepository');
const { logData } = require("../helpers/logger");
const buildApprovalPayload = require('../helpers/approval/buildApprovalPayload');
const { handleServiceError } = require('../helpers/response/responseHandler');

const getData = async (page, limit, filters = {}, processName) => {
    try {
        const result = await routeRepository.getData(page, limit, filters);
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
        logData({
            level: 'debug',
            processName,
            data: `Success inserted data ID: ${insertedData.id} with approval request`,
        });
    } catch (error) {
        await client.query('ROLLBACK');
        handleServiceError(error, processName);
    } finally {
        client.release();
    }
};


module.exports = { 
    getData,
    insertData,
};
