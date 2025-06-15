const { transports, format } = require('winston');
const { addPadding } = require('../helpers/logger/padding');

module.exports = new transports.Console({
    format: format.combine(
        format.colorize(),
        format.printf(info => {
            return `${addPadding(info.level, 5)} ${info.logTime} ${info.message}`;
        })
    )
});
