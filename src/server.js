// server.js
require("dotenv").config({ path: __dirname + "/../.env" });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const { connectRedis } = require("./configs/redis");
const initializeRoutes = require("./routes/route");

const requestContext = require('./middlewares/requestContext');
const { requestLogger } = require("./middlewares/requestLogger");

const app = express();
const HOST = process.env.APP_HOST;
const PORT = process.env.APP_PORT;

const { logData } = require("./helpers/logger");

// 🛡️ CORS setup
app.use(
    cors({
        origin: `${HOST}:${PORT}`,
        credentials: true,
    })
);

// 🍪 Middleware setup
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// 🔒 Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// 🧠 Inject request context into AsyncLocalStorage
app.use(requestContext);

// 📝 Log each request (optional, can be toggled or filtered)
app.use(requestLogger);

// 🚀 Boot up
(async () => {
    try {
        await connectRedis();
        await initializeRoutes(app);
        let processName = "INITIALIZE_SERVICE";

        app.listen(PORT, () => {
            logData({
                processName,
                data: `Server running on port ${PORT}`,
            });
        });
    } catch (err) {
        logData({
            level: 'error',
            processName,
            data: `Failed to initialize server: `, err,
        });
        process.exit(1);
    }
})();
