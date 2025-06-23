// services/entityServiceMap.js
const routeApprovalService = require('./approvals/routeApproval');
const bankApprovalService = require('./approvals/bankApproval');
const userApprovalService = require('./approvals/userApproval');

module.exports = {
    routes: routeApprovalService,
    banks: bankApprovalService,
    users: userApprovalService,
    // Add more as needed
};
