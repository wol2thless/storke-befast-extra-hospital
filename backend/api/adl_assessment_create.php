<?php
// adl_assessment_create.php

require_once __DIR__ . '/../configs/cors.php';
require_once __DIR__ . '/../configs/conn.php';

$data = json_decode(file_get_contents('php://input'), true);
$patient_id = isset($data['patient_id']) ? trim($data['patient_id']) : '';
$answers = isset($data['answers']) ? $data['answers'] : [];

if ($patient_id === '' || empty($answers)) {
    echo json_encode([
        'success' => false,
        'message' => 'ข้อมูลไม่ครบถ้วน',
    ]);
    exit;
}

try {
    $conn->beginTransaction();

    // คำนวณคะแนน
    $total_score = 0;
    $max_score = count($answers) * 2;
    foreach ($answers as $key => $value) {
        $total_score += intval($value);
    }
    $percent = $max_score > 0 ? round(($total_score / $max_score) * 100, 2) : 0;

    // ตีความผล
    if ($percent >= 80) {
        $interpretation = "สามารถช่วยเหลือตนเองได้ (Independent)";
        $dependency_level = "ช่วยเหลือตนเองได้ (Independent)";
    } elseif ($percent >= 60) {
        $interpretation = "พึ่งพาบางส่วน (Partially Dependent)";
        $dependency_level = "พึ่งพาบางส่วน (Partially Dependent)";
    } elseif ($percent >= 40) {
        $interpretation = "พึ่งพามาก (Severely Dependent)";
        $dependency_level = "พึ่งพามาก (Severely Dependent)";
    } else {
        $interpretation = "ภาวะพึ่งพาโดยสมบูรณ์ (Total Dependent)";
        $dependency_level = "พึ่งพาโดยสมบูรณ์ (Total Dependent)";
    }

    // บันทึกลงตารางหลัก
    $stmt = $conn->prepare("INSERT INTO stk_adl_assessments (pid, total_score, max_score, percent, interpretation, dependency_level, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");
    $stmt->execute([$patient_id, $total_score, $max_score, $percent, $interpretation, $dependency_level]);
    $assessment_id = $conn->lastInsertId();

    // บันทึกคำตอบแต่ละข้อ
    $stmt = $conn->prepare("INSERT INTO stk_adl_answers (assessment_id, question_key, answer_value) VALUES (?, ?, ?)");
    foreach ($answers as $key => $value) {
        $stmt->execute([$assessment_id, $key, $value]);
    }

    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'บันทึกข้อมูลสำเร็จ',
        'assessment_id' => $assessment_id,
        'total_score' => $total_score,
        'max_score' => $max_score,
        'percent' => $percent,
        'interpretation' => $interpretation,
        'dependency_level' => $dependency_level,
    ]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage(),
    ]);
}