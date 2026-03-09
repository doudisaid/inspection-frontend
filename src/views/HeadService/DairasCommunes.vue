<template>
    <div class="main-layout">
         <dairaCommuneComp />
    </div>
</template>


<script>
// 1. استيراد المكون من المسار الذي حددته
import dairaCommuneComp from '@/components/chefService/dairaCommuneComp.vue';

export default {
  name: "DairasCommunes",
  components: {
    dairaCommuneComp
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
  padding: 15px; 
  box-sizing: border-box;
}

</style>

