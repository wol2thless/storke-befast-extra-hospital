<?php
// backend/api/healthrecord_get.php

require_once __DIR__ . '/../configs/cors.php';
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