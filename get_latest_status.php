<?php
// Mengatur header untuk output JSON
header('Content-Type: application/json');

// --- Konfigurasi Database ---
require_once 'db.php';

// --- Query SQL Disesuaikan untuk Tabel 'grounding_logs' ---
// Subquery ini berfungsi untuk mendapatkan entri log terbaru untuk setiap line_id
$sql = "SELECT
            t1.*
            FROM
            grounding_logs t1
            INNER JOIN (SELECT line_id, MAX(TIMESTAMP) AS max_timestamp FROM grounding_logs GROUP BY line_id) t2 ON t1.line_id = t2.line_id
            AND t1.TIMESTAMP = t2.max_timestamp
            GROUP BY t2.line_id ORDER BY t2.line_id";

$result = $conn->query($sql);

$data = [];
if ($result && $result->num_rows > 0) {
    // Batas waktu untuk data dianggap usang, disesuaikan dengan interval sensor 15 menit.
    // 15 menit (900 detik) + toleransi 2 menit (120 detik) = 1020 detik
    $stale_threshold_seconds = 3600; // 1 jam

    // Pastikan zona waktu server sudah benar (misal: 'Asia/Jakarta' untuk WIB)
    $server_timezone = new DateTimeZone('Asia/Jakarta');

    while ($row = $result->fetch_assoc()) {
        // Logika untuk mengubah status 'OK' yang usang menjadi 'UNKNOWN'
        if ($row['ground_status'] === 'OK') {
            $now = new DateTime("now", $server_timezone);
            $last_update = new DateTime($row['timestamp'], $server_timezone);

            // Hitung selisih waktu dalam detik
            $age_in_seconds = $now->getTimestamp() - $last_update->getTimestamp();

            // Jika data OK lebih tua dari batas waktu, ganti statusnya
            if ($age_in_seconds > $stale_threshold_seconds) {
                $row['ground_status'] = 'UNKNOWN';
            }
        }
        $data[] = $row;
    }
}

// Mengirim data sebagai JSON
echo json_encode($data);

// Menutup koneksi
$conn->close();
