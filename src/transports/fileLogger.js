const { format } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { addPadding } = require('../helpers/logger/padding');

module.exports = new DailyRotateFile({
    filename: 'src/logs/%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: format.combine(
        format.timestamp(),
        format.printf(info => {
            return `${addPadding(info.level, 5)} ${info.logTime} ${info.message}`;
        })
    )
});