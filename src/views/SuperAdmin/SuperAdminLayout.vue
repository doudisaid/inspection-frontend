<template>
  <div class="main-layout">
    <aside class="sidebar-wrapper">
      <SideBar />
    </aside>

    <div class="content-wrapper">
      <header class="header-area">
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
  name: "SuperAdminLayout",
  components: { HeaderPage, SideBar },
 
};
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  direction: rtl; /* اتجاه عربي */
  overflow: hidden; /* يمنع ظهور سكرول للموقع ككل */
}

.sidebar-wrapper {
  /* width: 260px; */
  flex-shrink: 0; /* يمنع تقلص السايدبار */
  height: 100vh;
  z-index: 100;
}

.content-wrapper {
  flex-grow: 1; /* يأخذ كل المساحة المتبقية */
  display: flex;
  flex-direction: column; /* يرتب الهيدر فوق والمحتوى تحت */
  height: 100vh;
  overflow: hidden;
}

.header-area {
  height: 57px; /* تأكد من وضع ارتفاع ثابت */
  width: 100%;
  flex-shrink: 0; /* يمنع انضغاط الهيدر */
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

.view-area {
  flex-grow: 1; /* يملأ بقية الارتفاع */
  overflow-y: auto; /* يسمح بالتمرير فقط داخل صفحة المحتوى */
   padding: 0; 
    height: calc(100vh - 100px);
  background-color: #f8f9fa;
}
</style>

