<template>
  <div class="main-layout">
    <div class="sidebar-wrapper">
      <SideBar />
    </div>

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
  name: "InspectorView",
  components: {
    HeaderPage,
    SideBar
  }
};
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  direction: rtl; /* لضمان التوافق مع اللغة العربية */
}

.sidebar-wrapper {
  /* لا نضع عرض هنا، العرض يتحكم به مكون SideBar نفسه */
  flex-shrink: 0;
  transition: width 0.3s ease; /* متوافق مع حركة السايدبار */
}

.content-wrapper {
  flex-grow: 1; /* هذا ما يجعله يتمدد ليملأ باقي المساحة */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f8f9fa; /* لون خلفية خفيف للمحتوى */
}

.header-area {
  width: 100%;
  flex-shrink: 0;
}

.view-area {
  flex-grow: 1;
  overflow-y: auto; /* يسمح بالتمرير داخل محتوى الصفحة فقط */
  padding: 20px;
}
</style>