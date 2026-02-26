<?php
// api/personinfo_get.php
require_once __DIR__ . '/../configs/cors.php';
require_once __DIR__ . '/../configs/conn.php';

// รับ pid จาก query string หรือ body
$pid = isset($_GET['pid']) ? trim($_GET['pid']) : null;
if (!$pid && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $pid = isset($data['pid']) ? trim($data['pid']) : null;
}

if (!$pid) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing pid']);
    exit;
}

try {
    $stmt = $conn->prepare('SELECT pid, occupation, otherOccupation, education, phone FROM stk_personinfo WHERE pid = ?');
    $stmt->execute([$pid]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        echo json_encode(['success' => true, 'data' => $row]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Not found']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}