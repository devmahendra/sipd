// services/approvals/routeApprovalService.js
const routeRepository = require('../../repositories/routeRepository');
const { HttpError } = require('../../helpers/response/responseHandler');

const applyApproval = async ({ entityId, changes, status, actionType, requestedBy, client }) => {
    if (status !== 2) return;

    switch (actionType) {
        case 'c':
            await routeRepository.updateStatus(entityId, status, requestedBy, client);
            break;
        case 'u':
            await routeRepository.updateData(entityId, changes.new, requestedBy, client);
            break;
        case 'd':
            await routeRepository.updateStatus(entityId, 3, requestedBy, client);
            break;
        default:
            const httpCode = 404;
            const message = `Unknown action type: ${actionType}`;

            throw new HttpError(message, httpCode);
    }
};

module.exports = { applyApproval };
