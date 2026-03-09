import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";

// Font Awesome الأساسيات
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// أيقونات Solid و Brands
import { fas } from "@fortawesome/free-solid-svg-icons";
import { faUser, faLock, faPhoneAlt, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faWhatsapp } from '@fortawesome/free-brands-svg-icons'; 

import '@/assets/academic-theme.css';

// إضافة الأيقونات للمكتبة
library.add(fas, faUser, faLock, faPhoneAlt, faLocationDot, faFacebook, faWhatsapp);

const app = createApp(App);

// 1. تسجيل المكون عالمياً
app.component("font-awesome-icon", FontAwesomeIcon);

// 2. تسجيل الـ Directive "click-outside" عالمياً (نسخة Vue 3)
app.directive('click-outside', {
    mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
            // التحقق إذا كان النقر خارج العنصر وأبنائه
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event);
            }
        };
        document.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
    }
});

app.use(store);
app.use(router);

// 3. تحميل الجلسة وتشغيل التطبيق
store.dispatch("userData/initUserFromLocalStorage").then(() => {
    app.mount("#app");
});