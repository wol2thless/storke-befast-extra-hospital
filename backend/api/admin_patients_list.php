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
    
    // Get all patients with basic info (simplified query for now)
    $stmt = $conn->prepare("
        SELECT 
            p.pid as national_id,
            p.name_th as full_name,
            p.name_th as fname,
            '' as lname,
            p.birthdate as birthday,
            p.gender,
            p.phone as tel,
            p.created_at as registered_date,
            0 as health_behavior_count,
            0 as exercise_count,
            0 as medication_count,
            0 as nutrition_count,
            0 as adl_count,
            0 as survey_count,
            p.created_at as last_activity_date
        FROM stk_personinfo p
        ORDER BY p.created_at DESC
    ");
    
    $stmt->execute();
    $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the data
    $formattedPatients = array_map(function($patient) {
        return [
            'national_id' => $patient['national_id'],
            'full_name' => trim($patient['fname'] . ' ' . $patient['lname']),
            'fname' => $patient['fname'],
            'lname' => $patient['lname'],
            'birthday' => $patient['birthday'],
            'gender' => $patient['gender'],
            'tel' => $patient['tel'],
            'registered_date' => $patient['registered_date'],
            'last_activity_date' => $patient['last_activity_date'],
            'activity_counts' => [
                'health_behavior' => (int)$patient['health_behavior_count'],
                'exercise' => (int)$patient['exercise_count'],
                'medication' => (int)$patient['medication_count'],
                'nutrition' => (int)$patient['nutrition_count'],
                'adl_assessment' => (int)$patient['adl_count'],
                'satisfaction_survey' => (int)$patient['survey_count']
            ],
            'total_activities' => (int)$patient['health_behavior_count'] + 
                                (int)$patient['exercise_count'] + 
                                (int)$patient['medication_count'] + 
                                (int)$patient['nutrition_count'] + 
                                (int)$patient['adl_count'] + 
                                (int)$patient['survey_count']
        ];
    }, $patients);
    
    echo json_encode([
        'success' => true,
        'patients' => $formattedPatients,
        'total_patients' => count($formattedPatients),
        'admin_info' => [
            'name' => $adminUser['name'],
            'role' => $adminUser['role']
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาดในการดึงข้อมูล: ' . $e->getMessage()
    ]);
}
?>