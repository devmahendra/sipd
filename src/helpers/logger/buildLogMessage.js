function buildLogMessage(context) {
    const parts = [];
   
    if (context.requestId) parts.push(`reqId:${context.requestId}`);
    if (context.sequence) parts.push(`seq:${context.sequence}`);
    if (context.processName) parts.push(`processName:${context.processName}`);
    if (context.signal) parts.push(`signal:${context.signal}`);
    if (context.device) parts.push(`device:${context.device}`);
    if (context.ip) parts.push(`ip:${context.ip}`);
    if (context.method || context.path) {
        parts.push(`path:${context.method || ''} ${context.path || ''}`);
    }
    if (context.httpCode !== undefined) parts.push(`httpCode:${context.httpCode}`);
    if (context.data) parts.push(`data:${JSON.stringify(context.data)}`);

    return parts.join(' ');
}

module.exports = buildLogMessage;
