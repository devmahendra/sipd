const buildChangesObjectMulti = require('./buildChangesObjectMulti');

/**
 * Build approval payload for multi-table update
 * @param {string} entityName 
 * @param {number} entityId 
 * @param {string} actionType 
 * @param {number} requestedBy 
 * @param {Object} oldData - object with per-table data
 * @param {Object} newData - object with per-table data
 * @returns {object|null}
 */
function buildApprovalPayloadMulti(entityName, entityId, actionType, requestedBy, oldData = {}, newData = {}) {
    const changes = buildChangesObjectMulti(oldData, newData);

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
        changes,
    };
}

module.exports = buildApprovalPayloadMulti;
