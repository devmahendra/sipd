function buildChangesObject(oldData = {}, newData = {}) {
  const excludedFields = ['requestedBy', 'entityName', 'actionType'];
  
  const oldChanges = {};
  const newChanges = {};

  for (const key of Object.keys(newData)) {
      if (excludedFields.includes(key)) continue;

      const oldValue = oldData[key];
      const newValue = newData[key];

      // ✅ Skip if both are undefined, both are null, or exactly equal
      const bothUndefined = oldValue === undefined && newValue === undefined;
      const bothNull = oldValue === null && newValue === null;
      const bothEqual = oldValue === newValue;

      if (bothUndefined || bothNull || bothEqual) continue;

      oldChanges[key] = oldValue ?? null;
      newChanges[key] = newValue ?? null;
  }

  return { old: oldChanges, new: newChanges };
}
  
module.exports = buildChangesObject;
  