<?php
$servername = "10.217.4.115";
$username = "oei_user";
$password = "oei_user";
$dbname = "ohm_temphygro_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(["error" => "Koneksi database gagal: " . $conn->connect_error]));
}
