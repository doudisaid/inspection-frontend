<template>
  <div class="main-container">
    <div class="right-section">
      <div class="brand-content">
        <div class="brand-content-title">
          <div class="img-container">
            <img class="brand-logo" src="@/assets/images/logo.png" alt="Logo">
          </div>
          <h2>تسيير المقاطعات البيداغوجية</h2>
        </div>
      </div>
    </div>

    <div class="left-section">
      <div class="parent">
        <div class="content">
          <div class="text">تسجيل الدخول</div>

          <form class="form" @submit.prevent="submitForm">
            <div class="input-div">
              <font-awesome-icon :icon="['fas', 'user']" class="user-icon" />
              <input type="text" v-model="userInput" ref="userInputField" placeholder="البريد الإلكتروني أو رقم الهاتف"
                autocomplete="username" />
            </div>

<div class="input-div" style="position: relative;">
  <font-awesome-icon :icon="['fas', 'lock']" class="lock-icon" />
  
  <input 
    :type="showPassword ? 'text' : 'password'" 
    v-model="password" 
    placeholder="كلمة المرور" 
    autocomplete="current-password" 
  />

  <font-awesome-icon 
    :icon="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']" 
    class="eye-icon" 
    @click="showPassword = !showPassword"
    style="cursor: pointer; position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #888;"
  />
</div>

            <button type="submit" :disabled="isLoggingIn" class="login-btn">
              <span v-if="isLoggingIn">جاري التحميل...</span>
              <span v-else>تسجيل الدخول</span>
            </button>
          </form>

          <div class="divider">
            <span>أو</span>
          </div>

          <div class="forgot-password">
            <a href="#" @click.prevent="!isWaitingForgot && forgotPassword()"
              :class="['forgot-link', { 'disabled-link': isWaitingForgot }]">
              نسيت كلمة المرور؟
              <span v-if="isWaitingForgot" class="wait-timer">({{ waitTime }}s)</span>
            </a>
            <div id="g_id_signin" class="google-login-container" v-if="showGoogleButton"></div>
          </div>
        </div>
      </div>
    </div>

    <footer class="login-footer">
      <div class="footer-content">
        <div class="copyright">
          <p>© 2026 جميع الحقوق محفوظة - تسيير المقاطعات البيداغوجية</p>
        </div>
        <div class="social-contact">
          <a href="https://facebook.com" target="_blank" class="contact-item">
            <font-awesome-icon :icon="['fab', 'facebook']" class="icon-fb" />
            <span>Facebook</span>
          </a>
          <a href="https://wa.me/213667078106" target="_blank" class="contact-item">
            <font-awesome-icon :icon="['fab', 'whatsapp']" class="icon-wa" />
            <span>WhatsApp</span>
          </a>

        <a href="mailto:doudi.said47@gmail.com" class="contact-item gmail-link">
  <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" 
       alt="Gmail Logo"
       class="gmail-icon-svg" />
  <span>Gmail</span>
</a>
          <div class="contact-item phones">
            <font-awesome-icon :icon="['fas', 'phone-alt']" class="icon-ph" />
            <span>0667078106 / 0780156274</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
/* global google */
import api from "../../api/axios";
import Swal from "sweetalert2";

export default {
  name: "LoginPage",
  data() {
    return {
      userInput: "",
      password: "",
      showPassword: false,
      showGoogleButton: false,
      isLoggingIn: false,
      isWaitingForgot: false,
      waitTime: 0,
      forgotInterval: null,
    };
  },
  async mounted() {
    // استدعاء الهوية مع التأكد من جاهزية DOM
    this.$nextTick(() => {
      this.loadGoogleIdentity();
    });
    this.restoreSession();
  },
  methods: {
    async showAlert(title, text, icon, isToast = true) {
      return Swal.fire({
        title, text, icon,
        toast: isToast,
        position: isToast ? "top-end" : "center",
        timer: isToast ? 3000 : null,
        showConfirmButton: !isToast,
        background: "#ffffff",
        backdrop: isToast ? "" : `rgba(0,0,0,0.4)`,
        didOpen: () => {
          if (!isToast) {
            const container = Swal.getContainer();
            container.style.backdropFilter = "blur(8px)";
            container.style.webkitBackdropFilter = "blur(8px)";
          }
        }
      });
    },

    async submitForm() {
      if (!this.userInput) return this.showAlert("تنبيه", "يرجى إدخال البيانات", "warning");
      if (!this.password) return this.showAlert("تنبيه", "يرجى إدخال كلمة المرور", "warning");

      this.isLoggingIn = true;
      try {
        const input = this.userInput.trim();
        const type = this.determineLoginType(input);
        if (!type) return this.showAlert("خطأ", "صيغة غير صحيحة", "error");

        const loginData = this.prepareLoginData(input, type);
        const res = await api.post("/auth/login", loginData);
        this.processLoginSuccess(res.data);
      } catch (err) {
        this.processLoginError(err);
      } finally {
        this.isLoggingIn = false;
      }
    },

    processLoginSuccess(data) {
      const { token, user } = data;

      // الحل الجذري لتداخل البيانات: مسح الذاكرة قبل التخزين الجديد
      localStorage.clear(); 

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      this.$store.commit("userData/setCurrentUser", user);

      // التصحيح الجغرافي: الوصول لـ user.willaya.name
      if (user.willaya) {
        this.$store.commit("userData/setCurrentWilaya", { 
          id: user.willaya_id, 
          name: user.willaya.name 
        });
      }

      this.showAlert("نجاح", "تم تسجيل الدخول بنجاح", "success");

      const roles = { 
        0: "/dashboard/super", 
        1: "/dashboard/chief", 
        2: "/dashboard/inspector", 
        3: "/dashboard/manager" 
      };
      this.$router.push(roles[user.role_id] || "/dashboard");
    },

    // --- الحل الجذري لزر جوجل ---
    loadGoogleIdentity() {
      // إذا كان السكربت محملاً مسبقاً (عند العودة لصفحة الدخول)
      if (window.google && window.google.accounts) {
        this.initGoogle();
      } else {
        // تحميل السكربت لأول مرة
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = this.initGoogle;
        document.head.appendChild(script);
      }
    },

    initGoogle() {
      if (!window.google?.accounts) return;

      google.accounts.id.initialize({
        client_id: process.env.VUE_APP_GOOGLE_CLIENT_ID,
        callback: this.handleGoogleResponse,
        auto_select: false
      });

      this.showGoogleButton = true;

      // إجبار المتصفح على رسم الزر حتى لو لم يتم عمل Refresh
      this.$nextTick(() => {
        const container = document.getElementById("g_id_signin");
        if (container) {
          google.accounts.id.renderButton(container, { 
            theme: "outline", 
            size: "large", 
            width: 240 
          });
        }
      });
    },

    async handleGoogleResponse(response) {
      try {
        const res = await api.post("/auth/google-login", { token: response.credential });
        this.processLoginSuccess(res.data);
      } catch (err) { 
        this.showAlert("خطأ", "فشل دخول Google", "error"); 
      }
    },

    restoreSession() {
      const token = localStorage.getItem("authToken");
      const user = JSON.parse(localStorage.getItem("user"));
      if (token && user) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        this.$store.commit("userData/setCurrentUser", user);
        if (user.willaya) {
          this.$store.commit("userData/setCurrentWilaya", { 
            id: user.willaya_id, 
            name: user.willaya.name 
          });
        }
      }
    },

    determineLoginType(input) {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) return "email";
      if (/^(\+213|0|213)(5|6|7)[0-9]{8}$/.test(input.replace(/\s+|-/g, ""))) return "phone";
      return null;
    },

    prepareLoginData(input, type) {
      const base = { password: this.password };
      if (type === "email") return { ...base, email: input };
      let phone = input.replace(/\s+|-/g, "");
      if (phone.startsWith("+213")) phone = "0" + phone.slice(4);
      else if (phone.startsWith("213")) phone = "0" + phone.slice(3);
      return { ...base, phone };
    },

    processLoginError(err) {
      this.password = "";
      this.showAlert("خطأ", err.response?.data?.message || "فشل الدخول", "error");
    },
  },
};
</script>

<style scoped>
/* 1. الحاوية الأساسية */
.main-container {
  display: flex;
  height: 100vh;
  width: 100%;
  direction: rtl;
  overflow: hidden;
  position: relative;
}

/* 2. القسم الأيمن */
.right-section {
  width: 50%;
  background-color: #f8fafc;
}

.brand-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.brand-content-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.img-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;
  height: 120px;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.brand-logo {
  width: 75%;
  height: auto;
}

.brand-content-title h2 {
  margin: 0;
  font-family: 'cairo', sans-serif;
  font-size: 1.8rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 3. القسم الأيسر */
.left-section {
  flex: 1;
  background-color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
}

.parent {
  width: 100%;
  max-width: 450px;
  padding: 20px;
}

.content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.text {
  background: linear-gradient(135deg, #667eea, #764ba2);
  font-size: 1.25rem;
  padding: 22px;
  color: #fff;
  font-family: 'cairo', sans-serif;
  font-weight: bold;
  text-align: center;
}

.form {
  padding: 25px 25px 0 25px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-div {
  position: relative;
  overflow-x: hidden;
}

.input-div input {
  width: 100%;
  height: 45px;
  padding: 0 55px 0 15px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-family: 'cairo', sans-serif;
  transition: all 0.3s ease;
}

.eye-icon {
  position: absolute;
  left: 10px;
  color: #777;
  transition: color 0.3s;
}

.eye-icon:hover {
  color: #333;
}

.input-div input:focus {
  border-color: #667eea;
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.user-icon,
.lock-icon {
  position: absolute;
  right: 2px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #e7edf5;
  height: 92%;
  font-size: 10px;
  padding: 0 15px;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  color: #94a3b8;
}

.login-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  background-size: 200% auto;
  color: white;
  font-family: 'cairo', sans-serif;
  border: none;
  height: 45px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-btn:hover {
  background-position: right center;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(118, 75, 162, 0.4);
  filter: brightness(1.1);
}

.login-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 10px rgba(118, 75, 162, 0.3);
}

.divider {
  display: flex;
  align-items: center;
  margin: 15px 30px;
  color: #cbd5e0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
  margin: 0 10px;
}

.forgot-password {
  display: flex;
  justify-content: space-between;
  padding: 0 15px 15px 15px;
  align-items: center;
}

.forgot-link {
  color: #1e3a8a;
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.forgot-link.disabled-link {
  color: #94a3b8 !important;
  cursor: not-allowed;
  pointer-events: none;
}

.wait-timer {
  color: #ef4444;
  font-size: 0.75rem;
  font-weight: 600;
}

.google-login-container {
  min-width: 200px;
  display: flex;
  justify-content: flex-end;
}

/* 4. الفوتر */
.login-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 5px 0;
  border-top: 1px solid #e2e8f0;
  z-index: 20;
}

.footer-content {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 15%;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-content .copyright>p {
  font-size: 12px;
  color: #a5a2a2;
}

.social-contact {
  display: flex;
  gap: 20px;
  align-items: center;
  /* لضمان استقامة جميع العناصر أفقياً */
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #475569;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  /* نقل الترانزيشن هنا ليكون أشمل */
}

/* توحيد أحجام الأيقونات */
.icon-fb,
.icon-wa,
.icon-ph,
.gmail-icon-svg {
  font-size: 1.2rem;
  width: 1.2rem;
  /* تحديد عرض ثابت للـ SVG أيضاً */
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-fb {
  color: #1877f2;
}

.icon-wa {
  color: #25d366;
}

.icon-ph {
  color: #1e3a8a;
}

/* تأثير التمرير */
.contact-item:hover {
  opacity: 0.8;
  transform: translateY(-2px);
  color: #1e293b;
  /* تغيير لون النص قليلاً عند التمرير لمزيد من التفاعل */
}

/* 5. التجاوب (Mobile Mode) */
@media (max-width: 768px) {

  /* إخفاء القسم الأيمن والفوتر تماماً */
  .right-section,
  .login-footer {
    display: none !important;
  }

  /* جعل القسم الأيسر يملأ الشاشة */
  .left-section {
    width: 100%;
    height: 100vh;
    background-color: #f8fafc;
    /* يمكنك تغييرها لتدرج لوني إذا أردت */
  }

  .main-container {
    overflow: hidden;
  }

  /* ترتيب العناصر فوق بعضها داخل النموذج */
  .forgot-password {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .google-login-container {
    justify-content: center;
    min-width: 100%;
  }

  .parent {
    max-width: 95%;
    padding: 10px;
  }
}
</style>