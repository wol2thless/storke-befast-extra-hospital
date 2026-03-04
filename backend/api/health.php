<?php
// ==============================================================
//  Health Check Endpoint
//  เรียกจาก browser หรือ curl เพื่อตรวจสอบสถานะระบบก่อนใช้งาน
//
//  ตัวอย่าง: http://YOUR_SERVER_IP/stroke-befast/backend/api/health.php
//
//  ผลลัพธ์ HTTP 200 = พร้อมใช้งาน
//  ผลลัพธ์ HTTP 503 = มีปัญหาที่ต้องแก้ไข
// ==============================================================

require_once __DIR__ . '/../configs/cors.php';
setCorsHeaders();

header('Content-Type: application/json; charset=utf-8');

$checks = [];
$allOk  = true;

// --- 1. PHP version ---
$phpVersion    = phpversion();
$phpVersionOk  = version_compare($phpVersion, '7.4.0', '>=');
$checks['php'] = [
    'ok'      => $phpVersionOk,
    'version' => $phpVersion,
    'message' => $phpVersionOk
        ? "PHP {$phpVersion} — OK"
        : "PHP {$phpVersion} — แนะนำให้ใช้ 7.4 ขึ้นไป",
];
if (!$phpVersionOk) $allOk = false;

// --- 2. Extensions ที่จำเป็น ---
$requiredExt = ['pdo', 'pdo_mysql', 'json', 'mbstring', 'openssl'];
$missingExt  = [];
foreach ($requiredExt as $ext) {
    if (!extension_loaded($ext)) {
        $missingExt[] = $ext;
    }
}
$checks['extensions'] = [
    'ok'      => empty($missingExt),
    'message' => empty($missingExt)
        ? 'Extensions ครบ (' . implode(', ', $requiredExt) . ')'
        : 'Extensions ที่ขาด: ' . implode(', ', $missingExt),
];
if (!empty($missingExt)) $allOk = false;

// --- 3. Database connection ---
$dbOk = false;
$dbMessage = '';
try {
    require_once __DIR__ . '/../configs/config.php';
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_TIMEOUT => 3]);
    $dbOk      = true;
    $dbMessage = 'เชื่อมต่อ database "' . DB_NAME . '" สำเร็จ';
} catch (PDOException $e) {
    $dbMessage = 'เชื่อมต่อ database ไม่ได้: ' . $e->getMessage();
} catch (Throwable $e) {
    $dbMessage = 'โหลด config ไม่ได้: ' . $e->getMessage();
}
$checks['database'] = [
    'ok'      => $dbOk,
    'message' => $dbMessage,
];
if (!$dbOk) $allOk = false;

// --- 4. config.php — ตรวจว่าค่ายังเป็น placeholder ---
$configPlaceholders = [];
if (defined('DB_USER') && DB_USER === 'your_db_username') {
    $configPlaceholders[] = 'DB_USER ยังเป็นค่าตัวอย่าง';
}
if (defined('APPOINTMENT_API_URL') && APPOINTMENT_API_URL !== '') {
    // ถ้าตั้งค่าไว้ ให้ตรวจว่า reachable (แบบ basic)
    $checks['appointment_api'] = [
        'ok'      => true,
        'message' => 'APPOINTMENT_API_URL ถูกตั้งค่าไว้แล้ว',
    ];
} else {
    $checks['appointment_api'] = [
        'ok'      => true,
        'message' => 'APPOINTMENT_API_URL ว่างเปล่า — ฟีเจอร์นัดหมายจะไม่ทำงาน (ไม่บังคับ)',
    ];
}

if (!empty($configPlaceholders)) {
    $checks['config'] = [
        'ok'      => false,
        'message' => 'config.php ยังมีค่า placeholder: ' . implode(', ', $configPlaceholders),
    ];
    $allOk = false;
} else {
    if (!isset($checks['config'])) {
        $checks['config'] = [
            'ok'      => true,
            'message' => 'config.php ถูกตั้งค่าแล้ว',
        ];
    }
}

// --- 5. mod_rewrite / .htaccess ---
$htaccessPath = __DIR__ . '/../../.htaccess';
$checks['htaccess'] = [
    'ok'      => file_exists($htaccessPath),
    'message' => file_exists($htaccessPath)
        ? '.htaccess พบแล้ว'
        : '.htaccess ไม่พบ — React routing อาจไม่ทำงาน',
];

// --- Response ---
$statusCode = $allOk ? 200 : 503;
http_response_code($statusCode);

echo json_encode([
    'status'    => $allOk ? 'ok' : 'error',
    'timestamp' => date('Y-m-d H:i:s'),
    'checks'    => $checks,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
