const { STATUS_ACTIVE, STATUS_REJECTED } = require('../../constants/statusType');
const { ACTION_CREATE, ACTION_UPDATE, ACTION_DELETE } = require('../../constants/actionType');
const routeRepository = require('../../repositories/routeRepository');
const { HttpError } = require('../../helpers/response/responseHandler');

const applyApproval = async ({ entityId, changes, status, actionType, requestedBy, client }) => {
    if (status === STATUS_ACTIVE) {
        switch (actionType) {
            case ACTION_CREATE:
                await routeRepository.updateStatus(entityId, status, requestedBy, client);
                break;

            case ACTION_UPDATE:
                await routeRepository.updateData(entityId, changes.new, status, requestedBy, client);
                break;

            case ACTION_DELETE:
                await routeRepository.deleteData(entityId, client);
                break;

            default:
                throw new HttpError(`Unknown action type: ${actionType}`, 404);
        }
    } else if (status === STATUS_REJECTED) {
        switch (actionType) {
            case ACTION_CREATE:
                await routeRepository.deleteData(entityId, client);
                break;

            case ACTION_UPDATE:
            case ACTION_DELETE:
                // Rollback to previous state
                if (changes.old) {
                    await routeRepository.updateData(entityId, changes.old, changes.old.status || STATUS_ACTIVE, requestedBy, client);
                } else {
                    throw new HttpError(`Missing changes.old data for rollback`, 400);
                }
                break;

            default:
                throw new HttpError(`Unknown action type: ${actionType}`, 404);
        }
    }
};

module.exports = { applyApproval };
