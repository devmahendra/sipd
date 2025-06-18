const pool = require('../configs/db');
const approveService = require('./approveService');
const routeRepository = require('../repositories/routeRepository');
const { logData } = require("../helpers/logger");
const buildApprovalPayload = require('../helpers/approval/buildApprovalPayload');
const { handleServiceError, HttpError } = require('../helpers/response/responseHandler');

const getData = async (page, limit, formattedFilters = [], processName) => {
    try {
        const result = await routeRepository.getData(page, limit, formattedFilters);
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
        const result = await routeRepository.getDataById(id);
        if (!result) {
            throw new HttpError(`Data with ID: ${id} not found`, 404);
        }
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
            approvalInfo.requestedBy,
            {},          
            insertedData     
        );
        await approveService.insertApproval(approvalPayload, approvalInfo.pendingStatus, client);
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

const updateData = async (id, newData, approvalInfo, processName) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const oldData = await routeRepository.getDataById(id, client);
        if (!oldData) {
            throw new HttpError(`Data with ID: ${id} not found`, 404);
        }

        const targetStatus = newData?.status;

        const approvalPayload = buildApprovalPayload(
            approvalInfo.entityNameApproval,
            id,
            approvalInfo.actionTypeApproval,
            approvalInfo.requestedBy,
            { ...oldData, status: oldData.status }, 
            newData
        );

        if (!approvalPayload) {
            throw new HttpError(`No changes detected. Nothing to update.`, 400);
        }

        if (targetStatus !== undefined) {
            approvalPayload.changes.new.status = targetStatus;
        }

        await routeRepository.updateStatus(id, approvalInfo.pendingStatus, approvalInfo.requestedBy, client);
        await approveService.insertApproval(approvalPayload, approvalInfo.pendingStatus, client);

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        handleServiceError(error, processName);
    } finally {
        client.release();
    }
};

const deleteData = async (id, requestedBy, pendingStatus, approvalInfo, processName) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const oldData = await routeRepository.getDataById(id, client);
        if (!oldData) {
            throw new HttpError(`Data with ID: ${id} not found`, 404);
        }

        const approvalPayload = buildApprovalPayload(
            approvalInfo.entityNameApproval,
            id,
            approvalInfo.actionTypeApproval,
            requestedBy,
            oldData,
            {}
        );

        await routeRepository.updateStatus(id, pendingStatus, requestedBy, client);
        await approveService.insertApproval(approvalPayload, pendingStatus, client);

        await client.query('COMMIT');
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
    insertData,
    updateData,
    deleteData
};
