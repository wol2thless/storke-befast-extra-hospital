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
    
    if (empty($input['provider_id']) || empty($input['password'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Provider ID และรหัสผ่านจำเป็นต้องกรอก'
        ]);
        exit();
    }
    
    $providerId = trim($input['provider_id']);
    $password = trim($input['password']);
    
    // Check admin credentials - you can modify this table structure as needed
    $stmt = $conn->prepare("
        SELECT id, provider_id, name, role, password_hash, is_active 
        FROM stk_admin_users 
        WHERE provider_id = ? AND is_active = 1
    ");
    $stmt->execute([$providerId]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$admin) {
        echo json_encode([
            'success' => false,
            'message' => 'ไม่พบผู้ใช้งานในระบบ'
        ]);
        exit();
    }
    
    // Verify password
    if (!password_verify($password, $admin['password_hash'])) {
        echo json_encode([
            'success' => false,
            'message' => 'รหัสผ่านไม่ถูกต้อง'
        ]);
        exit();
    }
    
    // Generate session token (compatible with older PHP versions)
    $token = '';
    for ($i = 0; $i < 64; $i++) {
        $token .= dechex(rand(0, 15));
    }
    
    // Store session in database (optional - for better security)
    $stmt = $conn->prepare("
        INSERT INTO stk_admin_sessions (admin_id, token, expires_at, created_at) 
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 8 HOUR), NOW())
        ON DUPLICATE KEY UPDATE 
        token = VALUES(token), 
        expires_at = VALUES(expires_at), 
        updated_at = NOW()
    ");
    $stmt->execute([$admin['id'], $token]);
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'เข้าสู่ระบบสำเร็จ',
        'token' => $token,
        'admin_data' => [
            'id' => $admin['id'],
            'provider_id' => $admin['provider_id'],
            'name' => $admin['name'],
            'role' => $admin['role']
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาดในระบบ: ' . $e->getMessage()
    ]);
}
?>