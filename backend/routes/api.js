const db = require('../db');
const fs = require('fs').promises;
const path = require('path');
const SETTINGS_FILE = path.join(__dirname, '../settings.json');

async function routes(fastify, options) {

    // Helper: Delay execution
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Helper: Format Date for MySQL
    const formatDate = (dateStr) => {
        if (!dateStr) return new Date(); // Default to now
        return new Date(dateStr).toISOString().slice(0, 19).replace('T', ' ');
    };

    // Endpoint: Get Temperature & Humidity Data
    // Replaces: get_temphygro_data.php
    fastify.get('/temphygro', async (request, reply) => {
        const page = parseInt(request.query.page) || 1;
        const cacheKey = `api:temphygro:page:${page}`;

        try {
            // 1. Try to get data from Redis
            const cachedData = await fastify.redis.get(cacheKey);
            if (cachedData) {
                // fastify.log.info(`Cache HIT for ${cacheKey}`);
                return JSON.parse(cachedData);
            }

            // fastify.log.info(`Cache MISS for ${cacheKey}`);

            let data = {};

            if (page === 3) {
                // Logic for Page 3 (Facility)

                // 1. Get Temp & Hygro for device 27 (Stencil Room)
                const [rowsTemp] = await db.query(
                    "SELECT devid, humidity, temperature, created_at FROM temphygro_data WHERE devid = 27 ORDER BY created_at DESC LIMIT 24"
                );

                rowsTemp.forEach(row => {
                    if (!data[row.devid]) data[row.devid] = [];
                    data[row.devid].push(row);
                });

                // 2. Get Air Pressure for device 100
                const [rowsPressure] = await db.query(
                    "SELECT devid, REPLACE(value1, ',', '.') AS temperature, created_at FROM airpressure_data WHERE devid = 100 ORDER BY created_at DESC LIMIT 24"
                );

                if (rowsPressure) {
                    rowsPressure.forEach(row => {
                        row.humidity = null; // Pressure has no humidity
                        if (!data[row.devid]) data[row.devid] = [];
                        data[row.devid].push(row);
                    });
                }

            } else {
                // Logic for Page 1 and 2
                let deviceIds = [];
                if (page === 1) {
                    deviceIds = [1, 2, 4, 8, 5, 6, 20, 21, 22, 23, 3, 7];
                } else if (page === 2) {
                    deviceIds = [10, 11, 12, 13, 24, 25, 26];
                }

                if (deviceIds.length > 0) {
                    // Use a loop or constructing a UNION query. 
                    // To keep it simple and close to original, we can do parallel queries or one UNION.
                    // UNION is more efficient.

                    const queryParts = deviceIds.map(id =>
                        `(SELECT * FROM temphygro_data WHERE devid = ${id} ORDER BY created_at DESC LIMIT 24)`
                    );

                    const finalQuery = queryParts.join(" UNION ALL ");
                    const [rows] = await db.query(finalQuery);

                    rows.forEach(row => {
                        if (!data[row.devid]) data[row.devid] = [];
                        data[row.devid].push(row);
                    });
                }
            }

            // Reverse the data arrays (oldest to newest for charts usually, but PHP did this)
            // PHP: $records = array_reverse($records);
            for (const devid in data) {
                data[devid].reverse();
            }

            // 2. Save to Redis
            // Expiration: 15 minutes = 900 seconds
            await fastify.redis.set(cacheKey, JSON.stringify(data), 'EX', 900);

            return data;

        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({ error: "Database query failed: " + error.message });
        }
    });

    // Endpoint: Get Grounding Status
    // Replaces: get_latest_status.php
    fastify.get('/grounding', async (request, reply) => {
        const cacheKey = 'api:grounding:status';

        try {
            // 1. Try to get data from Redis
            const cachedData = await fastify.redis.get(cacheKey);
            if (cachedData) {
                // fastify.log.info(`Cache HIT for ${cacheKey}`);
                return JSON.parse(cachedData);
            }

            // fastify.log.info(`Cache MISS for ${cacheKey}`);

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

            const [rows] = await db.query(sql);

            // Stale check logic
            // 1 hour = 3600 seconds
            const STALE_THRESHOLD_SECONDS = 3600;
            const now = new Date(); // Server time (assuming server is set correctly or use UTC and adjust)

            // Note: DB timestamp might be in local time (Asia/Jakarta) without timezone info.
            // In Node, we need to be careful. 'mysql2' usually returns Date objects if parsed, or strings.
            // Let's assume it returns standard Date objects or strings.
            // If the server where this runs is in same timezone as DB insert, new Date() is fine.

            const modifiedRows = rows.map(row => {
                if (row.ground_status === 'OK') {
                    const lastUpdate = new Date(row.timestamp); // Ensure this parses correctly
                    const ageInSeconds = (now - lastUpdate) / 1000;

                    if (ageInSeconds > STALE_THRESHOLD_SECONDS) {
                        row.ground_status = 'UNKNOWN';
                    }
                }
                return row;
            });

            // 2. Save to Redis
            // Expiration: 15 minutes = 900 seconds
            await fastify.redis.set(cacheKey, JSON.stringify(modifiedRows), 'EX', 900);

            return modifiedRows;

        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({ error: "Database query failed: " + error.message });
        }
    });

    // Endpoint: Get SMT Data (Keyset Pagination & Redis & Filtering)
    fastify.get('/admin/smt', async (request, reply) => {
        const limit = parseInt(request.query.limit) || 10;
        const cursor = parseInt(request.query.cursor) || null; // cursor is the last 'id' from previous page

        // Filters
        const filterDevId = request.query.devid || null;
        const filterTemp = request.query.temp || null;
        const filterHumidity = request.query.humidity || null;

        const cacheKey = `api:admin:smt:cursor:${cursor || 'init'}:limit:${limit}:devid:${filterDevId}:temp:${filterTemp}:hum:${filterHumidity}`;

        try {
            // 1. Try Cache for Data
            const cachedData = await fastify.redis.get(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData);
            }

            // SMT Device IDs
            const smtIds = [1, 2, 4, 8, 5, 6, 20, 21, 22, 23, 3, 7];
            const idsString = smtIds.join(',');

            // 2. Build Query
            // Base query always filters by valid SMT IDs first
            let sql = `SELECT id, devid, temperature, humidity, created_at FROM temphygro_data WHERE devid IN (${idsString})`;
            const params = [];

            // Add Filters
            if (filterDevId) {
                sql += ` AND devid = ?`;
                params.push(filterDevId);
            }
            if (filterTemp) {
                sql += ` AND temperature = ?`;
                params.push(filterTemp);
            }
            if (filterHumidity) {
                sql += ` AND humidity = ?`;
                params.push(filterHumidity);
            }

            // Keyset Pagination (Cursor)
            if (cursor) {
                sql += ` AND id < ?`;
                params.push(cursor);
            }

            sql += ` ORDER BY id DESC LIMIT ?`;
            params.push(limit);

            // 3. Exec Query
            const [rows] = await db.query(sql, params);

            // 4. Determine Next Cursor
            let nextCursor = null;
            if (rows.length > 0) {
                nextCursor = rows[rows.length - 1].id;
            }

            const response = {
                data: rows,
                nextCursor: nextCursor
            };

            // 5. Save to Redis (TTL 60s)
            await fastify.redis.set(cacheKey, JSON.stringify(response), 'EX', 60);

            return response;

        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({ error: error.message });
        }
    });

    // Endpoint: Add SMT Data
    fastify.post('/admin/smt', async (request, reply) => {
        const { devid, temperature, humidity, created_at } = request.body;
        // Basic validation
        if (!devid || temperature === undefined || humidity === undefined) {
            return reply.code(400).send({ error: "Missing required fields" });
        }

        try {
            await db.query(
                `INSERT INTO temphygro_data (devid, temperature, humidity, created_at) VALUES (?, ?, ?, ?)`,
                [devid, temperature, humidity, formatDate(created_at)]
            );
            return { success: true };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({ error: error.message });
        }
    });

    // Endpoint: Update SMT Data
    fastify.put('/admin/smt/:id', async (request, reply) => {
        const { id } = request.params;
        const { devid, temperature, humidity, created_at } = request.body;

        try {
            await db.query(
                `UPDATE temphygro_data SET devid = ?, temperature = ?, humidity = ?, created_at = ? WHERE id = ?`,
                [devid, temperature, humidity, formatDate(created_at), id]
            );
            return { success: true };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({ error: error.message });
        }
    });

    // Endpoint: Delete SMT Data
    fastify.delete('/admin/smt/:id', async (request, reply) => {
        const { id } = request.params;
        try {
            await db.query(`DELETE FROM temphygro_data WHERE id = ?`, [id]);
            return { success: true };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({ error: error.message });
        }
    });

    // --- AKT (Area Monitor) Endpoints ---
    const getAktIds = () => [10, 11, 12, 13, 24, 25, 26];

    fastify.get('/admin/akt', async (request, reply) => {
        const limit = parseInt(request.query.limit) || 10;
        const cursor = parseInt(request.query.cursor) || null;

        const filterDevId = request.query.devid || null;
        const filterTemp = request.query.temp || null;
        const filterHumidity = request.query.humidity || null;

        const cacheKey = `api:admin:akt:cursor:${cursor || 'init'}:limit:${limit}:devid:${filterDevId}:temp:${filterTemp}:hum:${filterHumidity}`;

        try {
            const cachedData = await fastify.redis.get(cacheKey);
            if (cachedData) return JSON.parse(cachedData);

            const idsString = getAktIds().join(',');
            let sql = `SELECT id, devid, temperature, humidity, created_at FROM temphygro_data WHERE devid IN (${idsString})`;
            const params = [];

            if (filterDevId) { sql += ` AND devid = ?`; params.push(filterDevId); }
            if (filterTemp) { sql += ` AND temperature = ?`; params.push(filterTemp); }
            if (filterHumidity) { sql += ` AND humidity = ?`; params.push(filterHumidity); }

            if (cursor) { sql += ` AND id < ?`; params.push(cursor); }
            sql += ` ORDER BY id DESC LIMIT ?`;
            params.push(limit);

            const [rows] = await db.query(sql, params);
            let nextCursor = rows.length > 0 ? rows[rows.length - 1].id : null;

            const response = { data: rows, nextCursor: nextCursor };
            await fastify.redis.set(cacheKey, JSON.stringify(response), 'EX', 60);
            return response;
        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({ error: error.message });
        }
    });

    fastify.post('/admin/akt', async (request, reply) => {
        const { devid, temperature, humidity, created_at } = request.body;
        if (!devid || temperature === undefined || humidity === undefined) return reply.code(400).send({ error: "Missing fields" });
        try {
            await db.query(`INSERT INTO temphygro_data (devid, temperature, humidity, created_at) VALUES (?, ?, ?, ?)`, [devid, temperature, humidity, formatDate(created_at)]);
            return { success: true };
        } catch (error) { reply.code(500).send({ error: error.message }); }
    });

    fastify.put('/admin/akt/:id', async (request, reply) => {
        const { id } = request.params;
        const { devid, temperature, humidity, created_at } = request.body;
        try {
            await db.query(`UPDATE temphygro_data SET devid=?, temperature=?, humidity=?, created_at=? WHERE id=?`, [devid, temperature, humidity, formatDate(created_at), id]);
            return { success: true };
        } catch (error) { reply.code(500).send({ error: error.message }); }
    });

    fastify.delete('/admin/akt/:id', async (request, reply) => {
        const { id } = request.params;
        try { await db.query(`DELETE FROM temphygro_data WHERE id=?`, [id]); return { success: true }; }
        catch (error) { reply.code(500).send({ error: error.message }); }
    });


    // --- FCT (Facility Monitor) Endpoints ---
    // Only handling temphygro_data (Dev 27) for now
    fastify.get('/admin/fct', async (request, reply) => {
        const limit = parseInt(request.query.limit) || 10;
        const cursor = parseInt(request.query.cursor) || null;

        const filterDevId = request.query.devid || null;
        const filterTemp = request.query.temp || null;
        const filterHumidity = request.query.humidity || null;

        const cacheKey = `api:admin:fct:cursor:${cursor || 'init'}:limit:${limit}:devid:${filterDevId}:temp:${filterTemp}:hum:${filterHumidity}`;

        try {
            const cachedData = await fastify.redis.get(cacheKey);
            if (cachedData) return JSON.parse(cachedData);

            // Facility ID 27
            let sql = `SELECT id, devid, temperature, humidity, created_at FROM temphygro_data WHERE devid = 27`;
            const params = [];

            if (filterDevId) { sql += ` AND devid = ?`; params.push(filterDevId); }
            if (filterTemp) { sql += ` AND temperature = ?`; params.push(filterTemp); }
            if (filterHumidity) { sql += ` AND humidity = ?`; params.push(filterHumidity); }

            if (cursor) { sql += ` AND id < ?`; params.push(cursor); }
            sql += ` ORDER BY id DESC LIMIT ?`;
            params.push(limit);

            const [rows] = await db.query(sql, params);
            let nextCursor = rows.length > 0 ? rows[rows.length - 1].id : null;

            const response = { data: rows, nextCursor: nextCursor };
            await fastify.redis.set(cacheKey, JSON.stringify(response), 'EX', 60);
            return response;
        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({ error: error.message });
        }
    });

    fastify.post('/admin/fct', async (request, reply) => {
        const { devid, temperature, humidity, created_at } = request.body;
        if (!devid || temperature === undefined || humidity === undefined) return reply.code(400).send({ error: "Missing fields" });
        try {
            await db.query(`INSERT INTO temphygro_data (devid, temperature, humidity, created_at) VALUES (?, ?, ?, ?)`, [devid, temperature, humidity, formatDate(created_at)]);
            return { success: true };
        } catch (error) { reply.code(500).send({ error: error.message }); }
    });

    fastify.put('/admin/fct/:id', async (request, reply) => {
        const { id } = request.params;
        const { devid, temperature, humidity, created_at } = request.body;
        try {
            await db.query(`UPDATE temphygro_data SET devid=?, temperature=?, humidity=?, created_at=? WHERE id=?`, [devid, temperature, humidity, formatDate(created_at), id]);
            return { success: true };
        } catch (error) { reply.code(500).send({ error: error.message }); }
    });

    fastify.delete('/admin/fct/:id', async (request, reply) => {
        const { id } = request.params;
        try { await db.query(`DELETE FROM temphygro_data WHERE id=?`, [id]); return { success: true }; }
        catch (error) { reply.code(500).send({ error: error.message }); }
    });


    // --- GRD (Grounding Monitor) Endpoints ---
    fastify.get('/admin/grd', async (request, reply) => {
        const limit = parseInt(request.query.limit) || 10;
        const cursor = parseInt(request.query.cursor) || null;

        const filterLineId = request.query.line_id || null;
        const filterStatus = request.query.status || null;

        const cacheKey = `api:admin:grd:cursor:${cursor || 'init'}:limit:${limit}:line:${filterLineId}:status:${filterStatus}`;

        try {
            const cachedData = await fastify.redis.get(cacheKey);
            if (cachedData) return JSON.parse(cachedData);

            let sql = `SELECT id, line_id, ground_status, timestamp FROM grounding_logs WHERE 1=1`;
            const params = [];

            if (filterLineId) { sql += ` AND line_id = ?`; params.push(filterLineId); }
            if (filterStatus) { sql += ` AND ground_status = ?`; params.push(filterStatus); }

            if (cursor) { sql += ` AND id < ?`; params.push(cursor); }
            sql += ` ORDER BY id DESC LIMIT ?`;
            params.push(limit);

            const [rows] = await db.query(sql, params);
            let nextCursor = rows.length > 0 ? rows[rows.length - 1].id : null;

            const response = { data: rows, nextCursor: nextCursor };
            await fastify.redis.set(cacheKey, JSON.stringify(response), 'EX', 60);
            return response;
        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({ error: error.message });
        }
    });

    fastify.post('/admin/grd', async (request, reply) => {
        const { line_id, ground_status, timestamp } = request.body;
        if (!line_id || !ground_status) return reply.code(400).send({ error: "Missing fields" });
        try {
            await db.query(`INSERT INTO grounding_logs (line_id, ground_status, timestamp) VALUES (?, ?, ?)`, [line_id, ground_status, formatDate(timestamp)]);
            return { success: true };
        } catch (error) { reply.code(500).send({ error: error.message }); }
    });

    fastify.put('/admin/grd/:id', async (request, reply) => {
        const { id } = request.params;
        const { line_id, ground_status, timestamp } = request.body;
        try {
            await db.query(`UPDATE grounding_logs SET line_id=?, ground_status=?, timestamp=? WHERE id=?`, [line_id, ground_status, formatDate(timestamp), id]);
            return { success: true };
        } catch (error) { reply.code(500).send({ error: error.message }); }
    });

    fastify.delete('/admin/grd/:id', async (request, reply) => {
        const { id } = request.params;
        try { await db.query(`DELETE FROM grounding_logs WHERE id=?`, [id]); return { success: true }; }
        catch (error) { reply.code(500).send({ error: error.message }); }
    });

    // Endpoint: Admin Login
    fastify.post('/login', async (request, reply) => {
        const { username, password } = request.body;

        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            return { success: true, token: 'admin-token-secret' }; // Simple token for now
        } else {
            reply.code(401).send({ success: false, message: 'Invalid credentials' });
        }
    });

    // --- Settings Endpoints (JSON File Storage) ---
    // Helper: Read settings
    const getSettings = async () => {
        let fileSettings = {};
        try {
            const data = await fs.readFile(SETTINGS_FILE, 'utf8');
            fileSettings = JSON.parse(data);
        } catch (error) {
            // fastify.log.warn('Settings file not found, using defaults/env');
        }

        // Merge with Env Fallback
        return {
            telegram_bot_token: fileSettings.telegram_bot_token || process.env.TELEGRAM_BOT_TOKEN || '',
            telegram_chat_id: fileSettings.telegram_chat_id || process.env.TELEGRAM_CHAT_ID || '',
            telegram_alert_enabled: fileSettings.telegram_alert_enabled ?? (process.env.TELEGRAM_ALERT_ENABLED === 'true')
        };
    };

    fastify.get('/admin/settings', async (request, reply) => {
        try {
            const settings = await getSettings();
            return settings;
        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({ error: error.message });
        }
    });

    fastify.post('/admin/settings', async (request, reply) => {
        try {
            const currentSettings = await getSettings(); // Get current to merge
            const newSettings = request.body;

            // Allow unchecked keys to potentially be saved too, but specifically update known ones
            const updatedSettings = {
                ...currentSettings,
                ...newSettings
            };

            await fs.writeFile(SETTINGS_FILE, JSON.stringify(updatedSettings, null, 2));
            return { success: true };
        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({ error: error.message });
        }
    });
}

module.exports = routes;
