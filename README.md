# 🎲 The Divine Decider

> ระบบตัดสินใจแทนฉันที (ฉบับกวนประสาท)

เว็บแอปพลิเคชันที่ช่วยตัดสินใจเรื่องไร้สาระในชีวิตประจำวัน โดยเน้นความกวนประสาท (Sarcastic AI Personality) มีการใช้บริบทจริงของผู้ใช้ (เวลา, สถานที่, สภาพอากาศ) มาประกอบการด่า และมีช่องทางรับเงินโดเนทค่ากาแฟ

## ✨ Features

- 🎯 **ตัดสินใจแทนคุณ** - เลือกหมวดหมู่และให้ระบบสุ่มตัวเลือกให้
- 🤖 **AI กวนประสาท** - ทุกคำตอบมาพร้อมคำด่าแบบขำๆ
- 🌦️ **Context-Aware** - ตรวจสอบเวลา, วัน, และสภาพอากาศก่อนตอบ
- 🔒 **Anti-Spam** - ล็อกหลังกดสุ่มเกิน 5 ครั้ง (ต้องโดเนทเพื่อปลดล็อก)
- ☕ **Donation System** - รองรับ QR Code PromptPay และ Buy Me a Coffee
- 🔐 **Admin Dashboard** - จัดการหมวดหมู่และตัวเลือกผ่านหน้า Admin
- 🎨 **Neo-Brutalism Design** - UI สไตล์ทันสมัยด้วย Tailwind CSS
- ⚡ **Real-time Updates** - อัพเดทข้อมูลแบบ Real-time ผ่าน Supabase

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS (Neo-brutalism style)
- **Animation**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Routing**: React Router v6
- **State Management**: React Hooks
- **API**: OpenWeatherMap API (สำหรับเช็คสภาพอากาศ)

## 📁 โครงสร้างโปรเจกต์

```
Decider/
├── src/
│   ├── components/          # React Components
│   │   ├── CategoryCard.jsx
│   │   ├── DecisionResult.jsx
│   │   ├── DonationModal.jsx
│   │   └── RouteGuard.jsx
│   ├── pages/              # Pages
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   └── AdminPage.jsx
│   ├── hooks/              # Custom Hooks
│   │   ├── useAuth.js
│   │   ├── useDecision.js
│   │   └── useSupabaseData.js
│   ├── services/           # Services
│   │   ├── supabaseClient.js
│   │   ├── authService.js
│   │   └── dbService.js
│   ├── data/               # Data Files
│   │   └── categories.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── SPEC.md
├── SUPABASE_SETUP.md
└── README.md
```

## 🚀 การติดตั้ง

### 1. Clone โปรเจกต์

```bash
git clone <repository-url>
cd Decider
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` และเพิ่ม:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
```

### 4. ตั้งค่า Supabase Database

ดูคู่มือการตั้งค่าใน [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### 5. รันโปรเจกต์

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:5173`

## 🔐 การเข้าสู่ระบบ Admin

1. สร้าง Admin User ใน Supabase (ดูวิธีใน SUPABASE_SETUP.md)
2. เข้าสู่ระบบที่ `/login`
3. ใช้ Email และ Password ที่สร้างไว้
4. หลังเข้าสู่ระบบจะถูก redirect ไปที่ `/admin`

## 📊 Database Schema

### Tables

- **categories** - เก็บหมวดหมู่ต่างๆ
- **decisions_pool** - เก็บตัวเลือกและคำด่าสำหรับแต่ละหมวดหมู่
- **usage_logs** - เก็บ log การใช้งานเพื่อวิเคราะห์

### Row Level Security (RLS)

- **Public Access**: ทุกคนอ่านได้ (categories, decisions_pool)
- **Admin Only**: เฉพาะ Admin แก้ไข/ลบได้
- **Logging**: ทุกคนบันทึก log ได้, แต่อ่านได้เฉพาะ Admin

## 🎨 Design System

### Colors

- **Primary**: Purple (#8B5CF6)
- **Secondary**: Pink (#EC4899)
- **Accent**: Yellow (#FBBF24)
- **Success**: Green (#10B981)
- **Danger**: Red (#EF4444)

### Shadows (Neo-brutalism)

- `shadow-neo-sm`: 4px 4px 0px 0px rgba(0,0,0,1)
- `shadow-neo-md`: 6px 6px 0px 0px rgba(0,0,0,1)
- `shadow-neo-lg`: 8px 8px 0px 0px rgba(0,0,0,1)
- `shadow-neo-xl`: 12px 12px 0px 0px rgba(0,0,0,1)

## 🔒 Route Guards

- **PublicRoute**: สำหรับหน้า Login (redirect ถ้าล็อกอินแล้ว)
- **ProtectedRoute**: สำหรับหน้าที่ต้อง login
- **AdminRoute**: สำหรับหน้า Admin (ต้องมี role = admin)

## 📝 การใช้งาน

### สำหรับผู้ใช้ทั่วไป

1. เลือกหมวดหมู่ที่ต้องการ
2. กดปุ่ม "สุ่มเลย!"
3. ดูผลลัพธ์พร้อมคำด่า
4. สามารถสุ่มใหม่ได้ (จำกัด 5 ครั้ง)
5. หากต้องการสุ่มต่อ ให้โดเนทค่ากาแฟ

### สำหรับ Admin

1. Login ที่ `/login`
2. จัดการหมวดหมู่และตัวเลือกใน Dashboard
3. ดูสถิติการใช้งาน
4. เพิ่ม/แก้ไข/ลบข้อมูล

## 🤝 Contributing

1. Fork โปรเจกต์
2. สร้าง Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปที่ Branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

## 📄 License

MIT License - ดูรายละเอียดใน [LICENSE](LICENSE)

## 👨‍💻 Author

สร้างด้วย ❤️ และ ☕ โดย [Your Name]

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Framer Motion](https://www.framer.com/motion/) - Animation Library
- [OpenWeatherMap](https://openweathermap.org/) - Weather API

---

**หมายเหตุ**: โปรเจกต์นี้สร้างขึ้นเพื่อความบันเทิงและการเรียนรู้ อย่าเอาจริงกับคำด่านะครับ 😄
