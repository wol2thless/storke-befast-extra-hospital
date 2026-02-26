<?php
// api/satisfaction_survey_create.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../configs/conn.php';

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