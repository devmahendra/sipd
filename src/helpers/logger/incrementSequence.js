const { asyncLocalStorage } = require('../../utils/asyncContext');

function shouldLog(level) {
    const logLevels = ['info', 'warn', 'error', 'debug']; // Order of severity
    const currentLevel = process.env.LOG_LEVEL;
    return logLevels.indexOf(currentLevel) >= logLevels.indexOf(level);
}

const incrementSequence = (level) => {
    if (shouldLog(level)) {
        const store = asyncLocalStorage.getStore();
        if (store) {
            const currentSeq = store.get('sequence') || 1;
            store.set('sequence', currentSeq + 1);
        }
    }
};

module.exports = { incrementSequence };
