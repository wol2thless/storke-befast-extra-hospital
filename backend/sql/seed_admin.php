<?php
// ==============================================================
//  สร้าง Admin คนแรกสำหรับระบบ
//  รันครั้งเดียวหลัง import schema.sql แล้ว **ลบไฟล์นี้ทิ้ง**
//
//  วิธีรัน (browser หรือ CLI):
//    php seed_admin.php
//  หรือเปิดผ่าน browser:
//    http://YOUR_SERVER/stroke-befast/backend/sql/seed_admin.php
// ==============================================================

require_once __DIR__ . '/../configs/conn.php';

// --------- แก้ค่าด้านล่างก่อนรัน ---------
$provider_id = 'admin001';       // รหัสผู้ใช้ (username)
$name        = 'ผู้ดูแลระบบ';    // ชื่อที่แสดง
$password    = 'Admin@1234';     // รหัสผ่านเริ่มต้น (เปลี่ยนหลัง login)
$role        = 'admin';          // admin | staff | supervisor
// ------------------------------------------

try {
    // ตรวจว่ามี admin อยู่แล้วหรือไม่
    $check = $conn->prepare("SELECT id FROM stk_admin_users WHERE provider_id = ?");
    $check->execute([$provider_id]);
    if ($check->fetch()) {
        die(json_encode(['success' => false, 'message' => "provider_id '$provider_id' มีอยู่แล้วในระบบ"]));
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $conn->prepare("
        INSERT INTO stk_admin_users (provider_id, name, role, password_hash, is_active, created_at)
        VALUES (?, ?, ?, ?, 1, NOW())
    ");
    $stmt->execute([$provider_id, $name, $role, $hash]);

    echo json_encode([
        'success'     => true,
        'message'     => 'สร้าง admin สำเร็จ กรุณาลบไฟล์ seed_admin.php ออกทันที',
        'provider_id' => $provider_id,
        'name'        => $name,
        'role'        => $role,
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
