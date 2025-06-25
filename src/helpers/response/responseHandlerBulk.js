const pool = require("../../configs/db");
const pLimit = require("p-limit");
const {
  handlePostgresError,
} = require("../../helpers/database/databaseHandler");
const { respondSuccess, respondError } = require("./responseHandler");

/**
 * Helper for handling bulk insert/update/delete responses.
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {string} processName - Name of the process for logging
 * @param {Array} dataArray - Array of data to process
 * @param {function} callbackFn - Async function to call per item (data, index)
 * @param {string} message - Success message to return on full success
 */
const responseBulk = async ({
    req,
    res,
    processName,
    dataArray,
    callbackFn,
    concurrency = 5,
    }) => {
        const summary = {
            success: 0,
            failed: 0,
            total: dataArray.length,
    };

    const errors = [];
    const limit = pLimit(concurrency);

    const tasks = dataArray.map((data, i) =>
        limit(async () => {
            const client = await pool.connect();

            try {
                await client.query("BEGIN");
                await callbackFn(data, i, client);
                await client.query("COMMIT");
                summary.success++;
            } catch (error) {
                await client.query("ROLLBACK");
                summary.failed++;

                const handledError = error.code
                    ? handlePostgresError(error)
                    : { message: error.message || "Unhandled error", httpCode: 500 };

                errors.push({
                    index: i,
                    message: handledError.message,
                });
            } finally {
                client.release();
            }
        })
    );

    await Promise.all(tasks);

    const isAllFailed = summary.success === 0;
    const isPartial = summary.failed > 0 && summary.success > 0;

    const responsePayload = {
        summary,
    };
    if (errors.length) responsePayload.errors = errors;

    if (isAllFailed) {
        return respondError(res, req, 400, processName, responsePayload);
    }

    const httpCode = isPartial ? 207 : 200;
    return respondSuccess(res, req, httpCode, processName, responsePayload);
};

module.exports = {
    responseBulk,
};
