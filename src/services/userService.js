const pool = require('../configs/db');
const approveService = require('./approveService');
const userRepository = require('../repositories/userRepository');
const { logData } = require("../helpers/logger");
const { randomPassword, hashedPassword, comparePassword } = require('../helpers/auth/password');
const mapUserDetails = require('../helpers/map/mapUserDetails');
const buildApprovalPayload = require('../helpers/approval/buildApprovalPayload');
const buildApprovalPayloadMulti = require('../helpers/approval/buildApprovalPayloadMulti');
const { handleServiceError, HttpError } = require('../helpers/response/responseHandler');

const getData = async (page, limit, formattedFilters = [], processName) => {
    try {
        const result = await userRepository.getData(page, limit, formattedFilters);
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
        const result = await userRepository.getDataById(id);
        if (!result) {
            throw new HttpError(`Data with ID: ${id} not found`, 404);
        }
        return result; 
    } catch (error) {
        console.log(error);
        handleServiceError(error, processName);
    }
};

const insertData = async (data, approvalInfo, processName) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const password = randomPassword();
        const hashedPass = await hashedPassword(password);
        const username = data.users.username;
        const branchId = data.userBranch.branchId;
        const roleId = data.userRoles.roleId;

        const insertedData = await userRepository.insertUser(pool, {
            username,
            ...approvalInfo,
            password: hashedPass,
            status: approvalInfo.pendingStatus,
        });

        if (!insertedData) {
            throw new Error("User insertion failed", 500);
        }

        await userRepository.insertUserProfile(pool, {
            ...data.userProfile,
            userId: insertedData.id,
        });

        if (branchId) {
            await userRepository.insertUserBranch(pool, {
                userId: insertedData.id, 
                branchId,
            });
        }

        if (roleId) {
            await userRepository.insertUserRole(pool, {
                userId: insertedData.id, 
                roleId,
            });
        }

        const approvalPayload = buildApprovalPayload(
            approvalInfo.entityNameApproval,
            insertedData.id,
            approvalInfo.actionTypeApproval,
            approvalInfo.requestedBy,
            {},
            {
                ...data,
                users: {
                    ...(data.users || {}),
                    password: hashedPass
                }
            }
        );

        await approveService.insertApproval(approvalPayload, approvalInfo.pendingStatus, client);
        await client.query('COMMIT');
        logData({
            level: 'debug',
            processName,
            data: `Success inserted user ID: ${insertedData.id} with approval request`,
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

        const existingData = await userRepository.getDataById(id, client);
        if (!existingData) {
            throw new HttpError(`Data with ID: ${id} not found`, 404);
        }

        const oldData = mapUserDetails(existingData);

        let hashedPass = oldData.users.password;

        if (updatedPassword && !(await comparePassword(updatedPassword, oldData.users.password))) {
            hashedPass = await hashedPassword(updatedPassword);
        }

        const finalNewData = {
            ...newData,
            users: {
              ...newData.users,
              password: hashedPass
            }
        };

        const approvalPayload = buildApprovalPayloadMulti(
            approvalInfo.entityNameApproval,
            id,
            approvalInfo.actionTypeApproval,
            approvalInfo.requestedBy,
            oldData,
            finalNewData
        );

        if (!approvalPayload) {
            throw new HttpError(`No changes detected. Nothing to update.`, 400);
        }

        await userRepository.updateStatus(id, approvalInfo.pendingStatus, approvalInfo.requestedBy, client);
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

        const existingData = await userRepository.getDataById(id, client);
        if (!existingData) {
            throw new HttpError(`Data with ID: ${id} not found`, 404);
        }

        const oldData = mapUserDetails(existingData);

        const approvalPayload = buildApprovalPayloadMulti(
            approvalInfo.entityNameApproval,
            id,
            approvalInfo.actionTypeApproval,
            requestedBy,
            oldData,
            {}
        );

        await userRepository.updateStatus(id, pendingStatus, requestedBy, client);
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
