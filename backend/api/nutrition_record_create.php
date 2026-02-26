<?php
// api/nutrition_record_create.php
require_once __DIR__ . '/../configs/cors.php';
require_once __DIR__ . '/../configs/conn.php';

$data = json_decode(file_get_contents('php://input'), true);
$pid = isset($data['pid']) ? trim($data['pid']) : '';
$status = isset($data['status']) ? trim($data['status']) : '';
$note = isset($data['note']) ? trim($data['note']) : '';

if ($pid === '' || $status === '') {
    echo json_encode(['success' => false, 'message' => 'Missing pid or status']);
    exit;
}

try {
    $stmt = $conn->prepare("INSERT INTO stk_nutrition_records (pid, status, note) VALUES (?, ?, ?)");
    $stmt->execute([$pid, $status, $note]);
    echo json_encode(['success' => true, 'message' => 'บันทึกข้อมูลสำเร็จ']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}