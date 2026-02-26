<?php
// ==============================================================
//  ไฟล์ตัวอย่าง — คัดลอกเป็น config.php แล้วแก้ค่าให้ตรงกับระบบ
// ==============================================================

// --- ฐานข้อมูล MySQL ---
define('DB_HOST',  'localhost');           // IP หรือ hostname ของ MySQL server
define('DB_USER',  'your_db_username');    // username ฐานข้อมูล
define('DB_PASS',  'your_db_password');    // password ฐานข้อมูล
define('DB_NAME',  'stroke');              // ชื่อฐานข้อมูล (ตรงกับที่ import SQL ไว้)

// --- API นัดหมาย (HIS ของโรงพยาบาล) ---
// URL ของ endpoint ในระบบ HIS ที่ใช้ดึงข้อมูลนัดหมายผู้ป่วย
// หากโรงพยาบาลไม่มีระบบ HIS หรือยังไม่พร้อม ให้ตั้งเป็นค่าว่าง ''
define('APPOINTMENT_API_URL', 'http://YOUR_HIS_SERVER_IP/api/path/to/appointment_endpoint.php');

// --- ThaiD Authentication ---
// URL ของ ThaiD API สำหรับยืนยันตัวตนผู้ป่วยผ่านบัตรประชาชน
// ติดต่อผู้ดูแลระบบ ThaiD ของโรงพยาบาลเพื่อขอ endpoint
define('THAID_API_URL', 'https://YOUR_HOSPITAL_DOMAIN/ThaiD/api/');

// --- CORS: origins ที่อนุญาต (frontend URLs) ---
// ใส่ URL ของ server ที่ deploy frontend ไว้ คั่นด้วย |
// เช่น: http://192.168.1.10|http://192.168.1.10:5173|https://myhospital.go.th
define('CORS_ALLOWED_ORIGINS', 'http://localhost:5173|http://YOUR_SERVER_IP');
