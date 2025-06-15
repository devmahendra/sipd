const responseDefault = require('./responseDefault');
const { logData } = require('../logger');

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
    logData({ req, httpCode, processName, data: error });
    res.status(httpCode).json(responseDefault(httpCode, error, req));
};

module.exports = {
    respondSuccess,
    respondError,
    HttpError,
};
