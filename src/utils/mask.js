const sensitiveKeys = require('../constants/sensitiveKeys');

function maskSensitive(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(maskSensitive);
    }

    return Object.entries(obj).reduce((masked, [key, value]) => {
        const lowerKey = key.toLowerCase();

        if (sensitiveKeys.includes(lowerKey)) {
            masked[key] = '[MASKED]';
        } else if (typeof value === 'object' && value !== null) {
            masked[key] = maskSensitive(value);
        } else if (typeof value === 'string') {
            masked[key] = maskString(value);
        } else {
            masked[key] = value;
        }

        return masked;
    }, {});
}

function maskString(str) {
  return str
    .replace(/(accessToken|refreshToken)=([^\s;]+)/gi, '$1=[MASKED]')
    .replace(/(authorization):?\s*Bearer\s+([^\s]+)/gi, '$1: Bearer [MASKED]');
}

module.exports = {
  maskSensitive,
};
