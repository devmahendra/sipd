/**
 * Convert a camelCase string to snake_case
 * @param {string} str - The camelCase string
 * @returns {string} - The converted snake_case string
 */
const camelToSnake = (str) =>
    str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const convertFilterFieldsToSnakeCase = (filters = []) =>
    filters.map(({ field, ...rest }) => ({
        field: camelToSnake(field),
        ...rest,
    }));

module.exports = {
    camelToSnake,
    convertFilterFieldsToSnakeCase
};
