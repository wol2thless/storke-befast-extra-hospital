# Stroke BeFast — ระบบติดตามผู้ป่วยโรคหลอดเลือดสมอง

ระบบ Web Application สำหรับติดตามพฤติกรรมสุขภาพและนัดหมายผู้ป่วยโรคหลอดเลือดสมอง
พัฒนาด้วย **React + Vite** (Frontend) และ **PHP + MySQL** (Backend)

---

## ความต้องการของระบบ (Requirements)

| รายการ | เวอร์ชันขั้นต่ำ |
|--------|----------------|
| PHP | 7.4 ขึ้นไป |
| MySQL / MariaDB | 5.7 / 10.1 ขึ้นไป |
| Apache | 2.4 ขึ้นไป (ต้องเปิด `mod_rewrite`) |
| Node.js | 18 ขึ้นไป (ใช้ build frontend) |
| npm | 9 ขึ้นไป |

---

## โครงสร้างโปรเจกต์

```
stroke-befast/
├── backend/
│   ├── api/
│   │   ├── health.php           — ตรวจสอบสถานะระบบก่อนใช้งาน
│   │   └── ...                  — PHP API endpoints ทั้งหมด
│   ├── configs/
│   │   ├── config.example.php   — template ตั้งค่า (คัดลอกเป็น config.php)
│   │   ├── config.php           — ไฟล์ตั้งค่าจริง (ไม่ติด git)
│   │   ├── conn.php             — PDO database connection
│   │   └── cors.php             — CORS helper
│   ├── docs/
│   │   ├── appointment_api_spec.md  — สเปค API นัดหมาย (อ่านก่อนติดตั้ง)
│   │   └── thaid_setup_guide.md     — คู่มือตั้งค่า ThaiD
│   └── sql/
│       ├── schema.sql       — สร้าง database ทั้งหมด
│       └── seed_admin.php   — สร้าง admin คนแรก (รันครั้งเดียวแล้วลบทิ้ง)
├── src/                  — React source code
├── public/               — static assets
├── .env.example          — template ตั้งค่า frontend (คัดลอกเป็น .env)
├── .env                  — ไฟล์ตั้งค่าจริง (ไม่ติด git)
├── .htaccess             — Apache rewrite rules
├── vite.config.js        — Vite build config
└── package.json
```

---

## ขั้นตอนการติดตั้ง

### ขั้นตอนที่ 1 — รับไฟล์โปรเจกต์

```bash
git clone <repository-url> stroke-befast
```

หรือแตก zip ไฟล์ที่ได้รับไว้ในโฟลเดอร์ที่ Apache ให้บริการ เช่น
- `C:/xampp/htdocs/stroke-befast/`
- `/var/www/html/stroke-befast/`

> ชื่อโฟลเดอร์ไม่จำเป็นต้องเป็น `stroke-befast` — ตั้งชื่ออะไรก็ได้ แต่ต้องแก้ค่าในขั้นตอนที่ 5 ให้ตรงกัน

---

### ขั้นตอนที่ 2 — สร้างฐานข้อมูล

1. เปิด phpMyAdmin หรือ MySQL client
2. สร้าง database ชื่อ `stroke` (หรือชื่ออื่นที่ต้องการ)
3. Import schema:

```sql
-- ใน phpMyAdmin: เลือก database stroke → Import → เลือกไฟล์
backend/sql/schema.sql
```

หรือผ่าน command line:

```bash
mysql -u root -p stroke < backend/sql/schema.sql
```

---

### ขั้นตอนที่ 3 — ตั้งค่า Backend

คัดลอกไฟล์ config:

```bash
cp backend/configs/config.example.php backend/configs/config.php
```

แก้ไข `backend/configs/config.php`:

```php
// ฐานข้อมูล
define('DB_HOST', 'localhost');          // IP ของ MySQL server
define('DB_USER', 'your_db_username');   // username
define('DB_PASS', 'your_db_password');   // password
define('DB_NAME', 'stroke');             // ชื่อ database ที่สร้างในขั้นตอนที่ 2

// API นัดหมาย HIS (ถ้ายังไม่มีให้ใส่ค่าว่าง '')
// อ่านรายละเอียดที่ backend/docs/appointment_api_spec.md
define('APPOINTMENT_API_URL', 'http://HIS_SERVER_IP/path/to/appointment.php');

// ThaiD Authentication — อ่านรายละเอียดที่ backend/docs/thaid_setup_guide.md
define('THAID_API_URL', 'https://YOUR_HOSPITAL_DOMAIN/ThaiD/api/');

// CORS — ใส่ URL ของ frontend server คั่นด้วย |
define('CORS_ALLOWED_ORIGINS', 'http://localhost:5173|http://YOUR_SERVER_IP');
```

---

### ขั้นตอนที่ 4 — สร้าง Admin คนแรก

แก้ไขค่าใน `backend/sql/seed_admin.php`:

```php
$provider_id = 'admin001';    // username สำหรับ login
$name        = 'ผู้ดูแลระบบ'; // ชื่อที่แสดงในระบบ
$password    = 'Admin@1234';  // รหัสผ่านเริ่มต้น
$role        = 'admin';       // admin | staff | supervisor
```

แล้วรันผ่าน browser:

```
http://YOUR_SERVER_IP/stroke-befast/backend/sql/seed_admin.php
```

> **⚠️ สำคัญ:** ลบไฟล์ `seed_admin.php` ออกทันทีหลังรันสำเร็จ

---

### ขั้นตอนที่ 5 — ตั้งค่า Frontend

คัดลอกไฟล์ .env:

```bash
cp .env.example .env
```

แก้ไข `.env`:

```env
# Base path ของแอป — ต้องตรงกับชื่อโฟลเดอร์ที่วาง project ไว้
# ถ้าวางที่ root ของ domain ให้ใส่ /
VITE_BASE_PATH=/stroke-befast

# URL ของ backend API
VITE_API_BASE_URL=http://YOUR_SERVER_IP/stroke-befast/backend/api

# URL ของ HIS (ใช้ตอน dev เท่านั้น)
VITE_HIS_PROXY_TARGET=http://YOUR_HIS_SERVER_IP

# URL ตรงของ HIS Appointment endpoint (ใช้ใน API Tester — ไม่บังคับ)
VITE_HIS_APPOINTMENT_URL=

# ThaiD Client ID — อ่านรายละเอียดที่ backend/docs/thaid_setup_guide.md
VITE_THAID_CLIENT_ID=YOUR_THAID_CLIENT_ID
```

> **หมายเหตุ:** ถ้าตั้งชื่อโฟลเดอร์เป็น `/health-app` ให้เปลี่ยน `VITE_BASE_PATH=/health-app`
> และแก้ `.htaccess` ให้ตรงกัน (ดูขั้นตอนที่ 7)

---

### ขั้นตอนที่ 6 — Build Frontend

```bash
npm install
npm run build
```

ไฟล์ที่ build แล้วจะอยู่ในโฟลเดอร์ `dist/`
**คัดลอกไฟล์ทั้งหมดใน `dist/` วางไว้ที่ root ของโปรเจกต์** (ทับ `index.html` เดิม)

```bash
# Linux/Mac
cp -r dist/* ./

# Windows
xcopy dist\* . /E /Y
```

---

### ขั้นตอนที่ 7 — ตั้งค่า Apache

ตรวจสอบว่า Apache เปิด `mod_rewrite` แล้ว และตั้ง `AllowOverride All` ใน Apache config

แก้ไข `.htaccess` ให้ตรงกับชื่อโฟลเดอร์ที่ติดตั้ง:

```apache
# ถ้า project อยู่ใน /stroke-befast (ค่าเริ่มต้น — ไม่ต้องแก้)
RewriteBase /stroke-befast
RewriteRule . /stroke-befast/index.html [L]

# ถ้าตั้งชื่อโฟลเดอร์ต่างออกไป เช่น /health-app
RewriteBase /health-app
RewriteRule . /health-app/index.html [L]

# ถ้าวางที่ root ของ domain
RewriteBase /
RewriteRule . /index.html [L]
```

---

### ขั้นตอนที่ 8 — ตรวจสอบการติดตั้ง (Health Check)

หลังติดตั้งเสร็จ ให้เปิด browser ไปที่:

```
http://YOUR_SERVER_IP/stroke-befast/backend/api/health.php
```

ผลลัพธ์ที่ถูกต้อง (HTTP 200):
```json
{
    "status": "ok",
    "checks": {
        "php": { "ok": true, ... },
        "extensions": { "ok": true, ... },
        "database": { "ok": true, ... },
        "config": { "ok": true, ... },
        "htaccess": { "ok": true, ... }
    }
}
```

ถ้ามี `"ok": false` ให้แก้ไขตามข้อความ `message` ที่แสดง

---

## การตั้งค่า API นัดหมาย (HIS Integration)

อ่านรายละเอียดที่ **[backend/docs/appointment_api_spec.md](backend/docs/appointment_api_spec.md)**

สรุปโดยย่อ — endpoint ของ HIS ต้องรับ `POST` และส่งกลับ:

```json
[
  {
    "APP_DATE": "25/03/2026",
    "APP_TIME": "09:00",
    "hn": "HN123456",
    "fullname": "นาย สมชาย ใจดี"
  }
]
```

ถ้ายังไม่มี HIS ให้ตั้ง `APPOINTMENT_API_URL` เป็นค่าว่าง `''` ระบบยังทำงานได้ปกติ

---

## ไฟล์ที่ต้องแก้ก่อนใช้งาน (สรุป)

| ไฟล์ | สิ่งที่ต้องแก้ |
|------|--------------|
| `backend/configs/config.php` | DB credentials, `APPOINTMENT_API_URL`, `THAID_API_URL`, `CORS_ALLOWED_ORIGINS` |
| `.env` | `VITE_BASE_PATH`, `VITE_API_BASE_URL`, `VITE_THAID_CLIENT_ID` |
| `.htaccess` | `RewriteBase` และ `RewriteRule` (ถ้าชื่อโฟลเดอร์ไม่ใช่ `/stroke-befast`) |
| `backend/sql/seed_admin.php` | username, password ของ admin คนแรก |

---

## ปัญหาที่พบบ่อย

**หน้าเว็บขึ้น 404 เมื่อ refresh**
→ `mod_rewrite` ยังไม่เปิด หรือ `AllowOverride All` ยังไม่ตั้ง
แก้ใน Apache config: `AllowOverride All`

**API เรียกไม่ได้ (CORS error)**
→ เพิ่ม URL ของ frontend ใน `CORS_ALLOWED_ORIGINS` ใน `config.php`

**Database connection failed**
→ ตรวจ `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` ใน `config.php`
→ หรือเปิด `/backend/api/health.php` เพื่อดูรายละเอียดข้อผิดพลาด

**หน้านัดไม่แสดงข้อมูล**
→ ตรวจ `APPOINTMENT_API_URL` ใน `config.php` และอ่าน `backend/docs/appointment_api_spec.md`

**หน้าแสดงผิด path (เส้นทาง URL ผิด)**
→ ตรวจ `VITE_BASE_PATH` ใน `.env` และ `RewriteBase` ใน `.htaccess` ต้องตรงกัน
→ build frontend ใหม่หลังแก้ `.env`
