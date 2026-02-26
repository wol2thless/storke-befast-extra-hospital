<?php
// api/medication_record_create.php
require_once __DIR__ . '/../configs/cors.php';
require_once __DIR__ . '/../configs/conn.php';

$data = json_decode(file_get_contents('php://input'), true);
$pid = isset($data['pid']) ? trim($data['pid']) : '';
$status = isset($data['status']) ? trim($data['status']) : '';
$meal_times = isset($data['meal_times']) ? trim($data['meal_times']) : '';
$meals = isset($data['meals']) ? trim($data['meals']) : '';
$note = isset($data['note']) ? trim($data['note']) : '';

if ($pid === '' || $status === '' || $meal_times === '' || $meals === '') {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    $stmt = $conn->prepare("INSERT INTO stk_medication_records (pid, status, meal_times, meals, note) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$pid, $status, $meal_times, $meals, $note]);
    echo json_encode(['success' => true, 'message' => 'บันทึกข้อมูลสำเร็จ']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} 