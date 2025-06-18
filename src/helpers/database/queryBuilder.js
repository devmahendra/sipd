/**
 * Builds a dynamic WHERE clause and parameterized values for SQL queries.
 * Supports operators: ilike (default), =, >, <, >=, <=, between.
 *
 * @param {Object} filters - Key-value pairs of filters. Example:
 {
    "page": 1,
    "limit": 10,
    "filters": [
        {
            "field": "name",
            "value": "GET_ROUTE",
            "operator": "ilike"
        },
        {
            "field": "created_at",
            "value": [
                "2025-01-01",
                "2025-12-31"
            ],
            "operator": "between"
        }
    ]
 }
 */
const buildWhereClause = (formattedFilters = []) => {
    const conditions = [];
    const values = [];
    let index = 1;

    for (const filter of formattedFilters) {
        const { field, operator = 'ilike', value } = filter;

        if (value === undefined || value === null || value === '') continue;

        const op = operator.toLowerCase();

        switch (op) {
            case 'ilike':
                conditions.push(`${field} ILIKE $${index}`);
                values.push(`%${value}%`);
                index++;
                break;

            case '=':
            case '>':
            case '<':
            case '>=':
            case '<=':
                conditions.push(`${field} ${op} $${index}`);
                values.push(value);
                index++;
                break;

            case 'between':
                if (Array.isArray(value) && value.length === 2) {
                    conditions.push(`${field} BETWEEN $${index} AND $${index + 1}`);
                    values.push(value[0], value[1]);
                    index += 2;
                }
                break;

            default:
                throw new Error(`Unsupported operator: ${op}`);
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
