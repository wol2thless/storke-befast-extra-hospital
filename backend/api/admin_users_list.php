<?php
require_once __DIR__ . '/../configs/cors.php';
require_once __DIR__ . '/../configs/conn.php';

try {
    // Get admin token from POST body or Authorization header
    $raw_input = file_get_contents('php://input');
    $input = json_decode($raw_input, true);

    $adminToken = '';
    if (isset($input['admin_token'])) {
        $adminToken = $input['admin_token'];
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $adminToken = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
    }

    if (empty($adminToken)) {
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
    $stmt->execute([$adminToken]);
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
            'message' => 'คุณไม่มีสิทธิ์ในการดูรายการผู้ใช้งาน (เฉพาะ Admin เท่านั้น)'
        ]);
        exit();
    }

    // Get all admin users (including soft deleted ones)
    $stmt = $conn->prepare("
        SELECT
            id,
            provider_id,
            name,
            role,
            is_active,
            created_at,
            updated_at
        FROM stk_admin_users
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $users
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาดในระบบ: ' . $e->getMessage()
    ]);
}
?>
