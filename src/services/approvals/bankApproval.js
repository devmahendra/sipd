const { STATUS_ACTIVE, STATUS_REJECTED } = require('../../constants/statusType');
const { ACTION_CREATE, ACTION_UPDATE, ACTION_DELETE } = require('../../constants/actionType');
const { filterValidFields } = require('../../helpers/database/dataSanitizer');
const bankRepository = require('../../repositories/bankRepository');
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

    switch (actionType) {
        case ACTION_CREATE:
            if (isApprove) {
                return await bankRepository.updateStatus(entityId, STATUS_ACTIVE, requestedBy, client);
            }
            if (isReject) {
                return await bankRepository.deleteData(entityId, client);
            }
            break;

        case ACTION_UPDATE:
        case ACTION_DELETE:
            if (isApprove) {
                const newData = prepareUpdatePayload(changes?.new, requestedBy, STATUS_ACTIVE);
                return await bankRepository.updateData(entityId, newData, client);
            }

            if (isReject) {
                if (!changes?.old) {
                    throw new HttpError('Missing rollback data (changes.old)', 400);
                }
                const rollbackData = prepareUpdatePayload(changes.old, requestedBy, changes.old?.status);
                return await bankRepository.updateData(entityId, rollbackData, client);
            }
            break;

        default:
            throw new HttpError(`Unknown action type: ${actionType}`, 400);
    }
};

module.exports = { applyApproval };
