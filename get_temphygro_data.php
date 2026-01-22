<?php
header('Content-Type: application/json');

// --- Konfigurasi Database ---
require_once 'db.php';

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$data = [];

if ($page === 3) {
    // --- Logika Khusus untuk Halaman 3 (Facility) ---

    // 1. Ambil data Suhu & Kelembaban
    $sql_temphygro = "(SELECT devid, humidity, temperature, created_at FROM temphygro_data WHERE devid = 27 ORDER BY created_at DESC LIMIT 12)";
    $result_temphygro = $conn->query($sql_temphygro);
    if (!$result_temphygro) {
        http_response_code(500);
        echo json_encode(["error" => "Query temphygro_data gagal: " . $conn->error]);
        exit();
    }
    while ($row = $result_temphygro->fetch_assoc()) {
        $data[$row['devid']][] = $row;
    }

    // 2. Ambil data Tekanan Udara dan perbaiki format desimal
    // ### PERUBAHAN DI SINI: Menggunakan REPLACE() untuk mengubah ',' menjadi '.' ###
    $sql_airpressure = "(SELECT devid, REPLACE(value1, ',', '.') AS temperature, created_at FROM airpressure_data WHERE devid = 100 ORDER BY created_at DESC LIMIT 12)";
    $result_airpressure = $conn->query($sql_airpressure);
    if ($result_airpressure) {
        while ($row = $result_airpressure->fetch_assoc()) {
            $row['humidity'] = null;
            $data[$row['devid']][] = $row;
        }
    }
} else {
    // --- Logika untuk Halaman 1 dan 2 ---
    $device_ids = [];
    if ($page === 1) {
        $device_ids = [1, 2, 4, 8, 5, 6, 20, 21, 22, 23, 3, 7];
    } elseif ($page === 2) {
        $device_ids = [10, 11, 12, 13, 24, 25, 26];
    }

    if (!empty($device_ids)) {
        $sql_parts = [];
        foreach ($device_ids as $id) {
            $sql_parts[] = "(SELECT * FROM temphygro_data WHERE devid = " . (int)$id . " ORDER BY created_at DESC LIMIT 12)";
        }
        $sql = implode(" UNION ALL ", $sql_parts);
        $result = $conn->query($sql);
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $data[$row['devid']][] = $row;
            }
        }
    }
}

// Balikkan urutan data
foreach ($data as $devid => &$records) {
    $records = array_reverse($records);
}

echo json_encode($data);
$conn->close();
