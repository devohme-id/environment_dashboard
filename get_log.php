<?php
include 'db.php';

$sql = "SELECT * FROM grounding_logs ORDER BY timestamp DESC LIMIT 100";
$result = $conn->query($sql);
$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
