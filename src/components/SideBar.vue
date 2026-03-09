<template>
  <aside class="side_bar" :class="[{ 'is-collapsed': isCollapsed }, roleThemeClass]">
    <div class="toggle-container" @click="toggleSidebar">
      <font-awesome-icon :icon="['fas', 'bars']" class="icon-gradient" />
    </div>

    <div class="logo">
      <img src="@/assets/images/logo-2.png" alt="LOGO">
    </div>

    <h4 class="title">تسيير المقاطعات البيداغوجية</h4>

    <div class="nav">
      <ul class="sidebar-nav">
        <li v-for="link in filteredLinks" :key="link.title" class="nav-item">
          <router-link 
            :to="link.path" 
            class="nav-link" 
            active-class="active-route"
            exact-active-class="active-route"
            :title="isCollapsed ? link.title : ''"
          >
            <font-awesome-icon :icon="link.icon" class="icon" />
            <span class="text">{{ link.title }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script>
import "@/assets/main.css";
import { mapGetters } from 'vuex';

export default {
  name: "SideBar",
  data() {
    return {
      isCollapsed: false,
    };
  },
  computed: {
    ...mapGetters({
      filteredLinks: 'userSidebarLinks'
    }),
    roleThemeClass() {
      const user = this.$store.state.userData.currentUser;
      const roleId = user ? String(user.role_id) : null;

      if (roleId === "0") return 'role-super'; // إضافة كلاس السوبر أدمن
      if (roleId === "1") return 'role-chief';
      if (roleId === "2") return 'role-inspector';
      if (roleId === "3") return 'role-manager';
      return '';
    }
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
      // ✅ إرسال إشارة للملف الأب (Layout) ليقوم بتمديد الهيدر والمحتوى
      this.$emit('toggle-sidebar', this.isCollapsed);
    }
  }
};
</script>

<style scoped>
/* --- المتغيرات والانتقالات --- */
.side_bar {
  --transition-smooth: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  --pulse-color: rgba(182, 233, 235, 0.4);
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  /* ❌ تم حذف border-left بناءً على طلبك */
  border-left: none !important; 
  padding-top: 40px;
  background: #2c3e50;
  transition: var(--transition-smooth);
  overflow: hidden;
  z-index: 100;
  width: 260px;
  direction: rtl;
}

/* --- ألوان الثيمات المتدرجة (تم تقويتها لتظهر أكثر) --- */

/* 1. ثيم السوبر أدمن - أزرق احترافي مريح وواضح */
.side_bar.role-super {
  background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
  --pulse-color: rgba(52, 152, 219, 0.3);
}
.side_bar.role-super .title, .side_bar.role-super .nav-link {
  color: #2c3e50;
}
.side_bar.role-super .icon-gradient {
  color: #3498db;
}

/* 2. ثيم رئيس المصلحة */
.side_bar.role-chief {
  background: linear-gradient(180deg, #1e3c72 0%, #2a5298 100%);
  --pulse-color: rgba(52, 152, 219, 0.5);
}

/* 3. ثيم المفتش */
.side_bar.role-inspector {
  background: linear-gradient(180deg, #134e5e 0%, #2a5843 100%);
  --pulse-color: rgba(46, 204, 113, 0.5);
}

/* 4. ثيم المدير */
.side_bar.role-manager {
  background: linear-gradient(180deg, #8e2de2 0%, #4a00e0 100%);
  --pulse-color: rgba(142, 45, 226, 0.5);
}

/* --- زر التبديل (Toggle) --- */
.toggle-container {
  position: absolute;
  top: 15px;
  left: 15px;
  cursor: pointer;
  z-index: 10;
  transition: var(--transition-smooth);
}

.side_bar.is-collapsed .toggle-container {
  top: 20px;
  left: 30px;
  transform: scale(1.1) rotate(180deg); /* أضفنا دوران بسيط */
}

.icon-gradient {
  font-size: 20px;
  color: #b6e9eb;
  transition: 0.3s;
}

/* --- الشعار --- */
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 15px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: var(--transition-smooth);
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.logo img {
  width: 80%;
  height: auto;
  object-fit: contain;
  transition: var(--transition-smooth);
}

/* --- العنوان --- */
.title {
  text-align: center;
  margin: 0 15px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 12px;
}

/* --- القائمة والروابط --- */
.sidebar-nav {
  list-style: none;
  padding: 20px 10px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: 0.3s;
  position: relative;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  transform: translateX(-5px);
}

.nav-link .icon {
  width: 25px;
  font-size: 18px;
  margin-left: 12px;
}

/* --- حالة الرابط النشط --- */
.active-route {
  background: #3498db !important; /* لون موحد واضح للنشاط */
  color: #ffffff !important;
  font-weight: bold !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.active-route .icon {
  color: #ffffff !important;
}

.active-route::after {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 8px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 var(--pulse-color); }
  70% { box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
}

/* --- حالة الطي (Collapsed) --- */
.side_bar.is-collapsed {
  width: 80px;
}

.side_bar.is-collapsed .logo {
  width: 45px;
  height: 45px;
  margin-top: 20px;
}

.side_bar.is-collapsed .title,
.side_bar.is-collapsed .text {
  display: none;
}

.side_bar.is-collapsed .nav-link {
  justify-content: center;
  padding: 12px 0;
}

.side_bar.is-collapsed .nav-link .icon {
  margin-left: 0;
}
</style>