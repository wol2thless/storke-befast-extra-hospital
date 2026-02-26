<?php
// api/satisfaction_survey_create.php
require_once __DIR__ . '/../configs/cors.php';
require_once __DIR__ . '/../configs/conn.php';

$data = json_decode(file_get_contents('php://input'), true);
$pid = isset($data['pid']) ? trim($data['pid']) : '';
$ratings = isset($data['ratings']) ? trim($data['ratings']) : '';
$additional_comment = isset($data['additional_comment']) ? trim($data['additional_comment']) : '';
$prevention_comment = isset($data['prevention_comment']) ? trim($data['prevention_comment']) : '';

if ($pid === '' || $ratings === '') {
    echo json_encode(['success' => false, 'message' => 'Missing pid or ratings']);
    exit;
}

try {
    $stmt = $conn->prepare("INSERT INTO stk_satisfaction_survey (pid, ratings, additional_comment, prevention_comment) VALUES (?, ?, ?, ?)");
    $stmt->execute([$pid, $ratings, $additional_comment, $prevention_comment]);
    echo json_encode(['success' => true, 'message' => 'บันทึกแบบสำรวจสำเร็จ']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} 