const responseCodes = require("../../constants/responseCode");

/**
 * Maps HTTP status code to the appropriate responseType key
 * @param {number} httpCode 
 * @returns {string} responseType key
 */
const mapHttpCode = (httpCode) => {
    const entry = Object.entries(responseCodes).find(
        ([, value]) => value.HTTP_CODE === httpCode
    );
    return entry ? entry[0] : 'INTERNAL_ERROR'; 
};

module.exports = mapHttpCode;
