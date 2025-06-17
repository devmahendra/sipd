const { STATUS_ACTIVE, STATUS_REJECTED } = require('../../constants/statusType');
const { ACTION_CREATE, ACTION_UPDATE, ACTION_DELETE } = require('../../constants/actionType');
const { filterValidFields } = require('../../helpers/database/dataSanitizer');
const routeRepository = require('../../repositories/routeRepository');
const { HttpError } = require('../../helpers/response/responseHandler');

const applyApproval = async ({ entityId, changes, status, actionType, requestedBy, client }) => {
    const prepareUpdatePayload = (rawData) => {
        const cleaned = filterValidFields(rawData);
        return {
            ...cleaned,
            status,
            updated_by: requestedBy,
        };
    };

    if (status === STATUS_ACTIVE) {
        switch (actionType) {
            case ACTION_CREATE:
                return await routeRepository.updateStatus(entityId, status, requestedBy, client);

            case ACTION_UPDATE:
                return await routeRepository.updateData(entityId, prepareUpdatePayload(changes?.new), client);

            case ACTION_DELETE:
                return await routeRepository.deleteData(entityId, client);

            default:
                throw new HttpError(`Unknown action type: ${actionType}`, 404);
        }
    }

    if (status === STATUS_REJECTED) {
        switch (actionType) {
            case ACTION_CREATE:
                return await routeRepository.deleteData(entityId, client);

            case ACTION_UPDATE:
            case ACTION_DELETE:
                if (!changes?.old) {
                    throw new HttpError(`Missing changes.old data for rollback`, 400);
                }

                return await routeRepository.updateData(entityId, prepareUpdatePayload(changes.old), client);

            default:
                throw new HttpError(`Unknown action type: ${actionType}`, 404);
        }
    }
};

module.exports = { applyApproval };
