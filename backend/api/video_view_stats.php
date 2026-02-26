<?php
// backend/api/video_view_stats.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../configs/conn.php';

// GET /backend/api/video_view_stats.php?video_id=1

$video_id = isset($_GET['video_id']) ? intval($_GET['video_id']) : null;
$pid = isset($_GET['pid']) ? $_GET['pid'] : null;
$where = [];
$params = [];
if ($video_id) {
    $where[] = "video_id = ?";
    $params[] = $video_id;
}
if ($pid) {
    $where[] = "pid = ?";
    $params[] = $pid;
}
$whereSql = $where ? ("WHERE " . implode(" AND ", $where)) : "";

try {
    $sql = "SELECT video_id, COUNT(*) as view_count FROM stk_video_view_log $whereSql GROUP BY video_id";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode([
        "success" => true,
        "data" => $rows,
        "debug" => [
            "sql" => $sql,
            "params" => $params,
            "video_id" => $video_id,
            "pid" => $pid
        ]
    ]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}