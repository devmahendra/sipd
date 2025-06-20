const pool = require('../configs/db');
const { camelToSnake } = require('../helpers/database/camelToSnake');
const { buildWhereClause } = require('../helpers/database/queryBuilder');

const getRoutes = async (status) => {
    const query = `
        SELECT 
            r.*, 
            COALESCE(json_agg(mr.menu_id) FILTER (WHERE mr.menu_id IS NOT NULL), '[]') AS menu_ids
        FROM routes r
        LEFT JOIN menu_routes mr ON mr.route_id = r.id
        WHERE r.status = $1
        GROUP BY r.id
    `;
    const params = [status];
    const rows = await pool.query(query, params);
    return rows.rows;
};

const getDataById = async (id, client = null) => {
    const query = `SELECT * FROM routes WHERE id = $1 AND deleted_at IS NULL`;
    const params = [id];

    const db = client || pool;
    const { rows } = await db.query(query, params);
    return rows[0];
};

const getData = async (page, limit, formattedFilters = []) => {
    try {
        const offset = (page - 1) * limit;

        const { whereClause, values: filterValues } = buildWhereClause(formattedFilters);
        const paginationValues = [...filterValues, limit, offset];

        const dataQuery = `
            SELECT * FROM routes
            ${whereClause}
            ORDER BY created_at ASC
            LIMIT $${filterValues.length + 1} OFFSET $${filterValues.length + 2}
        `;

        const countQuery = `
            SELECT COUNT(*) FROM routes
            ${whereClause}
        `;

        const { rows: data } = await pool.query(dataQuery, paginationValues);
        const { rows } = await pool.query(countQuery, filterValues);

        const totalRecords = parseInt(rows[0].count, 10);

        return {
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: parseInt(page, 10),
            data,
        };
    } catch (error) {
        throw new Error(`Failed to get data: ${error.message}`);
    }
};

const insertData = async ({ name, path, method, isProtected, internal, description, actionType, requestedBy, status = 1 }, client) => {
    const query = `
        INSERT INTO routes 
        (name, path, method, is_protected, internal, description, action_type, created_by, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
    `;
    
    const values = [name, path, method, isProtected, internal, description, actionType, requestedBy, status];
    const { rows } = await client.query(query, values);
    return rows[0];
};

const deleteData = async (id, client) => {
    const query = `DELETE FROM routes WHERE id = $1`;
    await client.query(query, [id]);
};

const updateStatus = async (id, status, updatedBy, client) => {
    const query = `
        UPDATE routes
        SET status = $1,
            updated_at = NOW(),
            updated_by = $2
        WHERE id = $3
    `;

    await client.query(query, [status, updatedBy, id]);
};

const updateData = async (id, data, client) => {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) {
        throw new Error('No fields to update');
    }

    const dbFields = fields.map(camelToSnake);
    const setClause = dbFields
        .map((field, i) => `${field} = $${i + 1}`)
        .concat('updated_at = NOW()')
        .join(', ');

    const query = `UPDATE routes SET ${setClause} WHERE id = $${fields.length + 1}`;
    await client.query(query, [...values, id]);
};


module.exports = { 
    getRoutes,
    getDataById,
    getData,
    insertData,
    deleteData,
    updateStatus,
    updateData
 };