const sensitiveKeys = require('../constants/sensitiveKeys');

function maskSensitive(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    return Object.entries(obj).reduce((masked, [key, value]) => {
        const lowerKey = key.toLowerCase();

        if (sensitiveKeys.includes(lowerKey)) { masked[key] = '[MASKED]';
        } else if (typeof value === 'string') { masked[key] = maskString(value); 
        } else if (Array.isArray(value)) {
            masked[key] = value.map(v =>
            typeof v === 'string' ? maskString(v) : v);
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
