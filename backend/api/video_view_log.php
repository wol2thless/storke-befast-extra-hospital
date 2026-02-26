<?php
// backend/api/video_view_log.php
require_once __DIR__ . '/../configs/cors.php';
require_once __DIR__ . '/../configs/conn.php';

// รับ input
$input = json_decode(file_get_contents('php://input'), true);
$pid = isset($input['pid']) ? $input['pid'] : null;
$video_id = isset($input['video_id']) ? $input['video_id'] : null;
$viewed_at = date('Y-m-d H:i:s');

if (!$pid) {
    echo json_encode(["success" => false, "message" => "Missing pid"]);
    exit();
}

// ถ้ามี pid และไม่มี video_id = ขอ log
if ($pid && !$video_id) {
    try {
        $stmt = $conn->prepare("SELECT * FROM stk_video_view_log WHERE pid = ? ORDER BY viewed_at DESC");
        $stmt->execute([$pid]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $rows]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit();
}

// ถ้ามี pid และ video_id = insert log
if ($pid && $video_id) {
    try {
        $stmt = $conn->prepare("INSERT INTO stk_video_view_log (pid, video_id, viewed_at) VALUES (?, ?, ?)");
        $stmt->execute([$pid, $video_id, $viewed_at]);
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit();
}

// ถ้าไม่ครบ
echo json_encode(["success" => false, "message" => "Missing pid or video_id"]);
exit();