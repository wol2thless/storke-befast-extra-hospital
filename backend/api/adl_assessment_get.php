<?php
// adl_assessment_get.php

require_once __DIR__ . '/../configs/cors.php';
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