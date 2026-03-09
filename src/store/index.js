// src/store/index.js
import { createStore } from "vuex";
import userData from "./modules/userData"; 
import { sidebarConfig } from "@/constants/sidebarLinks"; // تأكد من صحة المسار

export default createStore({
  state: {
    // تأكد أنك وضعت المصفوفة هنا بهذا الاسم
    allLinks: sidebarConfig || [] 
  },
  getters: {
    userSidebarLinks: (state, getters, rootState) => {
      // 1. استخراج الـ role_id من الموديول
      const user = rootState.userData.currentUser;
      const userRoleId = user && user.role_id ? String(user.role_id).trim() : null;

      // 2. التحقق من أن المصفوفة موجودة لتجنب الخطأ (الـ Filter يسبب الخطأ هنا)
      if (!state.allLinks) {
        console.error("خطأ: مصفوفة allLinks غير معرفة في الـ state");
        return [];
      }

      // 3. إذا لم يوجد مستخدم بعد، أظهر الروابط المتاحة للجميع فقط أو مصفوفة فارغة
      if (!userRoleId) {
        // لتجنب الخطأ عند بداية التشغيل، نفلتر فقط الروابط التي لا تتطلب دوراً محدداً 
        // أو ببساطة نرجع مصفوفة فارغة حتى يتم تحميل المستخدم
        return []; 
      }

      // 4. تنفيذ الفلترة بأمان
      return state.allLinks.filter(link => {
        return link.roles && link.roles.includes(userRoleId);
      });
    }
  },
  modules: {
    userData,
  },
});