const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: "0.0.0.0",
    port: 8080,
    historyApiFallback: true, // ✅ هذا يضمن عمل Vue Router عند فتح روابط مباشرة
  }
});



