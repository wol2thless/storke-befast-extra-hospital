# Video Library Images

โฟลเดอร์นี้สำหรับเก็บภาพจาก Google Docs ที่ใช้ในหน้า VideoLibrary

## วิธีการเพิ่มภาพ

### 1. ดาวน์โหลดภาพจาก Google Docs
1. เปิด Google Docs: https://docs.google.com/document/d/1-RUfyOY4e0nk1oOLnme863F4DAqIcDx2_KXKMSovyg8/edit?tab=t.0
2. คลิกขวาที่ภาพที่ต้องการ
3. เลือก "บันทึกภาพเป็น..."
4. บันทึกภาพในโฟลเดอร์นี้

### 2. ตั้งชื่อไฟล์
ใช้ชื่อไฟล์ที่สื่อความหมาย เช่น:
- `befast-infographic.jpg` (ภาพ BEFAST infographic)
- `stroke-guide.png`
- `health-info.jpg`

### 3. รองรับไฟล์
- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.webp`

### 4. ขนาดไฟล์
แนะนำให้ใช้ภาพขนาด:
- ความกว้าง: 300-1200px
- ความสูง: 200-800px
- ขนาดไฟล์: ไม่เกิน 2MB

## โครงสร้างไฟล์

```
public/images/video-library/
├── README.md
├── befast-infographic.jpg
├── stroke-guide.png
└── health-info.jpg
```

## การใช้งานในโค้ด

```javascript
// ตัวอย่างการใช้งาน
const images = [
  {
    id: 1,
    title: "สัญญาณเตือนโรคหลอดเลือดสมอง BEFAST",
    description: "อาการและสัญญาณเตือนโรคหลอดเลือดสมอง B.E.F.A.S.T.",
    src: "/images/video-library/befast-infographic.jpg",
    category: "stroke_education"
  }
];
``` 