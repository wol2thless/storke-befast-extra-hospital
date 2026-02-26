<?php
// api/satisfaction_survey_get.php
require_once __DIR__ . '/../configs/cors.php';
require_once __DIR__ . '/../configs/conn.php';

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