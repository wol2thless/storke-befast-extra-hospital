# Appointment API Specification

เอกสารนี้อธิบาย API สำหรับดึงข้อมูลนัดหมายผู้ป่วย
โรงพยาบาลที่นำระบบไปใช้ต้องสร้าง endpoint ของตัวเองให้ตรงตาม spec นี้
จากนั้นกำหนด URL ใน `backend/configs/config.php` ที่ค่า `APPOINTMENT_API_URL`

---

## Request (ที่ระบบส่งไปหา HIS)

| รายการ | ค่า |
|--------|-----|
| Method | `POST` |
| Content-Type | `application/json` |

### Request Body

```json
{
  "pid": "1234567890123"
}
```

| Field | Type | คำอธิบาย |
|-------|------|----------|
| `pid` | string | เลขบัตรประชาชน 13 หลักของผู้ป่วย |

---

## Response (ที่ HIS ต้องส่งกลับมา)

### กรณีพบข้อมูลนัด — HTTP 200

ส่งกลับเป็น **JSON Array** ของรายการนัด (ไม่ต้อง wrap ใน object)

```json
[
  {
    "APP_DATE": "25/03/2026",
    "APP_TIME": "09:00",
    "hn": "HN123456",
    "fullname": "นาย สมชาย ใจดี"
  },
  {
    "APP_DATE": "10/04/2026",
    "APP_TIME": "13:30",
    "hn": "HN123456",
    "fullname": "นาย สมชาย ใจดี"
  }
]
```

### กรณีไม่พบข้อมูล — HTTP 200

ส่งกลับ Array ว่าง

```json
[]
```

---

## Field ที่จำเป็น (Required)

| Field | Type | Format | ตัวอย่าง | คำอธิบาย |
|-------|------|--------|---------|----------|
| `APP_DATE` | string | `DD/MM/YYYY` | `"25/03/2026"` | วันที่นัด — **ต้องเป็น** วัน/เดือน/ปีค.ศ. คั่นด้วย `/` |
| `APP_TIME` | string | `HH:MM` | `"09:00"` | เวลานัด — 24 ชั่วโมง |
| `hn` | string | — | `"HN123456"` | เลข HN ของผู้ป่วยในระบบโรงพยาบาล |
| `fullname` | string | — | `"นาย สมชาย ใจดี"` | ชื่อ-นามสกุลผู้ป่วย |

> **หมายเหตุ `APP_DATE`:** ระบบ parse วันที่ด้วย `DD/MM/YYYY` เท่านั้น
> ถ้า format ผิด (เช่น `YYYY-MM-DD`) ตารางนัดจะแสดงผลไม่ถูกต้อง

---

## ตัวอย่าง PHP endpoint ฝั่ง HIS

```php
<?php
header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$pid   = $input['pid'] ?? '';

if (!$pid) {
    echo json_encode([]);
    exit();
}

// ดึงข้อมูลจากฐานข้อมูล HIS ของโรงพยาบาล
// (ปรับ query ตาม schema ของแต่ละโรงพยาบาล)
$conn = new PDO('mysql:host=localhost;dbname=his_db;charset=utf8', 'user', 'pass');
$stmt = $conn->prepare("
    SELECT
        DATE_FORMAT(appointment_date, '%d/%m/%Y') AS APP_DATE,
        TIME_FORMAT(appointment_time, '%H:%i')    AS APP_TIME,
        hn,
        fullname
    FROM appointments
    WHERE pid = ?
    ORDER BY appointment_date ASC
");
$stmt->execute([$pid]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($rows);
```

---

## การตั้งค่าในโปรเจกต์

หลังสร้าง endpoint แล้ว แก้ไขใน `backend/configs/config.php`:

```php
define('APPOINTMENT_API_URL', 'http://YOUR_HIS_SERVER/path/to/your_endpoint.php');
```

---

## กรณีที่โรงพยาบาลยังไม่มี HIS หรือ API นัดหมาย

ตั้ง `APPOINTMENT_API_URL` เป็นค่าว่าง:

```php
define('APPOINTMENT_API_URL', '');
```

ระบบจะแสดงข้อความ "ไม่พบข้อมูลการนัด" โดยไม่ crash
