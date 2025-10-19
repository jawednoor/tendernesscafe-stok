# ⚡ دليل التسليم السريع - نظام مخزون الكافيه
## Quick Handover Guide

---

## 📦 الملفات المطلوب تسليمها:

✅ مجلد `Cafe_stoke` كامل بجميع الملفات
✅ ملف `INSTALLATION_GUIDE.md` (الدليل الكامل)
✅ ملف `README.md` (نظرة عامة)

---

## 🎯 خطوات سريعة للشخص الجديد:

### 1️⃣ إنشاء Google Sheets:
```
- افتح sheets.google.com
- جدول جديد
- أنشئ 3 شيتات: Projects, Products, Settings
```

### 2️⃣ نسخ معرف الجدول:
```
- من رابط الجدول
- الجزء بين /d/ و /edit
- مثال: 1Ex80V03d6_UDSw35FWToCzfdGuWKPiVxjL76YprklTw
```

### 3️⃣ إعداد Apps Script:
```
- Extensions → Apps Script
- انسخ google-apps-script.js
- عدّل SPREADSHEET_ID (سطر 10 و 100)
- احفظ
```

### 4️⃣ النشر:
```
- Deploy → New deployment
- Web app
- Execute as: Me
- Who has access: Anyone
- Deploy
- انسخ الرابط
```

### 5️⃣ ربط النظام:
```
- افتح 0541.html
- الصق الرابط
- احفظ
- اختبر الاتصال
```

### 6️⃣ البدء:
```
- افتح index_Cafe_stoke.html
- استمتع! 🎉
```

---

## ⚠️ نقاط حرجة - لا تنساها!

❗ تعديل `SPREADSHEET_ID` في **موضعين**:
   - السطر 10 تقريباً (في دالة doGet)
   - السطر 100 تقريباً (في دالة doPost)

❗ الرابط يجب أن ينتهي بـ `/exec` **وليس** `/dev`

❗ أسماء الشيتات يجب أن تكون **بالضبط**:
   - `Projects` (مع s)
   - `Products` (مع s)
   - `Settings` (مع s)

❗ Deploy يجب أن يكون:
   - Execute as: **Me** (ليس User accessing the app)
   - Who has access: **Anyone**

---

## 🔍 التحقق السريع:

✅ هل الشيتات موجودة بالأسماء الصحيحة؟
✅ هل تم تعديل SPREADSHEET_ID في الموضعين؟
✅ هل الرابط ينتهي بـ /exec؟
✅ هل تم اختيار Execute as: Me؟
✅ هل تم اختيار Who has access: Anyone؟
✅ هل تم حفظ الرابط في 0541.html؟
✅ هل اختبار الاتصال ناجح؟

---

## 🆘 حل المشاكل الشائعة:

### المشكلة: "Sheet not found"
**الحل:** تحقق من أسماء الشيتات (مع s في النهاية)

### المشكلة: "Permission denied"
**الحل:** تأكد من Execute as: Me

### المشكلة: "فشل الاتصال"
**الحل:** 
1. تحقق من الرابط (ينتهي بـ /exec)
2. اعمل New deployment جديد

### المشكلة: "SPREADSHEET_ID غير صحيح"
**الحل:** تأكد من نسخه من رابط الجدول بشكل صحيح

---

## 📞 للدعم الكامل:

👉 راجع ملف **INSTALLATION_GUIDE.md** للشرح التفصيلي مع الخطوات

---

**نصيحة ذهبية:** 
اطبع هذه الصفحة وأعطها للشخص الجديد مع ملف INSTALLATION_GUIDE.md

✨ وفقك الله!
