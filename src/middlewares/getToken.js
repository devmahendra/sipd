const jwt = require("jsonwebtoken");
const { redisClient } = require("../configs/redis");
const { respondError } = require("../helpers/response/responseHandler");

const getRequestToken = async (req, res, next) => {
    const token = req.cookies.accessToken;
    const processName = "VALIDATE_TOKEN";

    // If no token found in cookies
    if (!token) {
        return respondError(res, req, 400, processName, "Token not found");
    }

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check Redis session by token's JTI
        const sessionData = await redisClient.get(decoded.jti);

        if (!sessionData) {
            return respondError(res, req, 401, processName, "Unauthorized");
        }

        // Set user data in request and continue
        req.user = JSON.parse(sessionData);
        next();

    } catch (error) {
        return respondError(res, req, 500, processName, "INTERNAL_ERROR " + error.message);
    }
};

module.exports = getRequestToken;
