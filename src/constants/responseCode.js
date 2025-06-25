const responseCodes = {
    SUCCESS: {
        CODE: "00",
        HTTP_CODE: 200,
        MESSAGE: "Successful",
        STATUS: "Success",
    },
    SUCCESS_MULTI: {
        CODE: "00",
        HTTP_CODE: 207,
        MESSAGE: "Multiple Status response",
        STATUS: "Success",
    },
    MISSING_FIELDS: {
        CODE: "40",
        HTTP_CODE: 400,
        MESSAGE: "Invalid request parameters",
        STATUS: "Error",
    },
    UNAUTHORIZED: {
        CODE: "40",
        HTTP_CODE: 401,
        MESSAGE: "Unauthorized",
        STATUS: "Error",
    },
    FORBIDDEN: {
        CODE: "40",
        HTTP_CODE: 403,
        MESSAGE: "Forbidden Access",
        STATUS: "Error",
    },
    NOT_FOUND: {
        CODE: "41",
        HTTP_CODE: 404,
        MESSAGE: "Resource not found",
        STATUS: "Error",
    },
    METHOD_NOT_ALLOWED: {
        CODE: "42",
        HTTP_CODE: 405,
        MESSAGE: "Method Not Allowed",
        STATUS: "Error",
    },
    VALIDATION_ERROR: {
        CODE: "40",
        HTTP_CODE: 422,
        MESSAGE: "Invalid request parameters",
        STATUS: "Error",
    },
    CONFLICT: {
        CODE: "43",
        HTTP_CODE: 409,
        MESSAGE: "Conflict",
        STATUS: "Error",
    },
    INTERNAL_ERROR: {
        CODE: "96",
        HTTP_CODE: 500,
        MESSAGE: "Internal server error",
        STATUS: "Error",
    },
    BAD_GATEWAY: {
        CODE: "98",
        HTTP_CODE: 502,
        MESSAGE: "Bad Gateway",
        STATUS: "Error",
    },
    SERVICE_UNAVAILABLE: {
        CODE: "99",
        HTTP_CODE: 503,
        MESSAGE: "Service Unavailable",
        STATUS: "Error",
    },
    GATEWAY_TIMEOUT: {
        CODE: "100",
        HTTP_CODE: 504,
        MESSAGE: "Gateway Timeout",
        STATUS: "Error",
    },
};

module.exports = responseCodes;
