<template>
  <div class="inspector-move-container">
    <InspectorMouvePage />
  </div>
</template>

<script>
import InspectorMouvePage from "@/components/chefService/inspectorMouvementComp.vue";

export default {
  name: "inspectorMouvementComp",
  components: {
    InspectorMouvePage
  }
};
</script>

<style scoped>
.inspector-move-container {
    position: relative;
    min-height: calc(100vh - 65px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    margin: 0;

}
</style>