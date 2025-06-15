const winston = require('winston');
const consoleLogger = require('../../transports/consoleLogger');
const fileLogger = require('../../transports/fileLogger');

const mainLogger = winston.createLogger({
    levels: {
        info: 0,
        warn: 1,
        error: 2,
        debug: 3
    },
    level: process.env.LOG_LEVEL || 'info',
    transports: [consoleLogger, fileLogger],
});

module.exports = mainLogger;