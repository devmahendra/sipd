/**
 * Builds a dynamic WHERE clause and parameterized values for SQL queries.
 * Supports operators: ilike (default), =, >, <, >=, <=, between.
 *
 * @param {Object} filters - Key-value pairs of filters. Example:
 * {
 * "page": 1,
 *   "limit": 10,
 *   "filters": {
 *     "route_name": { "value": "admin", "operator": "ilike" },
 *     "is_active": { "value": true, "operator": "=" },
 *     "created_at": { "value": ["2024-01-01", "2024-12-31"], "operator": "between" }
 *   }
 * }
 *
 * @returns {Object} { whereClause: string, values: Array<any> }
 */
const buildWhereClause = (filters = {}) => {
    const conditions = [];
    const values = [];
    let index = 1;

    for (const [field, filter] of Object.entries(filters)) {
        if (!filter || filter.value === undefined || filter.value === null || filter.value === '') {
            continue;
        }

        const operator = (filter.operator || 'ilike').toLowerCase();

        switch (operator) {
            case 'ilike':
                conditions.push(`${field} ILIKE $${index}`);
                values.push(`%${filter.value}%`);
                index++;
                break;

            case '=':
            case '>':
            case '<':
            case '>=':
            case '<=':
                conditions.push(`${field} ${operator} $${index}`);
                values.push(filter.value);
                index++;
                break;

            case 'between':
                if (Array.isArray(filter.value) && filter.value.length === 2) {
                    conditions.push(`${field} BETWEEN $${index} AND $${index + 1}`);
                    values.push(filter.value[0], filter.value[1]);
                    index += 2;
                }
                break;

            default:
                throw new Error(`Unsupported operator: ${operator}`);
        }
    }

    return {
        whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
        values,
    };
};

module.exports = {
    buildWhereClause,
};
