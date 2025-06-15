const { asyncLocalStorage } = require('../utils/asyncContext');

const requestContext = (req, res, next) => {
  asyncLocalStorage.run(new Map(), () => {
    asyncLocalStorage.getStore().set('requestId', req.headers['x-request-id']);
    next();
  });
};

module.exports = requestContext;
