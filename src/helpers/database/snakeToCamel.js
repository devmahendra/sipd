/**
 * Convert a snake_case string to camelCase
 * @param {string} str - The snake_case string
 * @returns {string} - The converted camelCase string
 */
const snakeToCamel = (str) =>
    str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());

/**
 * Convert all keys in an object from snake_case to camelCase
 * @param {Object} obj - The object with snake_case keys
 * @returns {Object} - The object with camelCase keys
 */
const snakeToCamelObject = (obj = {}) => {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [snakeToCamel(key), value])
    );
};

module.exports = {
    snakeToCamel,
    snakeToCamelObject,
};
