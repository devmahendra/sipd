const { createClient } = require("redis");
const { logData } = require("../helpers/logger");

const processName = "REDIS_CLIENT";

const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => {
        if (retries > 10) {
            logData({
            level: "error",
            processName,
            data: "Too many Redis reconnect attempts. Giving up. Reconnect failed.",
            });
            return new Error("Redis reconnect failed");
        }
        logData({
            level: "warn",
            processName: processName,
            data: `Retrying Redis connection... attempt ${retries}`,
        });
        return Math.min(retries * 100, 3000); // exponential backoff, max 3s
        },
    },
});

// Listen for client-level errors
redisClient.on("error", (err) => {
    logData({
        level: "error",
        processName,
        data: `Redis client error: ${err.message || err}`,
    });
});

redisClient.on("reconnecting", () => {
    logData({
        level: "warn",
        processName: processName,
        data: "Redis client reconnecting...",
    });
});

redisClient.on("connect", () => {
    logData({
        processName: processName,
        data: "Redis attempting connection...",
    });
});

redisClient.on("ready", () => {
    logData({
        processName: processName,
        data: "Redis is ready!",
    });
});

async function connectRedis() {
    if (!redisClient.isOpen) {
        try {
        await redisClient.connect();
        logData({
            processName: processName,
            data: "Redis connected successfully",
        });
        } catch (err) {
        logData({
            level: "error",
            processName,
            data: `Redis connection failed: ${err.message || err}`,
        });
        }
    }
}

connectRedis();

module.exports = { redisClient, connectRedis };
