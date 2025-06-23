function buildChangesObjectMulti(oldData = {}, newData = {}) {
    const excludedFields = ['requestedBy', 'entityName', 'actionType'];
    const changes = { old: {}, new: {} };

    for (const table of Object.keys(newData)) {
        const oldTableData = oldData[table] || {};
        const newTableData = newData[table] || {};
        const oldChanges = {};
        const newChanges = {};

        for (const key of Object.keys(newTableData)) {
            if (excludedFields.includes(key)) continue;

            const oldValue = oldTableData[key];
            const newValue = newTableData[key];

            const bothUndefined = oldValue === undefined && newValue === undefined;
            const bothNull = oldValue === null && newValue === null;
            const bothEqual = oldValue === newValue;

            if (bothUndefined || bothNull || bothEqual) continue;

            oldChanges[key] = oldValue ?? null;
            newChanges[key] = newValue ?? null;
        }

        if (Object.keys(oldChanges).length > 0) {
            changes.old[table] = oldChanges;
        }

        if (Object.keys(newChanges).length > 0) {
            changes.new[table] = newChanges;
        }
    }

    return changes;
}

module.exports = buildChangesObjectMulti;
