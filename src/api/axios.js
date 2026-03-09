import axios from "axios";

const api = axios.create({
    // جلب الرابط من ملف البيئة .env
    baseURL: process.env.VUE_APP_BACKEND_URL || 'http://localhost:3000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

/**
 * Interceptor للطلبات الصادرة
 */
api.interceptors.request.use(
    (config) => {
        // جلب التوكن (الأفضل استخدام authToken بما أنه الاسم المعتمد لديك حالياً)
        const token = localStorage.getItem("authToken") || localStorage.getItem("token");
        
        if (token) {
            // تصحيح: في نسخ Axios الحديثة يفضل استخدام config.headers مباشرة
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Interceptor للاستجابات الواردة
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // معالجة الخطأ 401 (غير مصرح) أو 403 (في حال كان التوكن تالفاً)
        if (error.response && (error.response.status === 401)) {
            console.error("انتهت صلاحية الجلسة أو التوكن غير صالح");
            
            // تنظيف التخزين
            localStorage.removeItem("token");
            localStorage.removeItem("authToken");
            
            // توجيه المستخدم لصفحة الدخول إذا لم يكن فيها فعلياً
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;