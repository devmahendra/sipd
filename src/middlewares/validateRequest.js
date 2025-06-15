const { respondError } = require("../helpers/response/responseHandler");

const validateRequest = (route) => (req, res, next) => {
    const processName = "VALIDATE_REQUEST";
    req.serviceCode = route.id;

    try {
        if (!route.validation) return next();

        // Support body, query, and params
        const sources = ["body", "query", "params"];
        for (const source of sources) {
            if (route.validation[source]) {
                const { error, value } = route.validation[source].validate(req[source], { abortEarly: false });

                if (error) {
                    const errors = error.details.map((err) => err.message);
                    return respondError(res, req, 400, processName, { errors });
                }

                req[source] = value;
            }
        }

        // Validation passed
        return next();
    } catch (error) {
        return respondError(res, req, 500, processName, { error: error.message });
    }
};

module.exports = validateRequest;
