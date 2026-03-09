<template>
  <div class="">
    <!-- <HeaderLogin /> -->
    <Loginpage />
  </div>
</template>

<script>
// @ is an alias to /src

import Loginpage from "@/components/homePage/LoginPage.vue";
// import HeaderLogin from "@/components/homePage/HeaderLogin.vue";
export default {
  name: "HomeView",
  components: {
    // HeaderLogin,
    Loginpage,
  },

};
</script>

