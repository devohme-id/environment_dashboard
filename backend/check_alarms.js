const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAlarms() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log("--- Temperature/Humidity Checks ---");
        // Get absolute latest for these devices
        const [tempRows] = await connection.execute(
            `SELECT devid, temperature, humidity, created_at 
             FROM temphygro_data 
             WHERE devid IN (1, 2, 4, 8) 
             ORDER BY created_at DESC LIMIT 20`
        );

        // Group by devid
        const uniqueDevs = {};
        tempRows.forEach(r => {
            if (!uniqueDevs[r.devid]) uniqueDevs[r.devid] = r;
        });

        for (const devid in uniqueDevs) {
            const r = uniqueDevs[devid];
            console.log(`Device ${r.devid}: Temp=${r.temperature}, Humidity=${r.humidity} (Time: ${r.created_at})`);
        }

        console.log("\n--- Grounding Checks ---");
        const [groundRows] = await connection.execute(
            `SELECT line_id, ground_status, timestamp 
             FROM grounding_logs 
             ORDER BY timestamp DESC LIMIT 20`
        );

        // Unique lines
        const uniqueLines = {};
        groundRows.forEach(r => {
            if (!uniqueLines[r.line_id]) uniqueLines[r.line_id] = r;
        });

        for (const lineId in uniqueLines) {
            const r = uniqueLines[lineId];
            console.log(`Line ${r.line_id}: Status=${r.ground_status} (Time: ${r.timestamp})`);
        }

        await connection.end();
    } catch (err) {
        console.error(err);
    }
}

checkAlarms();
