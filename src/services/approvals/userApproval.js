const { STATUS_ACTIVE, STATUS_REJECTED } = require('../../constants/statusType');
const { ACTION_CREATE, ACTION_UPDATE, ACTION_DELETE } = require('../../constants/actionType');
const { filterValidFields } = require('../../helpers/database/dataSanitizer');
const userRepository = require('../../repositories/userRepository');
const { HttpError } = require('../../helpers/response/responseHandler');

/**
 * Prepare update payload with valid fields and correct status
 * @param {object} data - Raw object (either new or old)
 * @param {number} requestedBy - User ID
 * @param {number} fallbackStatus - Status to fallback to if data.status is undefined
 */
const prepareUpdatePayload = (data, requestedBy, fallbackStatus) => {
    const cleaned = filterValidFields(data || {});
    const resolvedStatus = data?.status ?? fallbackStatus;

    if (resolvedStatus === undefined) {
        throw new HttpError('Missing required field: status', 400);
    }

    return {
        ...cleaned,
        status: resolvedStatus,
        updated_by: requestedBy,
    };
};

/**
 * Apply approval logic for banks entity
 * @param {Object} options
 * @param {number} options.entityId - ID of the bank
 * @param {Object} options.changes - Contains old/new changes
 * @param {number} options.status - Final status being applied (approve or reject)
 * @param {string} options.actionType - Type of approval action (c/u/d)
 * @param {number} options.requestedBy - User ID who made the request
 * @param {object} options.client - PostgreSQL transaction client
 */
const applyApproval = async ({ entityId, changes, status, actionType, requestedBy, client }) => {
    const isApprove = status === STATUS_ACTIVE;
    const isReject = status === STATUS_REJECTED;

    const newChanges = changes?.new || {};
    const oldChanges = changes?.old || {};

    switch (actionType) {
        case ACTION_CREATE:
            if (isApprove) {
                return await userRepository.updateStatus(entityId, STATUS_ACTIVE, requestedBy, client);
            }
            if (isReject) {
                return await userRepository.deleteData(entityId, client);
            }
            break;

        case ACTION_UPDATE:
            if (isApprove) {
                if (newChanges.users) {
                    const userPayload = prepareUpdatePayload(newChanges.users, requestedBy, STATUS_ACTIVE);
                    await userRepository.updateData(entityId, userPayload, client);
                }

                if (newChanges.userProfile) {
                    await userRepository.updateUserProfile(entityId, newChanges.userProfile, client);
                }

                if (newChanges.userRoles) {
                    await userRepository.deleteUserRoles(entityId, client);
                    await userRepository.insertUserRole(client, {
                        userId: entityId,
                        roleId: newChanges.userRoles.roleId
                    });
                }

                if (newChanges.userBranch) {
                    await userRepository.deleteUserBranches(entityId, client);
                    await userRepository.insertUserBranch(client, {
                        userId: entityId,
                        branchId: newChanges.userBranch.branchId
                    });
                }

                return;
            }

            if (isReject) {
                if (!oldChanges.users) {
                    throw new HttpError('Missing rollback data', 400);
                }

                if (oldChanges.users) {
                    const rollback = prepareUpdatePayload(oldChanges.users, requestedBy, oldChanges.users.status);
                    await userRepository.updateData(entityId, rollback, client);
                }

                return;
            }
            break;

        case ACTION_DELETE:
            if (isApprove) {
                return await userRepository.deleteData(entityId, client);
            }

            if (isReject) {
                const rollback = prepareUpdatePayload(oldChanges.users, requestedBy, oldChanges.users.status);
                await userRepository.updateData(entityId, rollback, client);

                return;
            }
            break;

        default:
            throw new HttpError(`Unknown action type: ${actionType}`, 400);
    }
};


module.exports = { applyApproval };
