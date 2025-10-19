// ========================================
// 📖 دليل استخدام السيرفر
// Server Usage Guide
// ========================================

# 🚀 تشغيل السيرفر

## ✅ المتطلبات:
- Node.js (الإصدار 14 أو أحدث)

## 📦 التثبيت:

```bash
# تثبيت Node.js (إذا لم يكن مثبتاً)
# قم بتحميله من: https://nodejs.org

# التحقق من التثبيت
node --version
npm --version
```

## ▶️ تشغيل السيرفر:

### طريقة 1: باستخدام npm
```bash
cd "d:\lمواقع ويب\رقة كامل\Raqqa\Cafe_stoke"
npm start
```

### طريقة 2: باستخدام node مباشرة
```bash
cd "d:\lمواقع ويب\رقة كامل\Raqqa\Cafe_stoke"
node server.js
```

## 🌐 الوصول للتطبيق:

بعد تشغيل السيرفر، افتح المتصفح وانتقل إلى:

```
http://localhost:3000
```

أو الصفحات المباشرة:
```
http://localhost:3000/index.html  (الصفحة الرئيسية)
http://localhost:3000/0541.html              (صفحة الإعدادات)
http://localhost:3000/Stock_In.html          (إدخال المخزون)
http://localhost:3000/Stock_Out.html         (إخراج المخزون)
```

## 📡 API Endpoints:

### 1️⃣ قراءة الإعدادات
```
GET /api/config
```

### 2️⃣ حفظ الإعدادات
```
POST /api/config
Content-Type: application/json

{
  "googleAppsScriptUrl": "https://script.google.com/...",
  "spreadsheetId": "abc123..."
}
```

### 3️⃣ حذف الإعدادات
```
DELETE /api/config
```

### 4️⃣ حالة السيرفر
```
GET /api/status
```

## 🔧 المميزات:

✅ **حفظ تلقائي**: يتم حفظ الإعدادات مباشرة في ملف config.json
✅ **CORS مفعّل**: يعمل مع جميع الصفحات
✅ **نسخة احتياطية**: حفظ تلقائي في localStorage
✅ **سهل الاستخدام**: واجهة بسيطة ومباشرة

## ⏹️ إيقاف السيرفر:

اضغط `Ctrl + C` في نافذة Terminal

## 🐛 حل المشاكل:

### المشكلة: "Port 3000 is already in use"
**الحل**: غيّر PORT في server.js إلى رقم آخر (مثل 3001)

### المشكلة: "Cannot find module"
**الحل**: تأكد من تشغيل الأمر من المجلد الصحيح

### المشكلة: "EACCES: permission denied"
**الحل**: شغّل Terminal كمسؤول (Run as Administrator)

## 📝 ملاحظات:

- السيرفر يعمل على localhost فقط
- لا تنسى تشغيل السيرفر قبل فتح التطبيق
- يمكنك استخدام السيرفر محلياً أو رفعه على Render/Heroku

## 🌍 نشر السيرفر (اختياري):

### على Render.com:
1. ارفع الملفات إلى GitHub
2. اذهب إلى render.com
3. أنشئ Web Service جديد
4. اربطه بـ GitHub repo
5. سيتم تشغيل server.js تلقائياً

### على Heroku:
```bash
# إنشاء ملف Procfile
echo "web: node server.js" > Procfile

# رفع إلى Heroku
git add .
git commit -m "Add server"
git push heroku main
```

## 📞 الدعم:

إذا واجهت أي مشكلة، تأكد من:
✅ تثبيت Node.js بشكل صحيح
✅ تشغيل الأمر من المجلد الصحيح
✅ عدم وجود برنامج آخر يستخدم Port 3000

========================================
تم إنشاء هذا الدليل بواسطة Cafe Stock Management System
========================================
