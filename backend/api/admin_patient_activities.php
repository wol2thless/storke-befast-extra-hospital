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
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../configs/conn.php';

function verifyAdminToken($conn, $token) {
    if (empty($token)) return false;
    
    $stmt = $conn->prepare("
        SELECT s.admin_id, a.provider_id, a.name, a.role 
        FROM stk_admin_sessions s 
        JOIN stk_admin_users a ON s.admin_id = a.id 
        WHERE s.token = ? AND s.expires_at > NOW() AND a.is_active = 1
    ");
    $stmt->execute([$token]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

try {
    // Skip token verification for now
    // TODO: Re-enable token verification later
    $adminUser = ['name' => 'Admin', 'role' => 'admin'];
    
    // Get national_id from URL parameter
    $nationalId = isset($_GET['national_id']) ? $_GET['national_id'] : null;
    
    if (empty($nationalId)) {
        echo json_encode([
            'success' => false,
            'message' => 'กรุณาระบุเลขบัตรประชาชน'
        ]);
        exit();
    }
    
    // Get patient basic info
    $stmt = $conn->prepare("
        SELECT pid as national_id, name_th as fname, '' as lname, birthdate as birthday, gender, phone as tel, created_at
        FROM stk_personinfo 
        WHERE pid = ?
    ");
    $stmt->execute([$nationalId]);
    $patient = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$patient) {
        echo json_encode([
            'success' => false,
            'message' => 'ไม่พบข้อมูลผู้ป่วย'
        ]);
        exit();
    }
    
    $activities = [];
    
    // For now, return empty activities since we need to check table structures
    // TODO: Update these queries once we know the correct column names
    $healthBehavior = [];
    $exercise = [];
    $medication = [];
    $nutrition = [];
    $adl = [];
    $survey = [];
    $videoViews = [];
    
    $activities = [];
    
    // Sort activities by created_at descending
    usort($activities, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });
    
    // Calculate statistics
    $stats = [
        'total_activities' => count($activities),
        'activity_breakdown' => [
            'health_behavior' => count($healthBehavior),
            'exercise' => count($exercise),
            'medication' => count($medication),
            'nutrition' => count($nutrition),
            'adl_assessment' => count($adl),
            'satisfaction_survey' => count($survey),
            'video_views' => count($videoViews)
        ],
        'first_activity' => !empty($activities) ? end($activities)['created_at'] : null,
        'last_activity' => !empty($activities) ? $activities[0]['created_at'] : null
    ];
    
    echo json_encode([
        'success' => true,
        'patient_info' => [
            'national_id' => $patient['national_id'],
            'full_name' => trim($patient['fname'] . ' ' . $patient['lname']),
            'fname' => $patient['fname'],
            'lname' => $patient['lname'],
            'birthday' => $patient['birthday'],
            'gender' => $patient['gender'],
            'tel' => $patient['tel'],
            'registered_date' => $patient['created_at']
        ],
        'activities' => $activities,
        'stats' => $stats
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาดในการดึงข้อมูล: ' . $e->getMessage()
    ]);
}
?>