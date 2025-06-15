/**
 * Extract and sanitize pagination info from request
 * @param {Object} req - Express request
 * @returns {{ page: number, limit: number }}
 */
const getPaginationParams = (req) => {
    const page = Number(req.body.page) || 1;
    const limit = Number(req.body.limit) || 10;
    return { page, limit };
};
  
module.exports = getPaginationParams;
  