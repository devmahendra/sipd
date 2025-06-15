function buildChangesObject(oldData = {}, newData = {}) {
    const excludedFields = ['requestedBy', 'entityName', 'actionType'];
    
    const oldChanges = {};
    const newChanges = {};
  
    for (const key of Object.keys(newData)) {
      if (excludedFields.includes(key)) continue;
  
      const oldValue = oldData[key];
      const newValue = newData[key];
  
      if (oldValue === newValue) continue;
  
      oldChanges[key] = oldValue ?? null;
      newChanges[key] = newValue ?? null;
    }
  
    return { old: oldChanges, new: newChanges };
}
  
module.exports = buildChangesObject;
  