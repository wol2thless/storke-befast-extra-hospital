<?php
// api/satisfaction_survey_get.php
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

$pid = isset($_GET['pid']) ? trim($_GET['pid']) : '';
if ($pid === '') {
    echo json_encode(['success' => false, 'message' => 'Missing pid']);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT id, pid, ratings, additional_comment, prevention_comment, created_at FROM stk_satisfaction_survey WHERE pid = ? ORDER BY created_at DESC");
    $stmt->execute([$pid]);
    $surveys = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'surveys' => $surveys]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} 