const responseCodes = require("../../constants/responseCode");
const mapHttpCode = require("../logger/mapHttpCode");

/**
 * Builds a standard response based on HTTP code, data, and request.
 * Automatically maps HTTP code to internal response type.
 * 
 * @param {number} httpCode - HTTP status code (e.g., 200, 400, 500)
 * @param {*} data - Response data (can be object, string, or error)
 * @param {Object} [req] - Optional request object to extract serviceCode
 * @returns {Object} Standardized response payload
 */
const responseDefault = (httpCode = 200, data = null, req = null) => {
    if (typeof httpCode === 'number') {
        httpCode = mapHttpCode(httpCode);
    }

    const response = responseCodes[httpCode];

    if (!response) {
        return {
            responseCode: "5000099",
            responseMessage: "Unknown response type",
        };
    }

    const serviceCode = req?.routeId ? String(req.routeId).padStart(2, "0") : "00";
    const responseCode = `${response.HTTP_CODE}${serviceCode}${response.CODE}`;

    let responseMessage = response.MESSAGE;

    // ✅ Only append `data` if it's not already included
    if (typeof data === 'string' && data.trim()) {
        const trimmedData = data.trim();
        if (!responseMessage.includes(trimmedData)) {
            responseMessage = `${responseMessage}, ${trimmedData}`;
        }
    }

    const result = {
        responseCode,
        responseMessage,
    };

    if (typeof data !== 'string' && data !== null && data !== undefined && data !== '') {
        result.responseData = data;
    }

    return result;
};




module.exports = responseDefault;
