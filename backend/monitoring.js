const { Bot } = require("gramio");
const db = require('./db');
const fs = require('fs').promises;
const path = require('path');
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

let bot = null;
let lastStatuses = {};

const STALE_THRESHOLD_SECONDS = 3600; // 1 hour

const CACHE_KEY = 'api:grounding:status';

async function checkStatus() {
    try {
        let rows = [];
        let source = 'DB';

        // 1. Try Redis first
        if (bot && bot.redis) {
            const cached = await bot.redis.get(CACHE_KEY);
            if (cached) {
                rows = JSON.parse(cached);
                source = 'REDIS';
                // console.log("Monitoring used Redis cache.");
            }
        }

        // 2. Fallback to DB if Redis empty
        if (rows.length === 0) {
            // console.log("Monitoring Cache Miss. Querying DB...");
            const sql = `
                SELECT t1.*
                FROM grounding_logs t1
                INNER JOIN (
                    SELECT line_id, MAX(TIMESTAMP) AS max_timestamp 
                    FROM grounding_logs 
                    GROUP BY line_id
                ) t2 ON t1.line_id = t2.line_id AND t1.TIMESTAMP = t2.max_timestamp 
                ORDER BY t2.line_id
            `;

            const [dbRows] = await db.query(sql);
            const now = new Date();

            rows = dbRows.map(row => {
                if (row.ground_status === 'OK') {
                    const lastUpdate = new Date(row.timestamp);
                    const ageInSeconds = (now - lastUpdate) / 1000;
                    if (ageInSeconds > STALE_THRESHOLD_SECONDS) {
                        row.ground_status = 'UNKNOWN';
                    }
                }
                return row;
            });

            // 3. Update Redis (Sync with API logic)
            if (bot && bot.redis) {
                await bot.redis.set(CACHE_KEY, JSON.stringify(rows), 'EX', 900);
            }
        }



        // Read settings dynamically
        let fileSettings = {};
        try {
            const data = await fs.readFile(SETTINGS_FILE, 'utf8');
            fileSettings = JSON.parse(data);
        } catch (error) { } // Ignore missing file

        const settings = {
            telegram_chat_id: fileSettings.telegram_chat_id || process.env.TELEGRAM_CHAT_ID,
            telegram_alert_enabled: fileSettings.telegram_alert_enabled ?? (process.env.TELEGRAM_ALERT_ENABLED === 'true')
        };

        for (const row of rows) {
            const lineId = row.line_id;
            const currentStatus = row.ground_status;

            // Check for change
            if (lastStatuses[lineId] && lastStatuses[lineId] !== currentStatus) {
                const message = `⚠️ <b>Status Changed</b>\n\n📍 <b>Line:</b> ${lineId}\n🔄 <b>Status:</b> ${lastStatuses[lineId]} ➡️ ${currentStatus}\n🕒 <b>Time:</b> ${new Date().toLocaleTimeString()}`;

                if (settings.telegram_alert_enabled && settings.telegram_chat_id && bot) {
                    try {
                        await bot.api.sendMessage({
                            chat_id: settings.telegram_chat_id,
                            text: message,
                            parse_mode: "HTML"
                        });
                        console.log(`Notification sent for Line ${lineId}`);
                    } catch (err) {
                        console.error("Failed to send Telegram notification:", err);
                    }
                }
            }

            // Update cache
            lastStatuses[lineId] = currentStatus;
        }

    } catch (err) {
        console.error("Monitoring check failed:", err);
    }
}

function startMonitoring(redisClient = null) {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.warn("TELEGRAM_BOT_TOKEN not set. Monitoring disabled.");
        return;
    }

    bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
    // Attach redis client to bot instance or global scope
    bot.redis = redisClient;

    // Initial check without notifications to populate cache
    // We can do this by running checkStatus once and suppressing notifications, 
    // or just let the first run populate. 
    // To avoid flood on restart, let's just run it.
    // Ideally we might want to suppress first run alerts, but for now simple is ok.
    // Actually, distinct logic for first run is safer.

    initCache().then(() => {
        console.log("Monitoring service started. Polling every 60s. Running initial check now...");
        checkStatus(); // Run immediately
        setInterval(checkStatus, 60000);
    });
}

async function initCache() {
    try {
        const sql = `
            SELECT t1.*
            FROM grounding_logs t1
            INNER JOIN (
                SELECT line_id, MAX(TIMESTAMP) AS max_timestamp 
                FROM grounding_logs 
                GROUP BY line_id
            ) t2 ON t1.line_id = t2.line_id AND t1.TIMESTAMP = t2.max_timestamp 
        `; // Simplified query for cache init
        const [rows] = await db.query(sql);
        const now = new Date();

        rows.forEach(row => {
            let currentStatus = row.ground_status;
            if (currentStatus === 'OK') {
                const lastUpdate = new Date(row.timestamp);
                if ((now - lastUpdate) / 1000 > STALE_THRESHOLD_SECONDS) {
                    currentStatus = 'UNKNOWN';
                }
            }
            lastStatuses[row.line_id] = currentStatus;
            console.log(`Initial status for Line ${row.line_id}: ${currentStatus}`);
        });
    } catch (err) {
        console.error("Failed to initialize monitoring cache:", err);
    }
}

module.exports = { startMonitoring };
