<?php
// backend/api/healthrecord_get.php

header('Content-Type: application/json; charset=utf-8');

// CORS support (allow local dev and production)
$allowed_origins = [
    "http://localhost:5173",
    "http://10.4.71.176:5173",
    "http://10.4.71.211:5173",
    "http://61.19.25.200",
    "http://172.16.99.200"
];
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../configs/conn.php';

$pid = isset($_GET['pid']) ? trim($_GET['pid']) : '';

if ($pid === '') {
    echo json_encode([
        'success' => false,
        'message' => 'กรุณาระบุ pid',
    ]);
    exit;
}

try {
    $stmt = $conn->prepare('SELECT * FROM stk_health_record_befast WHERE pid = ? ORDER BY record_date DESC');
    $stmt->execute([$pid]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode([
        'success' => true,
        'data' => $rows,
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage(),
    ]);
}