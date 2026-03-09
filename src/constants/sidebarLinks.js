// src/constants/sidebarLinks.js

export const sidebarConfig = [
  // ==========================================
  // 1. روابط السوبر أدمن (SuperAdmin - Role 0)
  // ==========================================
  {
    title: "لوحة التحكم المركزية",
    path: "/dashboard/super",
    icon: ['fas', 'gauge-high'],
    roles: ["0"]
  },
  {
    title: "إدارة مديريات التربية",
    path: "/dashboard/super/willayas",
    icon: ['fas', 'map-location-dot'],
    roles: ["0"]
  },
   {
    title: "إعداد الموسم الدراسي",
    path: "/dashboard/super/academic-setting",
    icon: ['fas', 'calendar-check'],
    roles: ["0"]
  },
  {
    title: "إدارة رؤساء المصالح",
    path: "/dashboard/super/chef-service",
    icon: ['fas', 'user-tie'],
    roles: ["0"]
  },
  {
    title: "الإعدادات العامة",
    path: "/dashboard/super/settings",
    icon: ['fas', 'gears'],
    roles: ["0"]
  },

  // ==========================================
  // 2. روابط رئيس المصلحة (Chief - Role 1)
  // ==========================================
  {
    title: "الرئيسية",
    path: "/dashboard/chief", 
    icon: ['fas', 'house-chimney-window'],
    roles: ["1"]
  },
 
  {
    title: "ملفات المفتشين",
    path: "/dashboard/chief/Inspector-Files",
    icon: ['fas', 'user-tie'],
    roles: ["1"]
  },
  {
    title: "قوائم الدوائر و البلديات",
    path: "/dashboard/chief/dairas-communes-files",
    icon: ['fas', 'landmark'],
    roles: ["1"]
  },
  {
    title: "المقاطعات البيداغوجية",
    path: "/dashboard/chief/pedagogical-districts",
    icon: ['fas', 'map-location-dot'],
    roles: ["1"]
  },
  {
    title: "حركة تنقلات المفتشين",
    path: "/dashboard/chief/Inspector-Mouvement",
    icon: ['fas', 'route'],
    roles: ["1"]
  },

  // ==========================================
  // 3. روابط المفتش (Inspector - Role 2)
  // ==========================================
  {
    title: "الرئيسية",
    path: "/dashboard/inspector",
    icon: ['fas', 'house-chimney-window'],
    roles: ["2"]
  },
  {
    title: "زيارات تربوية",
    path: "/educational-visits",
    icon: ['fas', 'chalkboard-user'],
    roles: ["2"]
  },
  {
    title: "عمليات تكوينية",
    path: "/training-operations",
    icon: ['fas', 'graduation-cap'],
    roles: ["2"]
  },
  {
    title: "عمليات التثبيت",
    path: "/confirmation-process",
    icon: ['fas', 'certificate'],
    roles: ["2"]
  },
  {
    title: "زيارة مؤسسة",
    path: "/school-visit",
    icon: ['fas', 'school'],
    roles: ["2"]
  },
  {
    title: "التنظيم التربوي",
    path: "/educational-organization",
    icon: ['fas', 'sitemap'],
    roles: ["2"]
  },

  // ==========================================
  // 4. روابط المدير (Manager - Role 3)
  // ==========================================
  {
    title: "الرئيسية",
    path: "/dashboard/manager",
    icon: ['fas', 'house-chimney-window'],
    roles: ["3"]
  },
  {
    title: "ملفات الأساتذة",
    path: "/teachers-files",
    icon: ['fas', 'users-rectangle'],
    roles: ["3"]
  },
  {
    title: "إسناد الأفواج التربوية",
    path: "/class-assignments",
    icon: ['fas', 'people-group'],
    roles: ["3"]
  },
  {
    title: "الترقيات والدرجات",
    path: "/promotions",
    icon: ['fas', 'arrow-up-right-dots'],
    roles: ["3"]
  },
  {
    title: "إحصائيات عامة",
    path: "/general-statistics",
    icon: ['fas', 'chart-line'],
    roles: ["3"]
  }
];