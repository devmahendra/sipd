const pool = require('../configs/db');
const { camelToSnake } = require('../helpers/database/camelToSnake');
const { buildWhereClause } = require('../helpers/database/queryBuilder');

const getData = async (page, limit, formattedFilters = []) => {
    try {
        const offset = (page - 1) * limit;

        const { whereClause, values: filterValues } = buildWhereClause(formattedFilters);
        const paginationValues = [...filterValues, limit, offset];

        const dataQuery = `
            SELECT * FROM banks
            ${whereClause}
            ORDER BY created_at ASC
            LIMIT $${filterValues.length + 1} OFFSET $${filterValues.length + 2}
        `;

        const countQuery = `
            SELECT COUNT(*) FROM banks
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

const getDataById = async (id, client = null) => {
    const query = `SELECT * FROM banks WHERE id = $1 AND deleted_at IS NULL`;
    const params = [id];

    const db = client || pool;
    const { rows } = await db.query(query, params);
    return rows[0];
};

const insertData = async ({ bankCode, bankSwift, name, description, requestedBy, status = 1 }, client) => {
    const query = `
        INSERT INTO banks 
        (bank_code, bank_swift, name, description, created_by, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    
    const values = [bankCode, bankSwift, name, description, requestedBy, status];
    const { rows } = await client.query(query, values);
    return rows[0];
};

const deleteData = async (id, client) => {
    const query = `DELETE FROM banks WHERE id = $1`;
    await client.query(query, [id]);
};

const updateStatus = async (id, status, updatedBy, client) => {
    const query = `
        UPDATE banks
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

    const query = `UPDATE banks SET ${setClause} WHERE id = $${fields.length + 1}`;

    await client.query(query, [...values, id]);
};


module.exports = { 
    getDataById,
    getData,
    insertData,
    deleteData,
    updateStatus,
    updateData
 };