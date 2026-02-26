<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require_once '../configs/conn.php';

try {
    $stats = [];

    // รับ parameter เดือนจาก GET request
    $selected_month = isset($_GET['month']) ? $_GET['month'] : date('Y-m'); // ค่าเริ่มต้นเป็นเดือนปัจจุบัน
    $selected_year = substr($selected_month, 0, 4);
    $selected_month_num = substr($selected_month, 5, 2);

    // ตั้งค่าเริ่มต้น
    $stats['selected_month'] = $selected_month;

    // 1. จำนวนผู้ป่วยทั้งหมด
    try {
        $stmt = $conn->query("SELECT COUNT(*) as total_patients FROM stk_personinfo");
        $result = $stmt->fetch();
        $stats['total_patients'] = (int)$result['total_patients'];
    } catch (Exception $e) {
        $stats['total_patients'] = 0;
    }

    // 2. ผู้ป่วยใหม่ในเดือนนี้ (ใช้ field ที่มีอยู่)
    try {
        // ลองใช้ created_at ก่อน
        $stmt = $conn->query("SHOW COLUMNS FROM stk_personinfo LIKE 'created_at'");
        if ($stmt->rowCount() > 0) {
            $stmt = $conn->prepare("
                SELECT COUNT(*) as new_patients
                FROM stk_personinfo
                WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
            ");
            $stmt->execute([$selected_month_num, $selected_year]);
            $result = $stmt->fetch();
            $count = (int)(isset($result['new_patients']) ? $result['new_patients'] : 0);
        } else {
            $count = 0;
        }
        $stats['new_patients_this_month'] = $count;
    } catch (Exception $e) {
        $stats['new_patients_this_month'] = 0;
    }

    // 3. สถิติการลงบันทึกสุขภาพ - ลบออกแล้ว (ตารางเก่าที่สร้างผิด)

    // 4. สถิติการออกกำลังกาย (12 เดือนล่าสุด)
    try {
        $stmt = $conn->query("
            SELECT
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as count
            FROM stk_exercise_records
            WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        ");
        $exercise_records = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stats['exercise_records_month'] = $exercise_records;
    } catch (Exception $e) {
        $stats['exercise_records_month'] = [];
    }

    // 5. สถิติการรับประทานยา (12 เดือนล่าสุด)
    try {
        $stmt = $conn->query("
            SELECT
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as count
            FROM stk_medication_records
            WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        ");
        $medication_records = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stats['medication_records_month'] = $medication_records;
    } catch (Exception $e) {
        $stats['medication_records_month'] = [];
    }

    // 6. สถิติการดูวิดีโอ (12 เดือนล่าสุด)
    try {
        $stmt = $conn->query("
            SELECT
                DATE_FORMAT(viewed_at, '%Y-%m') as month,
                COUNT(*) as count
            FROM stk_video_view_log
            WHERE viewed_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(viewed_at, '%Y-%m')
            ORDER BY month DESC
        ");
        $video_views = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stats['video_views_month'] = $video_views;
    } catch (Exception $e) {
        $stats['video_views_month'] = [];
    }

    // 7. สถิติ BEFAST Assessment (12 เดือนล่าสุด) - ใช้ stk_health_record_befast
    try {
        $stmt = $conn->query("
            SELECT
                DATE_FORMAT(record_date, '%Y-%m') as month,
                COUNT(*) as count
            FROM stk_health_record_befast
            WHERE record_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(record_date, '%Y-%m')
            ORDER BY month DESC
        ");
        $befast_records = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stats['befast_records_month'] = $befast_records;

        // รวมจำนวน BEFAST ในเดือนที่เลือก
        $stmt = $conn->prepare("
            SELECT COUNT(*) as total_assessments
            FROM stk_health_record_befast
            WHERE MONTH(record_date) = ? AND YEAR(record_date) = ?
        ");
        $stmt->execute([$selected_month_num, $selected_year]);
        $result = $stmt->fetch();
        $count = (int)(isset($result['total_assessments']) ? $result['total_assessments'] : 0);
        $stats['befast_assessments_month'] = $count;

        // สถิติระดับความรุนแรง BEFAST - นับทั้งจำนวนครั้งและจำนวนคน
        $stmt = $conn->prepare("
            SELECT
                CASE
                    WHEN symptoms = 'NONE' THEN 'ไม่มีความเสี่ยง'
                    ELSE 'มีความเสี่ยงสูง'
                END as severity_level,
                COUNT(*) as count,
                COUNT(DISTINCT pid) as unique_people
            FROM stk_health_record_befast
            WHERE MONTH(record_date) = ? AND YEAR(record_date) = ?
            GROUP BY CASE
                WHEN symptoms = 'NONE' THEN 'ไม่มีความเสี่ยง'
                ELSE 'มีความเสี่ยงสูง'
            END
            ORDER BY count DESC
        ");
        $stmt->execute([$selected_month_num, $selected_year]);
        $severity_stats = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stats['befast_severity_distribution'] = $severity_stats;

    } catch (Exception $e) {
        $stats['befast_records_month'] = [];
        $stats['befast_assessments_month'] = 0;
        $stats['befast_severity_distribution'] = [];
    }

    // 8. สถิติ ADL Assessments (12 เดือนล่าสุด)
    try {
        $stmt = $conn->query("
            SELECT
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as count
            FROM stk_adl_assessments
            WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        ");
        $adl_records = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stats['adl_records_month'] = $adl_records;
    } catch (Exception $e) {
        $stats['adl_records_month'] = [];
    }

    // 9. สถิติ Nutrition Records (12 เดือนล่าสุด)
    try {
        $stmt = $conn->query("
            SELECT
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as count
            FROM stk_nutrition_records
            WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        ");
        $nutrition_records = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stats['nutrition_records_month'] = $nutrition_records;
    } catch (Exception $e) {
        $stats['nutrition_records_month'] = [];
    }

    // 10. สถิติ Health Behavior Records (12 เดือนล่าสุด)
    try {
        $stmt = $conn->query("
            SELECT
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as count
            FROM stk_health_behavior
            WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month DESC
        ");
        $health_behavior_records = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stats['health_behavior_records_month'] = $health_behavior_records;
    } catch (Exception $e) {
        $stats['health_behavior_records_month'] = [];
    }

    // 11. สถิติการกรอกแบบสอบถามความพึงพอใจในเดือนที่เลือก
    try {
        $stmt = $conn->prepare("
            SELECT COUNT(*) as total_surveys
            FROM stk_satisfaction_survey
            WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
        ");
        $stmt->execute([$selected_month_num, $selected_year]);
        $result = $stmt->fetch();
        $count = (int)(isset($result['total_surveys']) ? $result['total_surveys'] : 0);
        $stats['satisfaction_surveys_month'] = $count;
    } catch (Exception $e) {
        $stats['satisfaction_surveys_month'] = 0;
    }

    // 12. วิดีโอที่ได้รับความนิยมในเดือนที่เลือก (Top 5)
    try {
        $stmt = $conn->prepare("
            SELECT
                video_id,
                COUNT(*) as view_count
            FROM stk_video_view_log
            WHERE MONTH(viewed_at) = ? AND YEAR(viewed_at) = ?
            GROUP BY video_id
            ORDER BY view_count DESC
            LIMIT 5
        ");
        $stmt->execute([$selected_month_num, $selected_year]);
        $popular_videos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // แปลงเป็น format ที่ต้องการ
        $stats['popular_videos'] = array_map(function($item) {
            return [
                'video_id' => $item['video_id'],
                'count' => $item['view_count']
            ];
        }, $popular_videos);
    } catch (Exception $e) {
        $stats['popular_videos'] = [];
    }

    // 13. สถิติเพศ
    try {
        $stmt = $conn->query("
            SELECT
                gender,
                COUNT(*) as count
            FROM stk_personinfo
            WHERE gender IS NOT NULL AND gender != ''
            GROUP BY gender
        ");
        $gender_stats = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stats['gender_distribution'] = $gender_stats;
    } catch (Exception $e) {
        $stats['gender_distribution'] = [];
    }

    // 14. สถิติช่วงอายุ (ใช้ birthdate แทน birth_date)
    try {
        $stmt = $conn->query("
            SELECT
                CASE
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) < 30 THEN 'ต่ำกว่า 30 ปี'
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 30 AND 40 THEN '30-40 ปี'
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 41 AND 50 THEN '41-50 ปี'
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 51 AND 60 THEN '51-60 ปี'
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 61 AND 70 THEN '61-70 ปี'
                    ELSE 'มากกว่า 70 ปี'
                END as age_group,
                COUNT(*) as count
            FROM stk_personinfo
            WHERE birthdate IS NOT NULL
            GROUP BY age_group
            ORDER BY count DESC
        ");
        $age_stats = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stats['age_distribution'] = $age_stats;
    } catch (Exception $e) {
        $stats['age_distribution'] = [];
    }

    // 15. กิจกรรมล่าสุด
    $stats['recent_activities'] = [];

    // ลองดึงจากตารางที่มีอยู่
    try {
        $activities = [];

        // Health records - ลบออกแล้ว (ตารางเก่าที่สร้างผิด)

        // Exercise records ในเดือนที่เลือก
        try {
            $stmt = $conn->prepare("
                SELECT
                    'exercise' as activity_type,
                    'ออกกำลังกาย' as activity_name,
                    created_at as activity_date,
                    pid
                FROM stk_exercise_records
                WHERE created_at IS NOT NULL
                AND MONTH(created_at) = ? AND YEAR(created_at) = ?
                ORDER BY created_at DESC
                LIMIT 5
            ");
            $stmt->execute([$selected_month_num, $selected_year]);
            $exercise_activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $activities = array_merge($activities, $exercise_activities);
        } catch (Exception $e) {
            // ไม่มีตาราง exercise_records
        }

        // Medication records ในเดือนที่เลือก
        try {
            $stmt = $conn->prepare("
                SELECT
                    'medication' as activity_type,
                    'รับประทานยา' as activity_name,
                    created_at as activity_date,
                    pid
                FROM stk_medication_records
                WHERE created_at IS NOT NULL
                AND MONTH(created_at) = ? AND YEAR(created_at) = ?
                ORDER BY created_at DESC
                LIMIT 5
            ");
            $stmt->execute([$selected_month_num, $selected_year]);
            $medication_activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $activities = array_merge($activities, $medication_activities);
        } catch (Exception $e) {
            // ไม่มีตาราง medication_records
        }

        // BEFAST assessments ในเดือนที่เลือก (ใช้ stk_health_record_befast)
        try {
            $stmt = $conn->prepare("
                SELECT
                    'befast' as activity_type,
                    'ประเมิน BEFAST' as activity_name,
                    record_date as activity_date,
                    pid
                FROM stk_health_record_befast
                WHERE record_date IS NOT NULL
                AND MONTH(record_date) = ? AND YEAR(record_date) = ?
                ORDER BY record_date DESC
                LIMIT 5
            ");
            $stmt->execute([$selected_month_num, $selected_year]);
            $befast_activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $activities = array_merge($activities, $befast_activities);
        } catch (Exception $e) {
            // ไม่มีตาราง befast_assessments
        }

        // ADL assessments ในเดือนที่เลือก
        try {
            $stmt = $conn->prepare("
                SELECT
                    'adl' as activity_type,
                    'ประเมิน ADL' as activity_name,
                    created_at as activity_date,
                    pid
                FROM stk_adl_assessments
                WHERE created_at IS NOT NULL
                AND MONTH(created_at) = ? AND YEAR(created_at) = ?
                ORDER BY created_at DESC
                LIMIT 5
            ");
            $stmt->execute([$selected_month_num, $selected_year]);
            $adl_activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $activities = array_merge($activities, $adl_activities);
        } catch (Exception $e) {
            // ไม่มีตาราง adl_assessments
        }

        // Video views ในเดือนที่เลือก
        try {
            $stmt = $conn->prepare("
                SELECT
                    'video' as activity_type,
                    CONCAT('ดูวิดีโอ ID: ', video_id) as activity_name,
                    viewed_at as activity_date,
                    pid
                FROM stk_video_view_log
                WHERE viewed_at IS NOT NULL
                AND MONTH(viewed_at) = ? AND YEAR(viewed_at) = ?
                ORDER BY viewed_at DESC
                LIMIT 5
            ");
            $stmt->execute([$selected_month_num, $selected_year]);
            $video_activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $activities = array_merge($activities, $video_activities);
        } catch (Exception $e) {
            // ไม่มีตาราง video_view_log
        }

        // Satisfaction surveys ในเดือนที่เลือก
        try {
            $stmt = $conn->prepare("
                SELECT
                    'survey' as activity_type,
                    'แบบสอบถามความพึงพอใจ' as activity_name,
                    created_at as activity_date,
                    pid
                FROM stk_satisfaction_survey
                WHERE created_at IS NOT NULL
                AND MONTH(created_at) = ? AND YEAR(created_at) = ?
                ORDER BY created_at DESC
                LIMIT 5
            ");
            $stmt->execute([$selected_month_num, $selected_year]);
            $survey_activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $activities = array_merge($activities, $survey_activities);
        } catch (Exception $e) {
            // ไม่มีตาราง satisfaction_survey
        }

        // Nutrition records ในเดือนที่เลือก
        try {
            $stmt = $conn->prepare("
                SELECT
                    'nutrition' as activity_type,
                    'บันทึกโภชนาการ' as activity_name,
                    created_at as activity_date,
                    pid
                FROM stk_nutrition_records
                WHERE created_at IS NOT NULL
                AND MONTH(created_at) = ? AND YEAR(created_at) = ?
                ORDER BY created_at DESC
                LIMIT 5
            ");
            $stmt->execute([$selected_month_num, $selected_year]);
            $nutrition_activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $activities = array_merge($activities, $nutrition_activities);
        } catch (Exception $e) {
            // ไม่มีตาราง nutrition_records
        }

        // เรียงลำดับตามวันที่และเอาแค่ 10 รายการ
        usort($activities, function($a, $b) {
            return strtotime($b['activity_date']) - strtotime($a['activity_date']);
        });

        $stats['recent_activities'] = array_slice($activities, 0, 10);

    } catch (Exception $e) {
        $stats['recent_activities'] = [];
    }

    // 16. เปรียบเทียบข้อมูล 12 เดือนล่าสุด
    $stats['monthly_comparison'] = [];

    try {
        $monthly_data = [];

        // BEFAST assessments - 12 months
        try {
            $stmt = $conn->query("
                SELECT
                    YEAR(record_date) as year,
                    MONTH(record_date) as month,
                    COUNT(*) as count
                FROM stk_health_record_befast
                WHERE record_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY YEAR(record_date), MONTH(record_date)
                ORDER BY year DESC, month DESC
                LIMIT 12
            ");
            $befast_monthly = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stats['monthly_comparison']['befast_assessments'] = $befast_monthly;
        } catch (Exception $e) {
            $stats['monthly_comparison']['befast_assessments'] = [];
        }

        // ADL assessments - 12 months
        try {
            $stmt = $conn->query("
                SELECT
                    YEAR(created_at) as year,
                    MONTH(created_at) as month,
                    COUNT(*) as count
                FROM stk_adl_assessments
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY YEAR(created_at), MONTH(created_at)
                ORDER BY year DESC, month DESC
                LIMIT 12
            ");
            $adl_monthly = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stats['monthly_comparison']['adl_assessments'] = $adl_monthly;
        } catch (Exception $e) {
            $stats['monthly_comparison']['adl_assessments'] = [];
        }

        // Exercise records - 12 months
        try {
            $stmt = $conn->query("
                SELECT
                    YEAR(created_at) as year,
                    MONTH(created_at) as month,
                    COUNT(*) as count
                FROM stk_exercise_records
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY YEAR(created_at), MONTH(created_at)
                ORDER BY year DESC, month DESC
                LIMIT 12
            ");
            $exercise_monthly = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stats['monthly_comparison']['exercise_records'] = $exercise_monthly;
        } catch (Exception $e) {
            $stats['monthly_comparison']['exercise_records'] = [];
        }

        // Medication records - 12 months
        try {
            $stmt = $conn->query("
                SELECT
                    YEAR(created_at) as year,
                    MONTH(created_at) as month,
                    COUNT(*) as count
                FROM stk_medication_records
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY YEAR(created_at), MONTH(created_at)
                ORDER BY year DESC, month DESC
                LIMIT 12
            ");
            $medication_monthly = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stats['monthly_comparison']['medication_records'] = $medication_monthly;
        } catch (Exception $e) {
            $stats['monthly_comparison']['medication_records'] = [];
        }

        // Nutrition records - 12 months
        try {
            $stmt = $conn->query("
                SELECT
                    YEAR(created_at) as year,
                    MONTH(created_at) as month,
                    COUNT(*) as count
                FROM stk_nutrition_records
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY YEAR(created_at), MONTH(created_at)
                ORDER BY year DESC, month DESC
                LIMIT 12
            ");
            $nutrition_monthly = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stats['monthly_comparison']['nutrition_records'] = $nutrition_monthly;
        } catch (Exception $e) {
            $stats['monthly_comparison']['nutrition_records'] = [];
        }

        // Health behavior - 12 months
        try {
            $stmt = $conn->query("
                SELECT
                    YEAR(created_at) as year,
                    MONTH(created_at) as month,
                    COUNT(*) as count
                FROM stk_health_behavior
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY YEAR(created_at), MONTH(created_at)
                ORDER BY year DESC, month DESC
                LIMIT 12
            ");
            $behavior_monthly = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stats['monthly_comparison']['health_behavior'] = $behavior_monthly;
        } catch (Exception $e) {
            $stats['monthly_comparison']['health_behavior'] = [];
        }

        // Satisfaction survey - 12 months
        try {
            $stmt = $conn->query("
                SELECT
                    YEAR(created_at) as year,
                    MONTH(created_at) as month,
                    COUNT(*) as count
                FROM stk_satisfaction_survey
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY YEAR(created_at), MONTH(created_at)
                ORDER BY year DESC, month DESC
                LIMIT 12
            ");
            $survey_monthly = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stats['monthly_comparison']['satisfaction_survey'] = $survey_monthly;
        } catch (Exception $e) {
            $stats['monthly_comparison']['satisfaction_survey'] = [];
        }

        // Video views - 12 months
        try {
            $stmt = $conn->query("
                SELECT
                    YEAR(viewed_at) as year,
                    MONTH(viewed_at) as month,
                    COUNT(*) as count
                FROM stk_video_view_log
                WHERE viewed_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY YEAR(viewed_at), MONTH(viewed_at)
                ORDER BY year DESC, month DESC
                LIMIT 12
            ");
            $video_monthly = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stats['monthly_comparison']['video_views'] = $video_monthly;
        } catch (Exception $e) {
            $stats['monthly_comparison']['video_views'] = [];
        }

    } catch (Exception $e) {
        $stats['monthly_comparison'] = [];
    }

    // เพิ่มสถิติรายเดือนที่แสดงทั้งครั้งและคน
    try {
        // การออกกำลังกายในเดือนที่เลือก
        $stmt = $conn->prepare("
            SELECT
                COUNT(*) as total_records,
                COUNT(DISTINCT pid) as unique_people
            FROM stk_exercise_records
            WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
        ");
        $stmt->execute([$selected_month_num, $selected_year]);
        $result = $stmt->fetch();
        $stats['exercise_month'] = [
            'records' => (int)(isset($result['total_records']) ? $result['total_records'] : 0),
            'people' => (int)(isset($result['unique_people']) ? $result['unique_people'] : 0)
        ];

        // การรับประทานยาในเดือนที่เลือก
        $stmt = $conn->prepare("
            SELECT
                COUNT(*) as total_records,
                COUNT(DISTINCT pid) as unique_people
            FROM stk_medication_records
            WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
        ");
        $stmt->execute([$selected_month_num, $selected_year]);
        $result = $stmt->fetch();
        $stats['medication_month'] = [
            'records' => (int)(isset($result['total_records']) ? $result['total_records'] : 0),
            'people' => (int)(isset($result['unique_people']) ? $result['unique_people'] : 0)
        ];

        // โภชนาการในเดือนที่เลือก
        $stmt = $conn->prepare("
            SELECT
                COUNT(*) as total_records,
                COUNT(DISTINCT pid) as unique_people
            FROM stk_nutrition_records
            WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
        ");
        $stmt->execute([$selected_month_num, $selected_year]);
        $result = $stmt->fetch();
        $stats['nutrition_month'] = [
            'records' => (int)(isset($result['total_records']) ? $result['total_records'] : 0),
            'people' => (int)(isset($result['unique_people']) ? $result['unique_people'] : 0)
        ];

        // พฤติกรรมสุขภาพในเดือนที่เลือก
        $stmt = $conn->prepare("
            SELECT
                COUNT(*) as total_records,
                COUNT(DISTINCT pid) as unique_people
            FROM stk_health_behavior
            WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
        ");
        $stmt->execute([$selected_month_num, $selected_year]);
        $result = $stmt->fetch();
        $stats['health_behavior_month'] = [
            'records' => (int)(isset($result['total_records']) ? $result['total_records'] : 0),
            'people' => (int)(isset($result['unique_people']) ? $result['unique_people'] : 0)
        ];

        // ADL Assessment ในเดือนที่เลือก
        $stmt = $conn->prepare("
            SELECT
                COUNT(*) as total_records,
                COUNT(DISTINCT pid) as unique_people
            FROM stk_adl_assessments
            WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
        ");
        $stmt->execute([$selected_month_num, $selected_year]);
        $result = $stmt->fetch();
        $stats['adl_month'] = [
            'records' => (int)(isset($result['total_records']) ? $result['total_records'] : 0),
            'people' => (int)(isset($result['unique_people']) ? $result['unique_people'] : 0)
        ];

        // ความพึงพอใจในเดือนที่เลือก
        $stmt = $conn->prepare("
            SELECT
                COUNT(*) as total_records,
                COUNT(DISTINCT pid) as unique_people
            FROM stk_satisfaction_survey
            WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
        ");
        $stmt->execute([$selected_month_num, $selected_year]);
        $result = $stmt->fetch();
        $stats['satisfaction_month'] = [
            'records' => (int)(isset($result['total_records']) ? $result['total_records'] : 0),
            'people' => (int)(isset($result['unique_people']) ? $result['unique_people'] : 0)
        ];

        // การดูวิดีโอในเดือนที่เลือก
        $stmt = $conn->prepare("
            SELECT
                COUNT(*) as total_records,
                COUNT(DISTINCT pid) as unique_people
            FROM stk_video_view_log
            WHERE MONTH(viewed_at) = ? AND YEAR(viewed_at) = ?
        ");
        $stmt->execute([$selected_month_num, $selected_year]);
        $result = $stmt->fetch();
        $stats['video_month'] = [
            'records' => (int)(isset($result['total_records']) ? $result['total_records'] : 0),
            'people' => (int)(isset($result['unique_people']) ? $result['unique_people'] : 0)
        ];

    } catch (Exception $e) {
        // ถ้า error ให้ใส่ค่า default
        $stats['exercise_month'] = ['records' => 0, 'people' => 0];
        $stats['medication_month'] = ['records' => 0, 'people' => 0];
        $stats['nutrition_month'] = ['records' => 0, 'people' => 0];
        $stats['health_behavior_month'] = ['records' => 0, 'people' => 0];
        $stats['adl_month'] = ['records' => 0, 'people' => 0];
        $stats['satisfaction_month'] = ['records' => 0, 'people' => 0];
        $stats['video_month'] = ['records' => 0, 'people' => 0];
    }

    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>