const responseCodeDb = {
    "23505": {
        MESSAGE: "Duplicate entry",
        HTTP_CODE: 409,
    },
    "23502": {
        MESSAGE: "Missing required field",
        HTTP_CODE: 400,
    },
    "23503": {
        MESSAGE: "Related resource not found (foreign key violation)",
        HTTP_CODE: 404,
    },
    "23514": {
        MESSAGE: "Data validation failed (check constraint violation)",
        HTTP_CODE: 422,
    },
    DEFAULT: {
        MESSAGE: "Unhandled database error",
        HTTP_CODE: 500,
    },
};

module.exports = responseCodeDb;
