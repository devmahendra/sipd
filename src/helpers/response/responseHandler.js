const responseDefault = require('./responseDefault');
const { logData } = require('../logger');
const { handlePostgresError } = require('../../helpers/database/databaseHandler');

/**
 * Custom HTTP error with status code
 */
class HttpError extends Error {
    constructor(message, httpCode) {
        super(message);
        this.name = this.constructor.name;
        this.httpCode = httpCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Handle and throw standard HttpError after logging.
 * Used in service layer try-catch blocks.
 * 
 * @param {Error} error - Raw error (Postgres or other)
 * @param {string} processName - Service process name for logging
 * @throws {HttpError}
 */
const handleServiceError = (error, processName) => {
    if (error instanceof HttpError) {
        throw error;
    }

    const handledError = error.code
        ? handlePostgresError(error, processName)
        : new HttpError(error.message || 'Internal server error', error.status || 500);

    logData({
        httpCode: handledError.httpCode,
        level: 'error',
        processName,
        data: handledError.message,
    });

    throw handledError;
};

/**
 * Send success response and log it
 * @param {object} res - Express response object
 * @param {object} req - Express request object
 * @param {number} httpCode - HTTP status code
 * @param {string} processName - The name of the current process
 * @param {any} data - Data to send in response
 */
const respondSuccess = (res, req, httpCode, processName, data) => {
    logData({ req, httpCode, processName, data });
    res.status(httpCode).json(responseDefault(httpCode, data, req));
};

/**
 * Send error response and log it
 * @param {object} res - Express response object
 * @param {object} req - Express request object
 * @param {number} httpCode - HTTP status code
 * @param {string} processName - The name of the current process
 * @param {Error|string|object} error - Error details
 */
const respondError = (res, req, httpCode, processName, error) => {

    const message = typeof error === 'string'
        ? error
        : error.message || error || 'Internal Server Error';

    logData({ req, httpCode, processName, data: message });

    res.status(httpCode).json(responseDefault(httpCode, message, req));
};


module.exports = {
    respondSuccess,
    respondError,
    HttpError,
    handleServiceError,
};
