<?php
// api/health_behavior_create.php
require_once __DIR__ . '/../configs/cors.php';
require_once __DIR__ . '/../configs/conn.php';

$data = json_decode(file_get_contents('php://input'), true);
$pid = isset($data['pid']) ? trim($data['pid']) : '';
$behaviors = isset($data['behaviors']) ? trim($data['behaviors']) : '';
$note = isset($data['note']) ? trim($data['note']) : '';

if ($pid === '' || $behaviors === '') {
    echo json_encode(['success' => false, 'message' => 'Missing pid or behaviors']);
    exit;
}

try {
    $stmt = $conn->prepare("INSERT INTO stk_health_behavior (pid, behaviors, note) VALUES (?, ?, ?)");
    $stmt->execute([$pid, $behaviors, $note]);
    echo json_encode(['success' => true, 'message' => 'บันทึกข้อมูลสำเร็จ']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} 