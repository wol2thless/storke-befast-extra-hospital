<?php
// adl_assessment_get.php

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

$patient_id = isset($_GET['patient_id']) ? trim($_GET['patient_id']) : '';

if ($patient_id === '') {
    echo json_encode([
        'success' => false,
        'message' => 'Patient ID is required',
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT id AS assessment_id, created_at, total_score, max_score, percent, interpretation, dependency_level FROM stk_adl_assessments WHERE pid = ? ORDER BY created_at DESC");
    $stmt->execute([$patient_id]);

    $assessments = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $assessments[] = $row;
    }

    echo json_encode([
        'success' => true,
        'assessments' => $assessments,
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage(),
    ]);
}