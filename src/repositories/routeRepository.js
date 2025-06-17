const pool = require('../configs/db');
const { camelToSnake } = require('../helpers/database/camelToSnake');
const { buildWhereClause } = require('../helpers/database/queryBuilder');

const getRoutes = async () => {
    const query = `
        SELECT id, name, path, method, description, is_protected, internal, menu_id, action_type 
        FROM routes 
        WHERE status = '2'
    `;
  
    const { rows } = await pool.query(query);
    return rows;
};

const getDataById = async (id, client) => {
    const { rows } = await client.query(`SELECT * FROM routes WHERE id = $1`, [id]);
    return rows[0];
};

const getData = async (page, limit, filters = {}) => {
    try {
        const offset = (page - 1) * limit;

        const { whereClause, values: filterValues } = buildWhereClause(filters);
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

const insertData = async ({ name, path, method, isProtected, internal, description, menuId, actionType, requestedBy, status = 1 }, client) => {
    const query = `
        INSERT INTO routes 
        (name, path, method, is_protected, internal, description, menu_id, action_type, created_by, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
    `;
    
    const values = [name, path, method, isProtected, internal, description, menuId, actionType, requestedBy, status];
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

const updateData = async (id, changes, approvalStatus, requestedBy, client) => {
    if (!changes || typeof changes !== 'object') {
        throw new Error('Invalid changes object provided');
    }

    const source = changes.new || changes.old || changes;
    if (!source || Object.keys(source).length === 0) {
        throw new Error('No valid data found in changes.new or changes.old');
    }
    
    const dataToUpdate = { ...source };

    const statusChanged = 
        changes.old?.status !== undefined &&
        changes.new?.status !== undefined &&
        changes.old.status !== changes.new.status;

    if (!statusChanged) {
        dataToUpdate.status = approvalStatus;
    }

    dataToUpdate.updated_by = requestedBy;

    const fields = Object.keys(dataToUpdate);
    const values = Object.values(dataToUpdate);

    if (fields.length === 0) {
        throw new Error('No changes provided to update route');
    }

    const dbFields = fields.map(camelToSnake);
    const setClause = dbFields
        .map((field, index) => `${field} = $${index + 1}`)
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