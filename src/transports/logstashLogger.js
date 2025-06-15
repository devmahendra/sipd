const { format } = require('winston');
const LogstashTCPTransport = require('../configs/logstash');

const removeMessageField = format((info) => {
    delete info.message;
    return info;
});

module.exports = new LogstashTCPTransport({
    host: process.env.LOGSTASH_HOST,
    port: process.env.LOGSTASH_PORT,
    format: format.combine(
        removeMessageField(),
        format.timestamp(),
        format.json()
    )
});