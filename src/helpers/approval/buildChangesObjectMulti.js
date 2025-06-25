function buildChangesObjectMulti(oldData = {}, newData = {}) {
    const excludedFields = ['requestedBy', 'entityName', 'actionType'];
    const changes = { old: {}, new: {} };

    const allTables = new Set([
        ...Object.keys(oldData),
        ...Object.keys(newData)
    ]);

    for (const table of allTables) {
        const oldTableData = oldData[table] || {};
        const newTableData = newData[table] || {};
        const oldChanges = {};
        const newChanges = {};

        const allFields = new Set([
            ...Object.keys(oldTableData),
            ...Object.keys(newTableData),
        ]);

        for (const key of allFields) {
            if (excludedFields.includes(key)) continue;

            const oldValue = oldTableData[key];
            const newValue = newTableData[key];

            const bothUndefined = oldValue === undefined && newValue === undefined;
            const bothNull = oldValue === null && newValue === null;
            const bothEqual = oldValue === newValue;

            if (bothUndefined || bothNull || bothEqual) continue;

            if (oldValue !== undefined) oldChanges[key] = oldValue ?? null;
            if (newValue !== undefined) newChanges[key] = newValue ?? null;
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
