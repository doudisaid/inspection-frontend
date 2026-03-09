<template>
  <div class="main-layout">
    <Inspectors />
  </div>
</template>

<script>
// 1. استيراد المكون من المسار الذي حددته
import Inspectors from '@/components/chefService/InspectorsComp.vue';

export default {
  name: "InspectorView",
  components: {
    Inspectors
  }
}
</script>

<style scoped>
.main-layout {
  width: 100%;
  max-height: calc(100vh - 65px); 
  display: flex;
  flex-direction: column; 
  overflow-y: auto;
  background-color: #f8fafc;
  padding: 15px; /* زيادة الهامش قليلاً ليعطي متنفساً للمحتوى */
  box-sizing: border-box; /* لضمان عدم خروج Padding عن حدود العرض */
}

/* لضمان أن المكون الداخلي (InspectorsManager) يتمدد أيضاً */
:deep(.inspector-page) {
  width: 100%;
  max-width: 100%; /* منع التجاوز */
  margin: 0 auto;
}

/* تخصيص شكل شريط التمرير */
.main-layout::-webkit-scrollbar {
  width: 6px;
}
.main-layout::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.main-layout::-webkit-scrollbar-thumb {
  background: #bdc3c7;
  border-radius: 10px;
}
.main-layout::-webkit-scrollbar-thumb:hover {
  background: #95a5a6;
}
</style>

