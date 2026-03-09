<template>
  <div class="header-parent" :class="roleThemeClass">
    <div class="header-content">

      <div class="right-side">
        <div class="flag-container">
          <img src="@/assets/images/drapeau.gif" alt="Flag" />
        </div>
        
        <div class="wilaya-badge">
          <template v-if="roleId === '0'">
            الإدارة المركزية - Super Admin
          </template>
          <template v-else-if="wilayaName">
            مديرية التربية لولاية {{ wilayaName }}
          </template>
          <template v-else>
            جاري تحميل البيانات...
          </template>
        </div>
      </div>

      <div class="left-side">
        <div class="info-row">
          <div class="user-avatar">
            <font-awesome-icon :icon="['fas', 'user-shield']" v-if="roleId === '0'" />
            <font-awesome-icon :icon="['fas', 'user']" v-else />
          </div>
          
          <span class="user-name">{{ fullUserTitle }}</span>

          <div class="dropdown-menu">
            <ul class="menu-list">
              <li>
                <a href="#" class="menu-item">
                  <font-awesome-icon :icon="['fas', 'user-circle']" class="icon profile-icon" />
                  <span class="menu-text">ملفي الشخصي</span>
                </a>
              </li>
              <li>
                <router-link :to="{ name: 'ChangePassword' }" class="menu-item">
                  <font-awesome-icon :icon="['fas', 'key']" class="icon key-icon" />
                  <span class="menu-text">تغيير كلمة المرور</span>
                </router-link>
              </li>
              <li @click="logout" class="logout-item">
                <a href="javascript:void(0)" class="menu-item">
                  <font-awesome-icon :icon="['fas', 'right-from-bracket']" class="icon logout-icon" />
                  <span class="menu-text">تسجيل الخروج</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "HeaderPage",
  computed: {
    ...mapGetters("userData", ["chefName", "wilayaName"]),

    currentUser() {
      return this.$store.state.userData.currentUser;
    },

    roleId() {
      return this.currentUser ? String(this.currentUser.role_id) : null;
    },

    // المسمى الوظيفي الديناميكي
    fullUserTitle() {
      if (!this.currentUser) return "جاري التحميل...";
      
      const roleTitles = {
        "0": "السيد المشرف العام",
        "1": "السيد رئيس المصلحة",
        "2": "السيد المفتش",
        "3": "السيد المدير"
      };

      const title = roleTitles[this.roleId] || "السيد الموظف";
      const name = this.chefName || "مستخدم";
      
      return `${title} : ${name}`;
    },

    roleThemeClass() {
      const themes = {
        "0": 'theme-super',
        "1": 'theme-chief',
        "2": 'theme-inspector',
        "3": 'theme-manager'
      };
      return themes[this.roleId] || 'theme-default';
    }
  },

  watch: {
    currentUser: {
      immediate: true,
      handler(newUser) {
        if (newUser && newUser.role_id !== 0) {
          this.$store.dispatch("userData/updateCurrentWilaya");
        }
      }
    }
  },

  methods: {
    async logout() {
      await this.$store.dispatch("userData/logout");
      this.$router.replace("/login").then(() => {
        window.location.reload();
      });
    }
  }
};
</script>

<style scoped>
/* --- الهيكل الأساسي للهيدر --- */
.header-parent {
  width: 100%;
  padding: 10px 0;
  /* حذفنا الـ border لضمان التمدد السلس كما طلبت */
  border-bottom: none; 
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  direction: rtl;
  min-height: 65px;
  display: flex;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 25px;
  width: 100%;
}

/* --- ألوان الثيمات المتدرجة الواضحة (تم تقويتها) --- */
.theme-super { 
  background: linear-gradient(90deg, #e0eafc 0%, #cfdef3 100%); 
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.theme-super .wilaya-badge, .theme-super .user-name { color: #2c3e50 !important; }
.theme-super .user-avatar { background: #3498db !important; color: white; }

.theme-chief     { background: linear-gradient(90deg, #1a2a6c, #2a4858); }
.theme-inspector { background: linear-gradient(90deg, #134e5e, #71b280); }
.theme-manager   { background: linear-gradient(90deg, #4b1248, #f03d5f); }
.theme-default   { background-color: #2c3e50; }

/* --- الجهة اليمنى: العلم والولاية --- */
.right-side {
  display: flex;
  align-items: center;
  gap: 15px;
}

.flag-container {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.flag-container img { width: 100%; height: 100%; object-fit: cover; }

.wilaya-badge {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

/* --- الجهة اليسرى: المستخدم والمنيو --- */
.left-side { display: flex; align-items: center; }

.info-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex-direction: row-reverse;
}

.user-avatar {
  background: rgba(255, 255, 255, 0.2);
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: white;
}

.user-name {
  color: white;
  font-size: 13px;
  background: rgba(0, 0, 0, 0.1);
   border: 1px solid rgb(95, 95, 168);
  padding: 5px 15px;
  border-radius: 20px;
}

/* --- القائمة المنسدلة --- */
.dropdown-menu {
  position: absolute;
  top: 130%;
  left: 0;
  width: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: 0.3s ease;
  z-index: 1000;
}

.info-row:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.menu-list { list-style: none; padding: 5px 0; margin: 0; }

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  color: #444;
  text-decoration: none;
  font-size: 13px;
  gap: 10px;
}

.menu-item:hover { background: #f8fafc; color: #3498db; }

.logout-item { border-top: 1px solid #eee; margin-top: 5px; }
.logout-item a:hover { color: #e74c3c; background: #fff5f5; }
</style>