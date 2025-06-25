const pool = require('../configs/db');
const { camelToSnake } = require('../helpers/database/camelToSnake');
const { buildWhereClause } = require('../helpers/database/queryBuilder');

const getData = async (page, limit, formattedFilters = []) => {
    try {
        const offset = (page - 1) * limit;

        const { whereClause, values: filterValues } = buildWhereClause(formattedFilters);
        const paginationValues = [...filterValues, limit, offset];

        const dataQuery = `
            SELECT * FROM vw_user_details
            ${whereClause}
            LIMIT $${filterValues.length + 1} OFFSET $${filterValues.length + 2}
        `;

        const countQuery = `
            SELECT COUNT(*) FROM users
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
    const query = `SELECT * FROM vw_user_details WHERE user_id = $1`;
    const params = [id];

    const db = client || pool;
    const { rows } = await db.query(query, params);
    return rows[0];
};

const insertUser = async (client, { username, password, requestedBy, status }) => {
    const query = `
        INSERT INTO users (username, password, created_by, status)
        VALUES ($1, $2, $3, $4)
        RETURNING id, username, created_at;
    `;
    const values = [username, password, requestedBy, status];
    const result = await client.query(query, values);
    return result.rows[0];
};

const insertUserProfile = async (client, { userId, firstName, lastName, email, phoneNumber }) => {
    const query = `
        INSERT INTO user_profile (user_id, first_name, last_name, email, phone_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, first_name, last_name, email, phone_number;
    `;
    const values = [userId, firstName, lastName, email, phoneNumber];
    const result = await client.query(query, values);
    return result.rows[0];
};

const insertUserBranch = async (client, { userId, branchId }) => {
    const query = `
        INSERT INTO user_branch (user_id, branch_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, branch_id) DO NOTHING
        RETURNING *;
    `;
    const values = [userId, branchId];
    const result = await client.query(query, values);
    return result.rows[0];
};

const insertUserRole = async (client, { userId, roleId }) => {
    const query = `
        INSERT INTO user_roles (user_id, role_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, role_id) DO NOTHING
        RETURNING *;
    `;
    const values = [userId, roleId];
    const result = await client.query(query, values);
    return result.rows[0];
};

const deleteData = async (id, client) => {
    await client.query('DELETE FROM user_roles WHERE user_id = $1', [id]);
    await client.query('DELETE FROM user_branch WHERE user_id = $1', [id]);
    await client.query('DELETE FROM user_profile WHERE user_id = $1', [id]);
    await client.query('DELETE FROM users WHERE id = $1', [id]);
};

const updateStatus = async (id, status, updatedBy, client) => {
    const query = `
        UPDATE users
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

    const query = `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1}`;

    await client.query(query, [...values, id]);
};

const updateUserProfile = async (userId, data, client) => {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) throw new Error('No fields to update');

    const dbFields = fields.map(camelToSnake);
    const setClause = dbFields
        .map((field, i) => `${field} = $${i + 1}`)
        .join(', ');

    const query = `UPDATE user_profile SET ${setClause} WHERE user_id = $${fields.length + 1}`;
    await client.query(query, [...values, userId]);
};

const deleteUserRoles = async (userId, client) => {
    await client.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
};

const deleteUserBranches = async (userId, client) => {
    await client.query('DELETE FROM user_branch WHERE user_id = $1', [userId]);
};



module.exports = { 
    getDataById,
    getData,
    insertUser,
    insertUserProfile,
    insertUserBranch,
    insertUserRole,
    deleteData,
    updateStatus,
    updateData,
    updateUserProfile,
    deleteUserRoles,
    deleteUserBranches
 };