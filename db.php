<?php
$host     = "10.217.4.115";
$username = "oei_user";
$password = "oei_user";
$database = "ohm_temphygro_db";

$conn = new mysqli($host, $username, $password, $database);
if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}
