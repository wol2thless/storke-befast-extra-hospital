<?php
// api/personinfo_get.php
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