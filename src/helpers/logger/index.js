const mainLogger = require('./mainLogger');
const logstashOnlyLogger = require('./logstashOnlyLogger');
const getLogContext = require('./getLogContext');
const buildLogMessage = require('./buildLogMessage');
const { formatDate } = require('../../utils/dateFormatter');
const { incrementSequence } = require('../../helpers/logger/incrementSequence');

const logData = (logObject, mode) => {
    const now = new Date();

    // Determine level from httpCode if not explicitly provided
    let level = logObject.level;
    if (!level) {
        const code = logObject.httpCode || 200;
        level = code >= 500 ? 'error' : code > 200 ? 'warn' : 'info';
    }

    // Determine processName if not provided
    let processName = logObject.processName;
    if (!processName) {
        processName = logObject.req?.routeConfig?.name || 'Unknown Process';
    }

    // Determine device if not provided
    let device = logObject.device;
    if (!device) {
        device = 0;
    }

    // Determine signal if not provided
    let signal = logObject.signal;
    if (!signal) {
        signal = 'N';
    }

    const context = getLogContext({ ...logObject, level, processName, device, signal }, now, formatDate);
    incrementSequence(level);

    const message = buildLogMessage(context);

    mainLogger.log({
        appName: process.env.APP_NAME,
        level,
        message,
        ...context
    });

    if (mode === 1) {
        logstashOnlyLogger.log({
        appName: process.env.APP_NAME,
        level,
        ...context
        });
    }
};

module.exports = {
  logger: mainLogger,
  logData
};
