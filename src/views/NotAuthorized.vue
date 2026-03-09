<template>
  <div class="not-authorized">
    <h1>غير مصرح بالدخول</h1>
    <p>ليس لديك الصلاحية للوصول إلى هذه الصفحة.</p>
  </div>
</template>

<script>
export default {
  name: "NotAuthorized",
};
</script>

<style scoped>
.not-authorized {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
}
h1 {
  color: red;
  font-size: 2rem;
}
</style>
