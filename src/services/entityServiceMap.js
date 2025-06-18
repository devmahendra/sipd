// services/entityServiceMap.js
const routeApprovalService = require('./approvals/routeApproval');
const bankApprovalService = require('./approvals/bankApproval');

module.exports = {
    routes: routeApprovalService,
    banks: bankApprovalService,
    // Add more as needed
};
