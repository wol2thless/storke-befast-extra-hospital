<?php
// api/personinfo_create.php
require_once __DIR__ . '/../configs/cors.php';
require_once __DIR__ . '/../configs/conn.php';

// รับข้อมูล JSON
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No input data']);
    exit;
}

$pid = isset($data['pid']) ? trim($data['pid']) : '';
$name_th = isset($data['name_th']) ? trim($data['name_th']) : '';
$name_en = isset($data['name_en']) ? trim($data['name_en']) : '';
$gender = isset($data['gender']) ? trim($data['gender']) : '';
$birthdate = isset($data['birthdate']) ? trim($data['birthdate']) : '';
$occupation = isset($data['occupation']) ? trim($data['occupation']) : '';
$otherOccupation = isset($data['otherOccupation']) ? trim($data['otherOccupation']) : '';
// ถ้า occupation ไม่ใช่ "อื่น ๆ" ให้ล้างค่า otherOccupation
if ($occupation !== 'อื่น ๆ') {
    $otherOccupation = '';
}
$education = isset($data['education']) ? trim($data['education']) : '';
$phone = isset($data['phone']) ? trim($data['phone']) : '';
$address = '';
if (isset($data['address'])) {
    if (is_array($data['address']) && isset($data['address']['formatted'])) {
        $address = trim($data['address']['formatted']);
    } else {
        $address = trim($data['address']);
    }
}


if (!$pid || !$name_th) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// ตรวจสอบ gender ให้ตรง enum
$gender = ($gender === 'male' || $gender === 'ชาย' || $gender === 'm') ? 'ชาย'
    : (($gender === 'female' || $gender === 'หญิง' || $gender === 'f') ? 'หญิง' : 'ไม่ระบุ');

try {
    // ถ้ามี pid อยู่แล้ว ให้ update แทน insert
    $stmt = $conn->prepare('SELECT id FROM stk_personinfo WHERE pid = ?');
    $stmt->execute([$pid]);
    if ($stmt->fetch()) {
        // update
    $stmt = $conn->prepare('UPDATE stk_personinfo SET name_th=?, name_en=?, gender=?, birthdate=?, occupation=?, otherOccupation=?, education=?, phone=?, address=?, updated_at=NOW() WHERE pid=?');
    $ok = $stmt->execute([
        $name_th,
        $name_en,
        $gender,
        $birthdate,
        $occupation,
        $otherOccupation,
        $education,
        $phone,
        $address,
        $pid
    ]);
        if ($ok) {
            echo json_encode([
                'success' => true,
                'message' => 'Updated',
                'data' => [
                    'pid' => $pid,
                    'occupation' => $occupation,
                    'otherOccupation' => $otherOccupation,
                    'education' => $education,
                    'phone' => $phone
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Update failed']);
        }
    } else {
        // insert
    $stmt = $conn->prepare('INSERT INTO stk_personinfo (pid, name_th, name_en, gender, birthdate, occupation, otherOccupation, education, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $ok = $stmt->execute([
        $pid,
        $name_th,
        $name_en,
        $gender,
        $birthdate,
        $occupation,
        $otherOccupation,
        $education,
        $phone,
        $address
    ]);
        if ($ok) {
            echo json_encode([
                'success' => true,
                'message' => 'Created',
                'data' => [
                    'pid' => $pid,
                    'occupation' => $occupation,
                    'otherOccupation' => $otherOccupation,
                    'education' => $education,
                    'phone' => $phone
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Insert failed']);
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}