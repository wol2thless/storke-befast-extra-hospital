<?php
// backend/api/healthrecord_create.php

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



// รับข้อมูล JSON

$input = json_decode(file_get_contents('php://input'), true);
$pid = isset($input['pid']) ? trim($input['pid']) : '';
$symptoms = isset($input['symptoms']) ? trim($input['symptoms']) : '';
$note = isset($input['note']) ? trim($input['note']) : '';

if ($pid === '' || $symptoms === '') {
    echo json_encode([
        'success' => false,
        'message' => 'ข้อมูลไม่ครบถ้วน',
    ]);
    exit;
}

try {
    $stmt = $conn->prepare('INSERT INTO stk_health_record_befast (pid, record_date, symptoms, note) VALUES (?, NOW(), ?, ?)');
    $stmt->execute([$pid, $symptoms, $note]);
    $lastId = $conn->lastInsertId();
    // ดึงข้อมูล row ล่าสุดที่เพิ่ง insert
    $stmt2 = $conn->prepare('SELECT * FROM stk_health_record_befast WHERE id = ?');
    $stmt2->execute([$lastId]);
    $row = $stmt2->fetch(PDO::FETCH_ASSOC);
    echo json_encode([
        'success' => true,
        'message' => 'บันทึกข้อมูลสำเร็จ',
        'data' => $row,
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage(),
    ]);
}