<template>
  <div class="main-layout" :class="userRoleClass">
    <div class="sidebar-wrapper side-bg">
      <SideBar />
    </div>

    <div class="content-wrapper">
      <header class="header-area head-bg">
        <HeaderPage />
      </header>
      
      <main class="view-area">
        <router-view /> 
      </main>
    </div>
  </div>
</template>

<script>
import SideBar from "@/components/SideBar.vue";
import HeaderPage from "@/components/HeaderPage.vue";

export default {
  name: "InspectorView",
  components: { HeaderPage, SideBar },
  computed: {
    // هذا الجزء يحدد الكلاس بناءً على الدور
    userRoleClass() {
      // افترضنا أن الدور مخزن في localStorage، يمكنك تغييره حسب مشروعك
      const role = localStorage.getItem('userRole'); 
      return {
        'role-admin': role === 'admin',
        'role-inspector': role === 'inspector',
        'role-manager': role === 'manager'
      };
    }
  }
};
</script>

<style scoped>
/* التنسيق الأساسي للمتدرجات */
.side-bg, .head-bg {
  transition: background 0.5s ease; /* انتقال ناعم عند تغير اللون */
}

/* --- ألوان الأدمن (Admin): تدرج أزرق ملكي عصري (Deep Ocean) --- */
/* يعطي إيحاءً بالثقة والسلطة */
.role-admin .side-bg {
  background: linear-gradient(180deg, #1e3c72 0%, #2a5298 100%);
}
.role-admin .head-bg {
  background: linear-gradient(90deg, #1e3c72 0%, #2a5298 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* --- ألوان المفتش (Inspector): تدرج زمردي مشرق (Fresh Mint) --- */
/* يعطي إيحاءً بالنشاط والدقة */
.role-inspector .side-bg {
  background: linear-gradient(180deg, #00b09b 0%, #96c93d 100%);
}
.role-inspector .head-bg {
  background: linear-gradient(90deg, #00b09b 0%, #96c93d 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* --- ألوان المدير (Manager): تدرج أرجواني فاخر (Royal Purple) --- */
/* يعطي إيحاءً بالإبداع والقيادة */
.role-manager .side-bg {
  background: linear-gradient(180deg, #6a11cb 0%, #2575fc 100%);
}
.role-manager .head-bg {
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* التنسيقات الهيكلية السابقة */
.main-layout { display: flex; height: 100vh; direction: rtl; }
.sidebar-wrapper { flex-shrink: 0; width: 260px; }
.content-wrapper { flex-grow: 1; display: flex; flex-direction: column; }
.header-area { width: 100%; height: 60px; }
.view-area { flex-grow: 1; overflow-y: auto; padding: 20px; background-color: #f8f9fa; }
</style>