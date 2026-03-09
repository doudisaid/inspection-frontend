import { createRouter, createWebHistory } from "vue-router";

// Views
import ResetPassword from "@/views/ResetPassword.vue";
import HomeView from "@/views/HomeView.vue";
import HeadService from "@/views/HeadService/HeadService.vue";
import AcademicSetting from '@/views/SuperAdmin/AcademicSetting.vue';
import InspectorMouve from "@/views/HeadService/InspectorMouve.vue";
import DirectorView from "@/views/DirectorView/DirectorView.vue";
import ChangePassword from "@/views/ChangePassword.vue";
import NotAuthorized from "@/views/NotAuthorized.vue";
import LoginPage from "@/components/homePage/LoginPage.vue";
import InspectorView from "@/views/HeadService/InspectorView.vue";
import SecteurView from "@/views/HeadService/SecteurView.vue";
import DairasCommunes from "@/views/HeadService/DairasCommunes.vue";
import inspectorPage from "@/views/InspectorView/inspectorPage.vue";
import SuperAdminLayout from "@/views/SuperAdmin/SuperAdminLayout.vue";

//  استيراد واجهات السوبر أدمن (تأكد من وجود هذه الملفات أو تغيير المسميات)
import WillayaComp from "@/components/superAdmin/willayaComp.vue";
import chefServiceComp from "@/components/superAdmin/chefServiceComp.vue";

const routes = [
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: ResetPassword
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
  },
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },

  // ✅ --- مسار السوبر أدمن (رتبة 0) ---
  {
    path: "/dashboard/super",
    component: SuperAdminLayout,
    meta: { requiresAuth: true, allowedRoles: [0] },
    children: [
        {
        path: 'academic-setting',
        name: 'AcademicSetting',
        component: AcademicSetting
      },
       {
        path: "willayas", // الرابط سيكون: /dashboard/super/willayas
        name: "WilayaManagement",
        component: WillayaComp,
       },
      {
        path: "chef-service",
        name: "chefServiceComp",
        component: chefServiceComp,
      },
    ]
  },

  // --- مسار رئيس القسم (Chief - رتبة 1) ---
  {
    path: "/dashboard/chief",
    component: HeadService,
    meta: { requiresAuth: true, allowedRoles: [1] },
    children: [
      {
        path: "Inspector-Mouvement",
        name: "InspectorMouve",
        component: InspectorMouve,
      },
    
      {
        path: 'inspector-files',
        name: 'InspectorFiles',
        component: InspectorView
      },
      {
        path: 'pedagogical-districts',
        name: 'Secteur',
        component: SecteurView
      },
      {
        path: 'dairas-communes-files',
        name: 'DairasCommunes',
        component: DairasCommunes
      },
    ]
  },

  // --- مسار المفتش (Inspector - رتبة 2) ---
  {
    path: "/dashboard/inspector",
    name: "inspectorPage",
    component: inspectorPage,
    meta: { requiresAuth: true, allowedRoles: [2] },
  },

  // --- مسار مدير المدرسة (Manager - رتبة 3) ---
  {
    path: "/dashboard/manager",
    name: "DirectorView",
    component: DirectorView,
    meta: { requiresAuth: true, allowedRoles: [3] },
  },

  {
    path: "/not-authorized",
    name: "NotAuthorized",
    component: NotAuthorized,
  },
  {
    path: "/change-password",
    name: "ChangePassword",
    component: ChangePassword
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ===== Middleware (Navigation Guards) =====
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("authToken");
  const userStr = localStorage.getItem("user");

  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    localStorage.removeItem("user");
  }

  // منع الدخول للصفحة الرئيسية أو صفحة Login إذا كان مسجل الدخول وتوجيهه للوحة تحكمه
  if ((to.path === "/" || to.path === "/login") && token && user) {
    return next(getRedirectPath(Number(user.role_id)));
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth) {
    if (!token || !user) {
      return next("/login");
    }

    const allowedRoles = to.matched.flatMap(record => record.meta.allowedRoles || []);
    
    // التحقق من الصلاحيات
    if (allowedRoles.length > 0 && !allowedRoles.includes(Number(user.role_id))) {
      return next("/not-authorized");
    }
  }

  next();
});

// ✅ وظيفة التوجيه بناءً على الرتبة (تم إضافة حالة 0)
function getRedirectPath(roleId) {
  switch (roleId) {
    case 0: return "/dashboard/super";
    case 1: return "/dashboard/chief";
    case 2: return "/dashboard/inspector";
    case 3: return "/dashboard/manager";
    default: return "/";
  }
}

export default router;