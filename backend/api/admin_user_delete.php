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
            'message' => 'คุณไม่มีสิทธิ์ในการลบผู้ใช้งาน (เฉพาะ Admin เท่านั้น)'
        ]);
        exit();
    }

    // Validate required fields
    if (empty($input['user_id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'ไม่พบ ID ของผู้ใช้ที่ต้องการลบ'
        ]);
        exit();
    }

    $userId = $input['user_id'];

    // Prevent admin from deleting themselves
    if ($admin['id'] == $userId) {
        echo json_encode([
            'success' => false,
            'message' => 'ไม่สามารถลบบัญชีตนเองได้'
        ]);
        exit();
    }

    // Check if user exists
    $stmt = $conn->prepare("SELECT id, name, is_active FROM stk_admin_users WHERE id = ?");
    $stmt->execute([$userId]);
    $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$existingUser) {
        echo json_encode([
            'success' => false,
            'message' => 'ไม่พบผู้ใช้งานที่ต้องการลบ'
        ]);
        exit();
    }

    // Begin transaction
    $conn->beginTransaction();

    try {
        // Soft delete: Set is_active to 0
        $stmt = $conn->prepare("
            UPDATE stk_admin_users
            SET is_active = 0, updated_at = NOW()
            WHERE id = ?
        ");
        $result = $stmt->execute([$userId]);
        $rowsAffected = $stmt->rowCount();

        // Check if update was successful
        if (!$result || $rowsAffected === 0) {
            $conn->rollBack();
            echo json_encode([
                'success' => false,
                'message' => 'ไม่สามารถอัปเดตข้อมูลได้ (Rows affected: ' . $rowsAffected . ')'
            ]);
            exit();
        }

        // Also invalidate all sessions for this user
        $stmt = $conn->prepare("
            DELETE FROM stk_admin_sessions
            WHERE admin_id = ?
        ");
        $stmt->execute([$userId]);

        // Commit transaction
        $conn->commit();
    } catch (Exception $e) {
        $conn->rollBack();
        throw $e;
    }

    echo json_encode([
        'success' => true,
        'message' => 'ปิดการใช้งานบัญชี "' . $existingUser['name'] . '" สำเร็จ',
        'rows_affected' => $rowsAffected
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาดในระบบ: ' . $e->getMessage()
    ]);
}
?>
