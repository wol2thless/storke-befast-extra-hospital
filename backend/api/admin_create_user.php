<?php
require_once __DIR__ . '/../configs/cors.php';
require_once __DIR__ . '/../configs/conn.php';

try {
    $raw_input = file_get_contents('php://input');
    $input = json_decode($raw_input, true);

    // Validate admin token and role
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
            'message' => 'คุณไม่มีสิทธิ์ในการสร้างผู้ใช้งาน (เฉพาะ Admin เท่านั้น)'
        ]);
        exit();
    }

    // Validate required fields
    if (empty($input['provider_id']) || empty($input['name']) || empty($input['password']) || empty($input['role'])) {
        echo json_encode([
            'success' => false,
            'message' => 'กรุณากรอกข้อมูลให้ครบถ้วน'
        ]);
        exit();
    }

    $providerId = trim($input['provider_id']);
    $name = trim($input['name']);
    $password = trim($input['password']);
    $role = trim($input['role']);

    // Validate role
    $validRoles = ['admin', 'staff', 'supervisor'];
    if (!in_array($role, $validRoles)) {
        echo json_encode([
            'success' => false,
            'message' => 'สิทธิ์การใช้งานไม่ถูกต้อง'
        ]);
        exit();
    }

    // Check if provider_id already exists
    $stmt = $conn->prepare("SELECT id FROM stk_admin_users WHERE provider_id = ?");
    $stmt->execute([$providerId]);
    if ($stmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'Provider ID นี้มีอยู่ในระบบแล้ว'
        ]);
        exit();
    }

    // Hash password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    // Insert new admin user
    $stmt = $conn->prepare("
        INSERT INTO stk_admin_users (provider_id, name, role, password_hash, is_active, created_at)
        VALUES (?, ?, ?, ?, 1, NOW())
    ");
    $stmt->execute([$providerId, $name, $role, $passwordHash]);

    echo json_encode([
        'success' => true,
        'message' => 'สร้างผู้ใช้งานสำเร็จ',
        'data' => [
            'id' => $conn->lastInsertId(),
            'provider_id' => $providerId,
            'name' => $name,
            'role' => $role
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาดในระบบ: ' . $e->getMessage()
    ]);
}
?>
