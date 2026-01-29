const db = require('../db');

async function routes(fastify, options) {

    // Helper: Delay execution
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Endpoint: Get Temperature & Humidity Data
    // Replaces: get_temphygro_data.php
    fastify.get('/temphygro', async (request, reply) => {
        const page = parseInt(request.query.page) || 1;
        let data = {};

        try {
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

            return data;

        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({ error: "Database query failed: " + error.message });
        }
    });

    // Endpoint: Get Grounding Status
    // Replaces: get_latest_status.php
    // Endpoint: Get Grounding Status
    // Replaces: get_latest_status.php
    fastify.get('/grounding', async (request, reply) => {
        try {
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

            return modifiedRows;

        } catch (error) {
            fastify.log.error(error);
            reply.code(500).send({ error: "Database query failed: " + error.message });
        }
    });
}

module.exports = routes;
