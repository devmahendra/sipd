const pool = require('../configs/db');
const { buildWhereClause } = require('../helpers/database/queryBuilder');

const getData = async (page, limit, filters = {}) => {
    try {
        const offset = (page - 1) * limit;

        const { whereClause, values: filterValues } = buildWhereClause(filters);
        const paginationValues = [...filterValues, limit, offset];

        const dataQuery = `
            SELECT * FROM approvals
            ${whereClause}
            ORDER BY requested_at DESC
            LIMIT $${filterValues.length + 1} OFFSET $${filterValues.length + 2}
        `;

        const countQuery = `
            SELECT COUNT(*) FROM approvals
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

const getDataById = async (id, status, client) => {
    const { rows } = await client.query(`SELECT * FROM approvals WHERE id = $1 AND status <> $2`, [id, status]);
    return rows[0];
};

const insertData = async ({ entityName, entityId, actionType, changes, requestedBy, status = 1 }) => {
    const query = `
      INSERT INTO approvals (entity_name, entity_id, action_type, changes, requested_by, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, entity_name, entity_id, status
    `;
  
    const values = [entityName, entityId, actionType, changes, requestedBy, status];
  
    const { rows } = await pool.query(query, values);
    return rows[0];
};

const approveData = async (id, approvedBy, status, client) => {
    const query = `
        UPDATE approvals
        SET status = $2,
            approved_by = $1,
            approved_at = NOW()
        WHERE id = $3
    `;
    await client.query(query, [approvedBy, status, id]);
};
  

module.exports = { 
    getData,
    getDataById,
    insertData,
    approveData
};