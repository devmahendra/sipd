const { asyncLocalStorage } = require('../../utils/asyncContext');
const { addPadding } = require('../../helpers/logger/padding');

function getLogContext(logObject, now, formatDate) {
    const store = asyncLocalStorage.getStore();
    const currentSeq = store?.get('sequence') || 1;
    const isSystemLog = !store?.get('requestId') && !logObject.requestId;
    
    const requestContext = {
        requestId: addPadding(store?.get('requestId'), 36) || 'N/A',
        sequence: currentSeq,
        device: addPadding(logObject.device != null ? logObject.device : store?.get('device'), 5) ?? 0,
        signal: logObject.signal || store?.get('signal') || 'N',
        ip: addPadding(store?.get('ip'), 15) || 'N/A',
        method: addPadding(store?.get('method'), 10) || 'N/A',
        path: addPadding(store?.get('path'), 50) || 'N/A',
        processName: addPadding(logObject.processName, 50) || addPadding('', 50),
        httpCode: logObject.httpCode || store?.get('httpCode') || addPadding('', 3),
        timestamp: now.toISOString(),
        logTime: formatDate(),
        data:
        typeof logObject.data === 'string'
            ? { message: logObject.data }
            : logObject.data || store?.get('data') || {}
    }

    const systemContext = {
        processName: addPadding(logObject.processName, 25) || addPadding('', 25),
        timestamp: now.toISOString(),
        logTime: formatDate(),
        data:
        typeof logObject.data === 'string'
            ? { message: logObject.data }
            : logObject.data || store?.get('data') || {}
    }

    return isSystemLog ? systemContext : requestContext;
}

module.exports = getLogContext;
