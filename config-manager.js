// مدير الإعدادات - Config Manager
// يدير حفظ وتحميل الإعدادات من ملف config.json و localStorage

const ConfigManager = {
    // المسار إلى ملف الإعدادات
    configFile: 'config.json',
    
    // تحميل الإعدادات من localStorage أو الملف
    async loadConfig() {
        try {
            // المحاولة 1: تحميل من السيرفر /api/config (الأولوية)
            try {
                const response = await fetch('http://localhost:5500/api/config');
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        console.log('✅ تم تحميل الإعدادات من السيرفر /api/config');
                        // حفظ في localStorage للوصول السريع
                        this.saveToLocalStorage(result.data);
                        return result.data;
                    }
                }
            } catch (serverError) {
                console.warn('⚠️ السيرفر غير متصل، محاولة التحميل من localStorage');
            }

            // المحاولة 2: تحميل من localStorage (fallback)
            const localConfig = this.loadFromLocalStorage();
            if (localConfig && localConfig.googleAppsScriptUrl) {
                console.log('✅ تم تحميل الإعدادات من localStorage');
                return localConfig;
            }

            // المحاولة 3: تحميل من ملف config.json مباشرة (fallback)
            const response = await fetch(this.configFile);
            if (response.ok) {
                const fileConfig = await response.json();
                console.log('✅ تم تحميل الإعدادات من config.json');
                
                // حفظ في localStorage للوصول السريع
                if (fileConfig.googleAppsScriptUrl) {
                    this.saveToLocalStorage(fileConfig);
                }
                
                return fileConfig;
            }

            // إذا فشل كل شيء، إرجاع إعدادات فارغة
            console.warn('⚠️ لم يتم العثور على إعدادات محفوظة');
            return this.getDefaultConfig();

        } catch (error) {
            console.error('❌ خطأ في تحميل الإعدادات:', error);
            return this.loadFromLocalStorage() || this.getDefaultConfig();
        }
    },

    // حفظ الإعدادات في localStorage
    saveToLocalStorage(config) {
        try {
            localStorage.setItem('cafeStockConfig', JSON.stringify(config));
            localStorage.setItem('googleAppsScriptUrl', config.googleAppsScriptUrl || '');
            localStorage.setItem('spreadsheetId', config.spreadsheetId || '');
            console.log('✅ تم حفظ الإعدادات في localStorage');
            return true;
        } catch (error) {
            console.error('❌ خطأ في حفظ الإعدادات في localStorage:', error);
            return false;
        }
    },

    // تحميل الإعدادات من localStorage
    loadFromLocalStorage() {
        try {
            const configStr = localStorage.getItem('cafeStockConfig');
            if (configStr) {
                return JSON.parse(configStr);
            }

            // محاولة تحميل الإعدادات القديمة
            const url = localStorage.getItem('googleAppsScriptUrl');
            const id = localStorage.getItem('spreadsheetId');
            
            if (url || id) {
                return {
                    googleAppsScriptUrl: url || '',
                    spreadsheetId: id || '',
                    lastUpdated: new Date().toISOString(),
                    version: '1.0.0'
                };
            }

            return null;
        } catch (error) {
            console.error('❌ خطأ في قراءة localStorage:', error);
            return null;
        }
    },

    // حفظ الإعدادات (localStorage + إنشاء رابط تنزيل للملف)
    async saveConfig(config) {
        try {
            // إضافة تاريخ التحديث
            config.lastUpdated = new Date().toISOString();
            config.version = '1.0.0';

            // حفظ في localStorage
            this.saveToLocalStorage(config);

            // إنشاء محتوى الملف
            const configContent = JSON.stringify(config, null, 2);
            
            console.log('✅ تم حفظ الإعدادات في localStorage بنجاح');
            
            return {
                success: true,
                config: config,
                downloadContent: configContent,
                needsUpdate: true  // يشير إلى أن الملف يحتاج تحديث
            };

        } catch (error) {
            console.error('❌ خطأ في حفظ الإعدادات:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // تحديث وتنزيل config.json تلقائياً
    async updateAndDownloadConfig(config, autoDownload = false) {
        try {
            // إضافة تاريخ التحديث
            config.lastUpdated = new Date().toISOString();
            config.version = '1.0.0';

            // حفظ في localStorage
            this.saveToLocalStorage(config);

            // إنشاء محتوى الملف
            const configContent = JSON.stringify(config, null, 2);
            
            // تنزيل تلقائي إذا مطلوب
            if (autoDownload) {
                this.downloadConfig(config);
            }

            console.log('✅ تم تحديث الإعدادات بنجاح');
            
            return {
                success: true,
                config: config,
                downloadContent: configContent,
                message: autoDownload ? 'تم التحديث والتنزيل تلقائياً' : 'تم التحديث بنجاح'
            };

        } catch (error) {
            console.error('❌ خطأ في تحديث الإعدادات:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // تنزيل ملف config.json
    downloadConfig(config) {
        try {
            const configContent = JSON.stringify(config, null, 2);
            const blob = new Blob([configContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'config.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            console.log('✅ تم تنزيل ملف config.json');
            return true;
        } catch (error) {
            console.error('❌ خطأ في تنزيل الملف:', error);
            return false;
        }
    },

    // الحصول على الإعدادات الافتراضية
    getDefaultConfig() {
        return {
            googleAppsScriptUrl: '',
            spreadsheetId: '',
            lastUpdated: '',
            version: '1.0.0'
        };
    },

    // مسح جميع الإعدادات
    clearConfig() {
        try {
            localStorage.removeItem('cafeStockConfig');
            localStorage.removeItem('googleAppsScriptUrl');
            localStorage.removeItem('spreadsheetId');
            console.log('✅ تم مسح جميع الإعدادات');
            return true;
        } catch (error) {
            console.error('❌ خطأ في مسح الإعدادات:', error);
            return false;
        }
    },

    // التحقق من صحة الإعدادات
    validateConfig(config) {
        const errors = [];

        if (!config.googleAppsScriptUrl || config.googleAppsScriptUrl.trim() === '') {
            errors.push('رابط Google Apps Script مطلوب');
        } else if (!this.isValidUrl(config.googleAppsScriptUrl)) {
            errors.push('رابط Google Apps Script غير صحيح');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    // التحقق من صحة الرابط
    isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname === 'script.google.com' || 
                   urlObj.hostname === 'script.googleusercontent.com';
        } catch {
            return false;
        }
    }
};

// تصدير للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
}
