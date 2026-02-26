<?php
// api/nutrition_record_get.php
require_once __DIR__ . '/../configs/cors.php';
require_once __DIR__ . '/../configs/conn.php';

$pid = isset($_GET['pid']) ? trim($_GET['pid']) : '';
if ($pid === '') {
    echo json_encode(['success' => false, 'message' => 'Missing pid']);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT * FROM stk_nutrition_records WHERE pid = ? ORDER BY created_at DESC");
    $stmt->execute([$pid]);
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'records' => $records]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
