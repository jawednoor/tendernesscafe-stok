// ========================================
// 🚀 Server للكافيه - Cafe Stock Management
// ========================================
// يستقبل الطلبات من صفحات HTML ويحفظ/يقرأ ملف config.json

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const zlib = require('zlib');

// ========================================
// ⚙️ الإعدادات
// ========================================
const PORT = 5500;
const CONFIG_FILE = path.join(__dirname, 'config.json');

// تخزين مؤقت للإعدادات
let cachedConfig = null;

// ========================================
// 📝 قراءة ملف config.json
// ========================================
function readConfig() {
    if (cachedConfig) {
        return cachedConfig;
    }
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf8');
            cachedConfig = JSON.parse(data);
            return cachedConfig;
        }
        // إرجاع إعدادات افتراضية إذا لم يوجد الملف
        return {
            googleAppsScriptUrl: '',
            spreadsheetId: '',
            lastUpdated: '',
            version: '1.0.0'
        };
    } catch (error) {
        console.error('❌ خطأ في قراءة config.json:', error);
        return null;
    }
}

// ========================================
// 💾 كتابة ملف config.json
// ========================================
function writeConfig(config) {
    try {
        // إضافة تاريخ التحديث
        config.lastUpdated = new Date().toISOString();
        config.version = '1.0.0';

        // كتابة الملف
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
        cachedConfig = config; // تحديث التخزين المؤقت
        console.log('✅ تم حفظ config.json بنجاح');
        return true;
    } catch (error) {
        console.error('❌ خطأ في كتابة config.json:', error);
        return false;
    }
}

// ========================================
// 🌐 تحديد نوع المحتوى (MIME Type)
// ========================================
function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.txt': 'text/plain'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

// ========================================
// 📄 تقديم الملفات الثابتة
// ========================================
function serveStaticFile(res, filePath) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('❌ الملف غير موجود');
            return;
        }

        const contentType = getContentType(filePath);
        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Encoding': 'gzip',
            'Access-Control-Allow-Origin': '*'
        });
        const compressedData = zlib.gzipSync(data);
        res.end(compressedData);
    });
}

// ========================================
// 🔧 معالج الطلبات الرئيسي
// ========================================
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // ========================================
    // 📌 CORS Headers
    // ========================================
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`📥 ${method} ${pathname}`);

    // ========================================
    // 🔗 API Endpoints
    // ========================================
    
    // 🆕 GET /api/proxy-users - Proxy لجلب أكواد الموظفين من Google Apps Script
    if (pathname === '/api/proxy-users' && method === 'GET') {
        const config = readConfig();
        const scriptUrl = config && config.googleAppsScriptUrl;
        if (!scriptUrl) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Google Apps Script URL غير موجود في الإعدادات' }));
            return;
        }
        const targetUrl = scriptUrl + '?type=users';
        const https = require('https');
        
        // دالة للتعامل مع redirects
        const makeRequest = (urlString, maxRedirects = 5) => {
            if (maxRedirects === 0) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Too many redirects' }));
                return;
            }
            
            https.get(urlString, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (apiRes) => {
                // التعامل مع redirect
                if (apiRes.statusCode >= 300 && apiRes.statusCode < 400 && apiRes.headers.location) {
                    console.log('🔄 Redirect to:', apiRes.headers.location);
                    makeRequest(apiRes.headers.location, maxRedirects - 1);
                    return;
                }
                
                let data = '';
                apiRes.on('data', chunk => data += chunk);
                apiRes.on('end', () => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                });
            }).on('error', (e) => {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: e.message }));
            });
        };
        
        makeRequest(targetUrl);
        return;
    }
    
    // 🆕 GET /api/proxy-user-info - Proxy لجلب معلومات موظف محدد
    if (pathname === '/api/proxy-user-info' && method === 'GET') {
        const config = readConfig();
        const scriptUrl = config && config.googleAppsScriptUrl;
        const userCode = parsedUrl.query.code;
        
        if (!scriptUrl) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Google Apps Script URL غير موجود في الإعدادات' }));
            return;
        }
        
        if (!userCode) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'كود الموظف مطلوب' }));
            return;
        }
        
        const targetUrl = scriptUrl + '?type=userInfo&code=' + encodeURIComponent(userCode);
        const https = require('https');
        
        // دالة للتعامل مع redirects
        const makeRequest = (urlString, maxRedirects = 5) => {
            if (maxRedirects === 0) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Too many redirects' }));
                return;
            }
            
            https.get(urlString, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (apiRes) => {
                // التعامل مع redirect
                if (apiRes.statusCode >= 300 && apiRes.statusCode < 400 && apiRes.headers.location) {
                    console.log('🔄 Redirect to:', apiRes.headers.location);
                    makeRequest(apiRes.headers.location, maxRedirects - 1);
                    return;
                }
                
                let data = '';
                apiRes.on('data', chunk => data += chunk);
                apiRes.on('end', () => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                });
            }).on('error', (e) => {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: e.message }));
            });
        };
        
        makeRequest(targetUrl);
        return;
    }

    // 5️⃣ GET /api/check-script-url - تحقق من وجود وصحة رابط Google Apps Script
    if (pathname === '/api/check-script-url' && method === 'GET') {
        const config = readConfig();
        const url = config && config.googleAppsScriptUrl;
        // تحقق من وجود الرابط وصحته
        if (url && typeof url === 'string' && url.startsWith('https://script.google.com/macros/s/')) {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, url }));
        } else {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: 'رابط Google Apps Script غير موجود أو غير صحيح' }));
        }
        return;
    }
    // ========================================

    // 1️⃣ GET /api/config - قراءة الإعدادات
    if (pathname === '/api/config' && method === 'GET') {
        const config = readConfig();
        if (config) {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: true, data: config }));
        } else {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ success: false, error: 'فشل في قراءة الإعدادات' }));
        }
        return;
    }

    // 2️⃣ POST /api/config - حفظ الإعدادات
    if (pathname === '/api/config' && method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const config = JSON.parse(body);
                
                // التحقق من البيانات
                if (!config.googleAppsScriptUrl) {
                    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        error: 'رابط Google Apps Script مطلوب' 
                    }));
                    return;
                }

                // حفظ الإعدادات
                const success = writeConfig(config);
                
                if (success) {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ 
                        success: true, 
                        message: 'تم حفظ الإعدادات بنجاح',
                        data: config
                    }));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        error: 'فشل في حفظ الإعدادات' 
                    }));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: 'بيانات JSON غير صحيحة: ' + error.message 
                }));
            }
        });
        return;
    }

    // 3️⃣ DELETE /api/config - حذف الإعدادات
    if (pathname === '/api/config' && method === 'DELETE') {
        const defaultConfig = {
            googleAppsScriptUrl: '',
            spreadsheetId: '',
            lastUpdated: new Date().toISOString(),
            version: '1.0.0'
        };
        
        const success = writeConfig(defaultConfig);
        
        if (success) {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ 
                success: true, 
                message: 'تم حذف الإعدادات بنجاح' 
            }));
        } else {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ 
                success: false, 
                error: 'فشل في حذف الإعدادات' 
            }));
        }
        return;
    }

    // 4️⃣ GET /api/status - حالة السيرفر
    if (pathname === '/api/status' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ 
            success: true, 
            status: 'running',
            message: 'السيرفر يعمل بشكل صحيح ✅',
            timestamp: new Date().toISOString()
        }));
        return;
    }

    // ========================================
    // 📄 تقديم الملفات الثابتة
    // ========================================
    
    // الصفحة الرئيسية
    if (pathname === '/' || pathname === '/index.html') {
        serveStaticFile(res, path.join(__dirname, 'index.html'));
        return;
    }
    
    // الصفحة الرئيسية للنظام (بعد تسجيل الدخول)
    if (pathname === '/home.html') {
        serveStaticFile(res, path.join(__dirname, 'home.html'));
        return;
    }

    // الملفات الأخرى
    const filePath = path.join(__dirname, pathname);
    
    // التحقق من وجود الملف
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html lang="ar" dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <title>404 - الصفحة غير موجودة</title>
                    <style>
                        body { 
                            font-family: 'Cairo', sans-serif; 
                            text-align: center; 
                            padding: 50px;
                            background: #f0f8ff;
                        }
                        h1 { color: #dc3545; font-size: 72px; margin: 0; }
                        p { color: #666; font-size: 24px; }
                        a { color: #20B2AA; text-decoration: none; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>404</h1>
                    <p>❌ الصفحة غير موجودة</p>
                    <a href="/">🏠 العودة للرئيسية</a>
                </body>
                </html>
            `);
            return;
        }
        
        serveStaticFile(res, filePath);
    });
});

// ========================================
// 🚀 تشغيل السيرفر
// ========================================
server.listen(PORT, () => {
    console.log('');
    console.log('========================================');
    console.log('🚀 Cafe Stock Management Server');
    console.log('========================================');
    console.log(`✅ السيرفر يعمل على: http://localhost:${PORT}`);
    console.log(`📂 المجلد: ${__dirname}`);
    console.log(`📝 ملف الإعدادات: ${CONFIG_FILE}`);
    console.log('');
    console.log('📌 API Endpoints:');
    console.log(`   GET    /api/config          - قراءة الإعدادات`);
    console.log(`   POST   /api/config          - حفظ الإعدادات`);
    console.log(`   DELETE /api/config          - حذف الإعدادات`);
    console.log(`   GET    /api/status          - حالة السيرفر`);
    console.log('');
    console.log('📄 الصفحات:');
    console.log(`   http://localhost:${PORT}/                - صفحة تسجيل الدخول`);
    console.log(`   http://localhost:${PORT}/home.html       - الصفحة الرئيسية`);
    console.log(`   http://localhost:${PORT}/0541.html       - الإعدادات`);
    console.log(`   http://localhost:${PORT}/Stock_In.html   - توريد المخزون`);
    console.log(`   http://localhost:${PORT}/Stock_Out.html  - تصدير المخزون`);
    console.log('');
    console.log('⏹️  اضغط Ctrl+C لإيقاف السيرفر');
    console.log('========================================');
    console.log('');
});

// ========================================
// 🛑 معالج الإغلاق
// ========================================
process.on('SIGINT', () => {
    console.log('\n\n🛑 إيقاف السيرفر...');
    server.close(() => {
        console.log('✅ تم إيقاف السيرفر بنجاح');
        process.exit(0);
    });
});
