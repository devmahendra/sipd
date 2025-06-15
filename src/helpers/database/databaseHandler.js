const responseCodeDb = require("../../constants/responseCodeDb");

const handlePostgresError = (error) => {
    const dbCode = error.code;
    const response = responseCodeDb[dbCode] || responseCodeDb.DEFAULT;

    let message = response.MESSAGE;

    if (dbCode === "23505") {
        message += ` ${error.constraint || "unknown"}`;
    } else if (dbCode === "23502") {
        message += `: ${error.column || "unknown"}`;
    }

    return {
        message,
        httpCode: response.HTTP_CODE,
    };
};

module.exports = { handlePostgresError };
