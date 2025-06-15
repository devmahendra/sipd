const buildChangesObject = require('./buildChangesObject');

function buildApprovalPayload(entityName, entityId, actionType, requestedBy, oldData = {}, newData = {}) {
  const changes = buildChangesObject(oldData, newData);

  return {
    entityName,
    entityId,
    actionType,
    requestedBy,
    changes
  };
}

module.exports = buildApprovalPayload;
