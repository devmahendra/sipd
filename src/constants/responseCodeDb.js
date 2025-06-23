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
    "22001": {
        MESSAGE: "Data too long for column",
        HTTP_CODE: 400,
    },
    "42703": {
        MESSAGE: "Invalid column name (does not exist)",
        HTTP_CODE: 400,
    },
    "42601": {
        MESSAGE: "Syntax error in SQL statement",
        HTTP_CODE: 400,
    },
    "42P01": {
        MESSAGE: "Table does not exist",
        HTTP_CODE: 404,
    },
    "42P02": {
        MESSAGE: "Column does not exist",
        HTTP_CODE: 404,
    },
    "08006": {
        MESSAGE: "Database connection error",
        HTTP_CODE: 503,
    },
    "08003": {
        MESSAGE: "Connection does not exist",
        HTTP_CODE: 503,
    },
    "08001": {
        MESSAGE: "SQL client unable to establish connection",
        HTTP_CODE: 503,
    },
    "08004": {
        MESSAGE: "SQL client rejected connection",
        HTTP_CODE: 503,
    },
    "08007": {
        MESSAGE: "Transaction rollback error",
        HTTP_CODE: 500,
    },
    "08009": {
        MESSAGE: "Transaction commit error",
        HTTP_CODE: 500,
    },
    "08000": {
        MESSAGE: "General database error",
        HTTP_CODE: 500,
    },
    DEFAULT: {
        MESSAGE: "Unhandled database error",
        HTTP_CODE: 500,
    },
};

module.exports = responseCodeDb;
