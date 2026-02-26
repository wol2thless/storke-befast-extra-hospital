<?php
// Set CORS headers
$allowed_origins = [
    "http://localhost:5173",
    "http://10.4.71.176:5173",
    "http://10.4.71.211:5173",
    "http://61.19.25.200",
    "http://172.16.99.200"
];

header('Content-Type: application/json');
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
    header('Access-Control-Allow-Credentials: true');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../configs/conn.php';

try {
    $raw_input = file_get_contents('php://input');
    $input = json_decode($raw_input, true);

    // Validate admin token
    if (empty($input['admin_token'])) {
        echo json_encode([
            'success' => false,
            'message' => 'ไม่พบ token การเข้าสู่ระบบ'
        ]);
        exit();
    }

    // Verify admin token and check if user has admin role
    $stmt = $conn->prepare("
        SELECT au.id, au.role
        FROM stk_admin_sessions AS s
        JOIN stk_admin_users AS au ON s.admin_id = au.id
        WHERE s.token = ? AND s.expires_at > NOW() AND au.is_active = 1
    ");
    $stmt->execute([$input['admin_token']]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin) {
        echo json_encode([
            'success' => false,
            'message' => 'Session หมดอายุหรือไม่ถูกต้อง'
        ]);
        exit();
    }

    // Check if user has admin role
    if ($admin['role'] !== 'admin') {
        echo json_encode([
            'success' => false,
            'message' => 'คุณไม่มีสิทธิ์ในการกู้คืนผู้ใช้งาน (เฉพาะ Admin เท่านั้น)'
        ]);
        exit();
    }

    // Validate required fields
    if (empty($input['user_id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'ไม่พบ ID ของผู้ใช้ที่ต้องการกู้คืน'
        ]);
        exit();
    }

    $userId = $input['user_id'];

    // Check if user exists
    $stmt = $conn->prepare("SELECT id, name, is_active FROM stk_admin_users WHERE id = ?");
    $stmt->execute([$userId]);
    $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existingUser) {
        echo json_encode([
            'success' => false,
            'message' => 'ไม่พบผู้ใช้งานที่ต้องการกู้คืน'
        ]);
        exit();
    }

    if ($existingUser['is_active'] == 1) {
        echo json_encode([
            'success' => false,
            'message' => 'บัญชีนี้ยังใช้งานอยู่แล้ว'
        ]);
        exit();
    }

    // Restore: Set is_active to 1
    $stmt = $conn->prepare("
        UPDATE stk_admin_users
        SET is_active = 1, updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$userId]);

    echo json_encode([
        'success' => true,
        'message' => 'กู้คืนบัญชี "' . $existingUser['name'] . '" สำเร็จ'
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาดในระบบ: ' . $e->getMessage()
    ]);
}
?>
