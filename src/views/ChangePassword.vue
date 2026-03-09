<template>
  <div class="main-layout">
    <div class="sidebar-wrapper">
      <SideBar />
    </div>

    <div class="content-wrapper">
      <header class="header-area">
        <HeaderPage />
      </header>
      
      <main class="main-content">
        <div class="change-password-container">
          <ChangePasswordComponent />
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import HeaderPage from "@/components/HeaderPage.vue";
import SideBar from "@/components/SideBar.vue";
import ChangePasswordComponent from "@/components/changePassword.vue"; 

export default {
  name: "ChangePasswordView",
  components: {
    HeaderPage,
    SideBar,
    ChangePasswordComponent
  }
};
</script>

<style scoped>
/* الحاوية الأساسية تملأ الشاشة بالكامل */
.main-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  direction: rtl; /* اتجاه عربي */
}

/* تغليف السايدبار لضمان عدم تأثر العرض */
.sidebar-wrapper {
  flex-shrink: 0;
  /* الانتقال السلس يتبع حركة السايدبار الداخلية */
  transition: width 0.3s ease; 
}

/* منطقة المحتوى التي ستتمدد وتتقلص */
.content-wrapper {
  flex-grow: 1; /* التمدد التلقائي */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* لمنع التمرير الخارجي المزعج */
  background-color: #f4f7fa; /* لون خلفية مريح للعين */
}

.header-area {
  width: 100%;
  flex-shrink: 0;
}

/* منطقة المكون الداخلي (تغيير كلمة المرور) */
.main-content {
  flex-grow: 1;
  overflow-y: auto; /* التمرير يكون هنا فقط إذا كان المحتوى طويلاً */
  padding: 30px;
  display: flex;
  justify-content: center; /* توسيط نموذج تغيير كلمة المرور */
  align-items: flex-start;
}

.change-password-container {
  width: 100%;
  max-width: 600px; /* تحديد عرض أقصى للنموذج ليكون مظهره احترافياً */
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 20px;
}
</style>