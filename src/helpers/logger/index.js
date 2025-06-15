const mainLogger = require('./mainLogger');
const logstashOnlyLogger = require('./logstashOnlyLogger');
const getLogContext = require('./getLogContext');
const buildLogMessage = require('./buildLogMessage');
const { formatDate } = require('../../utils/dateFormatter');
const { incrementSequence } = require('../../helpers/logger/incrementSequence');

function resolveLogLevel(httpCode, explicitLevel) {
    if (explicitLevel) return explicitLevel;
    if (!httpCode || httpCode < 300) return 'info';
    if (httpCode < 500) return 'warn';
    return 'error';
}

function getProcessName(req, explicitName) {
    return explicitName || req?.routeConfig?.name || 'Unknown Process';
}
  
const logData = (logObject, logTarget = 'default') => {
    const now = new Date();
    const level = resolveLogLevel(logObject.httpCode, logObject.level);
    const processName = getProcessName(logObject.req, logObject.processName);
    const device = logObject.device ?? 0;
    const signal = logObject.signal ?? 'N';

    const context = getLogContext({ ...logObject, level, processName, device, signal }, now, formatDate);
    incrementSequence(level);

    const message = buildLogMessage(context);
    const logPayload = {
        appName: process.env.APP_NAME,
        level,
        message,
        ...context
    };

    mainLogger.log(logPayload);
    if (logTarget === 'logstashInit') {
        logstashOnlyLogger.log(logPayload);
    }
};

module.exports = {
  logger: mainLogger,
  logData
};
