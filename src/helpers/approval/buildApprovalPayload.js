const { snakeToCamelObject } = require('../../helpers/database/snakeToCamel');
const buildChangesObject = require('./buildChangesObject');

function buildApprovalPayload(entityName, entityId, actionType, requestedBy, oldData = {}, newData = {}) {
    const oldDataCamelCase = snakeToCamelObject(oldData);
    const changes = buildChangesObject(oldDataCamelCase, newData);
    const noChanges =
        Object.keys(changes.old).length === 0 &&
        Object.keys(changes.new).length === 0;

    if (noChanges && actionType !== 'd') {
        return null;
    }

    return {
        entityName,
        entityId,
        actionType,
        requestedBy,
        changes
  };
}

module.exports = buildApprovalPayload;
