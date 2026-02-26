<?php
require_once __DIR__ . '/../configs/cors.php';
require_once __DIR__ . '/../configs/conn.php';

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
            'message' => 'คุณไม่มีสิทธิ์ในการแก้ไขผู้ใช้งาน (เฉพาะ Admin เท่านั้น)'
        ]);
        exit();
    }

    // Validate required fields
    if (empty($input['user_id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'ไม่พบ ID ของผู้ใช้ที่ต้องการแก้ไข'
        ]);
        exit();
    }

    $userId = $input['user_id'];

    // Prevent admin from editing themselves
    if ($admin['id'] == $userId) {
        echo json_encode([
            'success' => false,
            'message' => 'ไม่สามารถแก้ไขข้อมูลตนเองได้ กรุณาให้ Admin คนอื่นแก้ไขให้'
        ]);
        exit();
    }

    // Check if user exists
    $stmt = $conn->prepare("SELECT id, provider_id FROM stk_admin_users WHERE id = ?");
    $stmt->execute([$userId]);
    $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existingUser) {
        echo json_encode([
            'success' => false,
            'message' => 'ไม่พบผู้ใช้งานที่ต้องการแก้ไข'
        ]);
        exit();
    }

    // Build update query dynamically based on provided fields
    $updateFields = [];
    $params = [];

    if (isset($input['name']) && !empty(trim($input['name']))) {
        $updateFields[] = "name = ?";
        $params[] = trim($input['name']);
    }

    if (isset($input['role']) && !empty($input['role'])) {
        $validRoles = ['admin', 'staff', 'supervisor'];
        if (!in_array($input['role'], $validRoles)) {
            echo json_encode([
                'success' => false,
                'message' => 'สิทธิ์การใช้งานไม่ถูกต้อง'
            ]);
            exit();
        }
        $updateFields[] = "role = ?";
        $params[] = $input['role'];
    }

    // Update password if provided
    if (isset($input['password']) && !empty(trim($input['password']))) {
        $updateFields[] = "password_hash = ?";
        $params[] = password_hash(trim($input['password']), PASSWORD_DEFAULT);
    }

    if (empty($updateFields)) {
        echo json_encode([
            'success' => false,
            'message' => 'ไม่มีข้อมูลที่ต้องการอัปเดต'
        ]);
        exit();
    }

    // Add updated_at
    $updateFields[] = "updated_at = NOW()";

    // Add user ID to params
    $params[] = $userId;

    // Execute update
    $sql = "UPDATE stk_admin_users SET " . implode(", ", $updateFields) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    // Get updated user data
    $stmt = $conn->prepare("
        SELECT id, provider_id, name, role, is_active, created_at, updated_at
        FROM stk_admin_users
        WHERE id = ?
    ");
    $stmt->execute([$userId]);
    $updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'message' => 'อัปเดตข้อมูลผู้ใช้งานสำเร็จ',
        'data' => $updatedUser
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาดในระบบ: ' . $e->getMessage()
    ]);
}
?>
