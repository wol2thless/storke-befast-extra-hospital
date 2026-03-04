# ThaiD Authentication — คู่มือการตั้งค่า

ระบบนี้ใช้ **ThaiD (บัตรประชาชน Digital ID)** สำหรับยืนยันตัวตนผู้ป่วย
ผ่านมาตรฐาน **OAuth2 Authorization Code Flow**

---

## ภาพรวมการทำงาน

```
ผู้ป่วย → กดปุ่ม Login → ThaiD (imauth.bora.dopa.go.th) → กลับมาที่ระบบพร้อม code
    → backend แลก code กับข้อมูลผู้ป่วย → เข้าสู่ระบบสำเร็จ
```

ขั้นตอนทั้งหมด:

1. ผู้ป่วยกด "เข้าสู่ระบบด้วย ThaiD"
2. ระบบ redirect ไป `https://imauth.bora.dopa.go.th` พร้อม `client_id`
3. ผู้ป่วยยืนยันตัวตนด้วยบัตรประชาชน
4. ThaiD ส่ง `code` กลับมาที่ `/stroke-befast/core`
5. Frontend ส่ง `code` ไปที่ `backend/api/thaid-verify.php`
6. Backend แลก `code` กับ ThaiD API ของโรงพยาบาล → ได้ข้อมูลผู้ป่วย
7. เก็บ session แบบ encrypt ใน localStorage → เข้าระบบได้ 24 ชั่วโมง

---

## สิ่งที่โรงพยาบาลต้องเตรียม

### กรณีที่ 1 — โรงพยาบาลมี ThaiD ของตัวเองแล้ว

ต้องการข้อมูล 2 อย่าง:

| ข้อมูล | คำอธิบาย | ตั้งค่าที่ |
|--------|----------|-----------|
| **Client ID** | รหัสที่ได้จากการลงทะเบียน application กับ DOPA | `.env` → `VITE_THAID_CLIENT_ID` |
| **ThaiD API URL** | URL ของ ThaiD proxy/gateway ภายในโรงพยาบาล | `config.php` → `THAID_API_URL` |

**ตั้งค่าใน `.env`:**
```env
VITE_THAID_CLIENT_ID=รหัส_client_id_ของโรงพยาบาล
```

**ตั้งค่าใน `backend/configs/config.php`:**
```php
define('THAID_API_URL', 'https://YOUR_HOSPITAL_DOMAIN/ThaiD/api/');
```

---

### กรณีที่ 2 — โรงพยาบาลยังไม่มี ThaiD

ต้องดำเนินการ **2 ขั้นตอน** กับหน่วยงานภายนอก:

#### ขั้นตอน A — ขอ Client ID กับ DOPA

ติดต่อกรมการปกครอง (DOPA) เพื่อขอลงทะเบียน application:
- เว็บไซต์: https://imauth.bora.dopa.go.th
- แจ้ง `redirect_uri` ที่จะใช้: `https://YOUR_DOMAIN/stroke-befast/core`
- DOPA จะออก **Client ID** ให้

#### ขั้นตอน B — ติดตั้ง ThaiD Gateway ภายในโรงพยาบาล

ThaiD ต้องการ gateway server ภายในโรงพยาบาลสำหรับแลก authorization code
ติดต่อ DOPA หรือผู้ให้บริการ ThaiD เพื่อขอ package ติดตั้ง

---

## ค่าที่ต้องแก้ไข (สรุป)

### ไฟล์ `.env`
```env
# Client ID ที่ได้จาก DOPA
VITE_THAID_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

### ไฟล์ `backend/configs/config.php`
```php
# URL ของ ThaiD gateway ภายในโรงพยาบาล
define('THAID_API_URL', 'https://YOUR_HOSPITAL_DOMAIN/ThaiD/api/');
```

---

## redirect_uri ต้องตรงกัน

`redirect_uri` ที่แจ้งกับ DOPA **ต้องตรงกับ** URL จริงของระบบ

ค่าในโค้ด (`Login.jsx` บรรทัด 9):
```javascript
const redirect_uri = window.location.origin + "/stroke-befast/core";
```

ตัวอย่าง:
- ถ้า deploy ที่ `http://192.168.1.10` → redirect_uri = `http://192.168.1.10/stroke-befast/core`
- ถ้า deploy ที่ `https://myhospital.go.th` → redirect_uri = `https://myhospital.go.th/stroke-befast/core`

**แจ้ง redirect_uri นี้ให้ DOPA ขึ้นทะเบียนไว้ด้วย** ไม่เช่นนั้น ThaiD จะ reject

---

## ข้อมูลที่ได้จาก ThaiD หลัง login สำเร็จ

ระบบดึงข้อมูลเหล่านี้จาก ThaiD มาใช้:

| Field | คำอธิบาย |
|-------|---------|
| `pid` | เลขบัตรประชาชน 13 หลัก (ใช้เป็น user ID ในระบบ) |
| `name` | ชื่อ-นามสกุลภาษาไทย |
| `name_en` | ชื่อ-นามสกุลภาษาอังกฤษ |
| `gender` | เพศ |
| `birthdate` | วันเกิด |
| `address` | ที่อยู่ตามทะเบียนบ้าน |

---

## ถ้ายังไม่พร้อมใช้ ThaiD

ระบบ **ยังใช้งานได้** แต่ผู้ป่วยจะ login ไม่ได้
ทางเลือกชั่วคราว: เจ้าหน้าที่สามารถใช้หน้า Admin เพื่อจัดการข้อมูลได้โดยตรง
(login ผ่านหน้า `/stroke-befast/admin/login` ด้วย username/password)
