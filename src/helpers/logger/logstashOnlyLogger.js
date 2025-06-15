const winston = require('winston');
const logstashLogger = require('../../transports/logstashLogger');

const logstashOnlyLogger = winston.createLogger({
    levels: {
        info: 0,
        warn: 1,
        error: 2,
        debug: 3
    },
    level: process.env.LOG_LEVEL || 'info',
    transports: [logstashLogger],
});

module.exports = logstashOnlyLogger;