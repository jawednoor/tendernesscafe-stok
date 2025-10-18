// Service Worker لتطبيق Cafe Stock PWA
const CACHE_NAME = 'cafe-stock-v1.0.0';
const urlsToCache = [
  '/',
  '/index_Cafe_stoke.html',
  '/styles.css',
  '/img/logo_white.jpg',
  '/Stock_In.html',
  '/Stock_Out.html',
  '/0541.html',
  '/manifest.json'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  console.log('🔧 تثبيت Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 تخزين الملفات في الذاكرة المؤقتة...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ تم تثبيت Service Worker بنجاح');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ خطأ في تثبيت Service Worker:', error);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 تفعيل Service Worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ حذف الإصدار القديم من الذاكرة المؤقتة:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ تم تفعيل Service Worker بنجاح');
      return self.clients.claim();
    })
  );
});

// تحسين إدارة الكاش باستخدام استراتيجية stale-while-revalidate
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (!event.request.url.includes('script.google.com') &&
            !event.request.url.includes('fonts.googleapis.com')) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    }).catch(error => {
      console.error('❌ خطأ في اعتراض الطلب:', error);
      if (event.request.destination === 'document') {
        return new Response(`
          <!DOCTYPE html>
          <html lang="ar" dir="rtl">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>لا يوجد اتصال</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #1a7f8b; color: white; }
              h1 { color: #20B2AA; }
            </style>
          </head>
          <body>
            <h1>🚫 لا يوجد اتصال بالإنترنت</h1>
            <p>تحقق من اتصالك بالإنترنت وحاول مرة أخرى</p>
            <button onclick="location.reload()">🔄 إعادة المحاولة</button>
          </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' }
        });
      }
    })
  );
});

// معالجة الرسائل من التطبيق الرئيسي
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // إضافة معالجة للرسائل الأخرى
  if (event.data && event.data.type === 'CHECK_FOR_UPDATES') {
    // الرد على الرسالة
    event.ports[0].postMessage({ status: 'UPDATE_CHECK_INITIATED' });

    // تنفيذ عملية التحقق من التحديثات
    caches.keys().then(cacheNames => {
      const updatesAvailable = cacheNames.includes(CACHE_NAME);
      event.ports[0].postMessage({ status: updatesAvailable ? 'UPDATES_AVAILABLE' : 'NO_UPDATES' });
    }).catch(error => {
      console.error('❌ خطأ أثناء التحقق من التحديثات:', error);
      event.ports[0].postMessage({ status: 'ERROR', error: error.message });
    });
  }
});