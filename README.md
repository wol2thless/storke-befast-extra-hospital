# Stroke BeFast — ระบบติดตามผู้ป่วยโรคหลอดเลือดสมอง

ระบบ Web Application สำหรับติดตามพฤติกรรมสุขภาพและนัดหมายผู้ป่วยโรคหลอดเลือดสมอง
พัฒนาด้วย **React + Vite** (Frontend) และ **PHP + MySQL** (Backend)

---

## ข้อมูลที่ต้องเตรียมก่อนติดตั้ง

ก่อนเริ่มติดตั้ง ให้รวบรวมข้อมูลเหล่านี้ให้พร้อม:

| ข้อมูล | ตัวอย่าง | ใช้ที่ไหน |
|--------|----------|----------|
| IP หรือ domain ของ server | `192.168.1.10` | `.env`, `config.php` |
| ชื่อโฟลเดอร์ที่จะวาง project | `stroke-befast` | `.env`, `.htaccess` |
| username/password MySQL | `root` / `P@ssw0rd` | `config.php` |
| URL ของ ThaiD API | ใช้ค่าเริ่มต้นได้เลย ไม่ต้องเปลี่ยน | `config.php` |
| Client ID จาก DOPA (ถ้ามี) | `abc123...` | `.env` |
| URL ของ HIS นัดหมาย (ถ้ามี) | `http://HIS/api/appoint.php` | `config.php` |

> ThaiD และ HIS ไม่บังคับ — ถ้ายังไม่มีสามารถเว้นว่างไว้ก่อน ระบบยังทำงานได้

---

## ความต้องการของระบบ (Requirements)

| รายการ | เวอร์ชันขั้นต่ำ |
|--------|----------------|
| PHP | 7.4 ขึ้นไป (รองรับถึง 8.x) |
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
│   │   ├── health.php           — ตรวจสอบสถานะระบบหลังติดตั้ง
│   │   └── ...                  — PHP API endpoints ทั้งหมด
│   ├── configs/
│   │   ├── config.example.php   — template ตั้งค่า (คัดลอกเป็น config.php)
│   │   ├── config.php           — ไฟล์ตั้งค่าจริง (ไม่ติด git)
│   │   ├── conn.php             — PDO database connection
│   │   └── cors.php             — CORS helper
│   ├── docs/
│   │   ├── appointment_api_spec.md  — สเปค API นัดหมาย HIS
│   │   └── thaid_setup_guide.md     — คู่มือตั้งค่า ThaiD
│   └── sql/
│       ├── schema.sql       — สร้าง database และ tables ทั้งหมด
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

### ขั้นตอนที่ 1 — วางไฟล์โปรเจกต์บน Server

แตก zip หรือ clone ไว้ในโฟลเดอร์ที่ Apache ให้บริการ:

- **Windows (XAMPP):** `C:/xampp/htdocs/stroke-befast/`
- **Linux:** `/var/www/html/stroke-befast/`

> ตั้งชื่อโฟลเดอร์เป็นอะไรก็ได้ แต่ต้องจำไว้ใช้ในขั้นตอนถัดไป
> เอกสารนี้ใช้ `stroke-befast` เป็นตัวอย่าง

---

### ขั้นตอนที่ 2 — สร้างฐานข้อมูล

**วิธีที่ 1 — phpMyAdmin** (แนะนำ)

เปิด phpMyAdmin → แถบ **Import** → เลือกไฟล์ `backend/sql/schema.sql` → **Go**

> ไม่ต้องสร้าง database ก่อน — ไฟล์ schema.sql จะสร้าง database `stroke`
> พร้อม charset `utf8mb4` ที่ถูกต้องให้อัตโนมัติ

**วิธีที่ 2 — Command line**

```bash
mysql -u root -p < backend/sql/schema.sql
```

✅ เสร็จแล้ว ตรวจได้ที่ phpMyAdmin ว่ามี database ชื่อ `stroke` และมีตาราง `stk_*` ครบ

---

### ขั้นตอนที่ 3 — ตั้งค่า Backend

**3.1** คัดลอกไฟล์ config:

```bash
# Linux/Mac
cp backend/configs/config.example.php backend/configs/config.php

# Windows
copy backend\configs\config.example.php backend\configs\config.php
```

**3.2** เปิดไฟล์ `backend/configs/config.php` แล้วแก้ค่าตามระบบของโรงพยาบาล:

```php
// ฐานข้อมูล
define('DB_HOST', 'localhost');        // ปกติใช้ localhost
define('DB_USER', 'your_username');    // username MySQL
define('DB_PASS', 'your_password');    // password MySQL
define('DB_NAME', 'stroke');           // ชื่อ database (ไม่ต้องเปลี่ยน)

// API นัดหมาย HIS — ถ้ายังไม่มีให้ใส่ค่าว่าง ''
define('APPOINTMENT_API_URL', '');

// ThaiD — ไม่ต้องแก้ ใช้ค่าเริ่มต้นได้เลย
define('THAID_API_URL', 'https://hatyaihospital.go.th/ThaiD/api-ext/');

// CORS — ใส่ URL ของ server ที่เปิดระบบ คั่นด้วย |
define('CORS_ALLOWED_ORIGINS', 'http://YOUR_SERVER_IP');
```

---

### ขั้นตอนที่ 4 — ตั้งค่า Frontend

**4.1** คัดลอกไฟล์ .env:

```bash
# Linux/Mac
cp .env.example .env

# Windows
copy .env.example .env
```

**4.2** เปิดไฟล์ `.env` แล้วแก้ค่า:

```env
# ชื่อโฟลเดอร์ที่วาง project (ต้องตรงกับขั้นตอนที่ 1)
# ถ้าวางที่ root ของ domain ให้ใส่ /
VITE_BASE_PATH=/stroke-befast

# URL ของ backend — ใส่ IP server และชื่อโฟลเดอร์ให้ตรง
VITE_API_BASE_URL=http://YOUR_SERVER_IP/stroke-befast/backend/api

# ThaiD Client ID — ใช้ค่านี้ได้เลย ไม่ต้องเปลี่ยน
VITE_THAID_CLIENT_ID=NjZrZlpoZTdVM2xUSXA0dXZ2YVF0WmIyam1HVnJUcXU

# ลิงก์เสริม — ใส่หรือเว้นว่างก็ได้
VITE_MANUAL_URL=
VITE_ASSESSMENT_FORM_URL=
VITE_ADMIN_MANUAL_URL=
VITE_MANUAL_PDF_URL=
VITE_LINE_OA_URL=
```

---

### ขั้นตอนที่ 5 — ตั้งค่า Apache

**5.1** ตรวจสอบว่า Apache เปิด `mod_rewrite` และตั้ง `AllowOverride All` แล้ว

**5.2** เปิดไฟล์ `.htaccess` ที่ root ของโปรเจกต์ แล้วแก้ 2 บรรทัดให้ตรงกับชื่อโฟลเดอร์:

```apache
RewriteBase /stroke-befast
RewriteRule . /stroke-befast/index.html [L]
```

> ถ้าชื่อโฟลเดอร์คือ `/health-app` ให้เปลี่ยนทั้งสองบรรทัดเป็น `/health-app`
> ถ้าวางที่ root ของ domain ให้ใส่ `/` และ `/index.html`

---

### ขั้นตอนที่ 6 — Build Frontend

รันคำสั่งในโฟลเดอร์ root ของโปรเจกต์:

```bash
npm install
npm run build
```

จากนั้นคัดลอกไฟล์จาก `dist/` ไปวางที่ root ของโปรเจกต์:

```bash
# Linux/Mac
cp -r dist/* ./

# Windows
xcopy dist\* . /E /Y
```

✅ ตรวจสอบว่ามีไฟล์ `index.html` และโฟลเดอร์ `assets/` อยู่ที่ root แล้ว

---

### ขั้นตอนที่ 7 — สร้าง Admin คนแรก

**7.1** เปิดไฟล์ `backend/sql/seed_admin.php` แล้วแก้ค่า:

```php
$provider_id = 'admin001';    // username สำหรับ login
$name        = 'ผู้ดูแลระบบ'; // ชื่อที่แสดงในระบบ
$password    = 'Admin@1234';  // รหัสผ่านเริ่มต้น — เปลี่ยนหลัง login ด้วย
$role        = 'admin';       // admin | staff | supervisor
```

**7.2** เปิด browser ไปที่:

```
http://YOUR_SERVER_IP/stroke-befast/backend/sql/seed_admin.php
```

ผลลัพธ์ที่ถูกต้อง:
```json
{ "success": true, "message": "สร้าง admin สำเร็จ กรุณาลบไฟล์ seed_admin.php ออกทันที" }
```

**7.3** ลบไฟล์ `seed_admin.php` ทิ้งทันที

> **⚠️ สำคัญ:** ถ้าไม่ลบ ใครก็สามารถสร้าง admin ใหม่ได้โดยไม่ต้องมีสิทธิ์

---

### ขั้นตอนที่ 8 — ตรวจสอบการติดตั้ง (Health Check)

เปิด browser ไปที่:

```
http://YOUR_SERVER_IP/stroke-befast/backend/api/health.php
```

ผลลัพธ์ที่ถูกต้อง (`"status": "ok"` ทุก check):

```json
{
    "status": "ok",
    "checks": {
        "php":        { "ok": true, "version": "8.x.x" },
        "extensions": { "ok": true },
        "database":   { "ok": true, "message": "เชื่อมต่อ database stroke สำเร็จ" },
        "config":     { "ok": true },
        "htaccess":   { "ok": true }
    }
}
```

ถ้ามี `"ok": false` ในรายการใด ให้อ่านข้อความ `"message"` และแก้ไขตามนั้น

---

### ✅ ติดตั้งเสร็จแล้ว

เปิดใช้งานระบบที่:
```
http://YOUR_SERVER_IP/stroke-befast
```

- **ผู้ป่วย** — login ด้วย ThaiD (บัตรประชาชน)
- **เจ้าหน้าที่/Admin** — login ที่ `/stroke-befast/admin/login`

---

## การตั้งค่า API นัดหมาย HIS (ไม่บังคับ)

อ่านรายละเอียดที่ **[backend/docs/appointment_api_spec.md](backend/docs/appointment_api_spec.md)**

endpoint ของ HIS ต้องรับ `POST` และส่งกลับรูปแบบนี้:

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

| ไฟล์ | ค่าที่ต้องแก้ |
|------|--------------|
| `backend/configs/config.php` | `DB_USER`, `DB_PASS`, `CORS_ALLOWED_ORIGINS` (THAID_API_URL ไม่ต้องแก้) |
| `.env` | `VITE_BASE_PATH`, `VITE_API_BASE_URL`, `VITE_THAID_CLIENT_ID` |
| `.htaccess` | `RewriteBase` และ `RewriteRule` (ถ้าชื่อโฟลเดอร์ไม่ใช่ `/stroke-befast`) |
| `backend/sql/seed_admin.php` | `$provider_id`, `$name`, `$password` แล้วลบไฟล์ทิ้ง |

---

## ปัญหาที่พบบ่อย

**หน้าเว็บขึ้น 404 เมื่อ refresh**
→ `mod_rewrite` ยังไม่เปิด หรือ `AllowOverride All` ยังไม่ตั้ง
→ แก้ใน Apache config: `AllowOverride All`

**API เรียกไม่ได้ (CORS error)**
→ เพิ่ม URL ของ server ใน `CORS_ALLOWED_ORIGINS` ใน `config.php`
→ เช่น `http://192.168.1.10|http://192.168.1.10:5173`

**Database connection failed**
→ ตรวจ `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` ใน `config.php`
→ เปิด `health.php` เพื่อดูข้อความ error ที่ชัดเจน

**หน้านัดหมายไม่แสดงข้อมูล**
→ ตรวจ `APPOINTMENT_API_URL` ใน `config.php`
→ อ่าน `backend/docs/appointment_api_spec.md`

**URL ผิด / หน้าไม่โหลด**
→ ตรวจ `VITE_BASE_PATH` ใน `.env` และ `RewriteBase` ใน `.htaccess` ต้องตรงกัน
→ ต้อง build frontend ใหม่ทุกครั้งที่แก้ `.env`
