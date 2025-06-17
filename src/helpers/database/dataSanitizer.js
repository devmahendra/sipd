/**
 * Filters out null or undefined values from an object.
 * Optionally allows some fields to always be included.
 * @param {object} obj - Object to clean
 * @param {string[]} alwaysInclude - Keys to always include even if null
 */
function filterValidFields(obj = {}, alwaysInclude = []) {
    return Object.entries(obj)
        .filter(([key, val]) => val !== null && val !== undefined || alwaysInclude.includes(key))
        .reduce((acc, [key, val]) => {
            acc[key] = val;
            return acc;
        }, {});
}

module.exports = {
    filterValidFields
};
