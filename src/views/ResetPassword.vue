<template>
  <div class="parent">
    <div class="content">
      <div class="text">إعادة تعيين كلمة المرور</div>

      <!-- الفورم تظهر فقط إذا التوكن صالح -->
      <form class="form" @submit.prevent="submitNewPassword" v-if="tokenValid">
        <div class="input-div">
          <font-awesome-icon :icon="['fas', 'lock']" class="lock-icon" />
          <input
            type="password"
            v-model="newPassword"
            placeholder="كلمة المرور الجديدة"
            autocomplete="new-password"
          />
        </div>

        <div class="input-div">
          <font-awesome-icon :icon="['fas', 'lock']" class="lock-icon" />
          <input
            type="password"
            v-model="confirmPassword"
            placeholder="تأكيد كلمة المرور"
            autocomplete="new-password"
          />
        </div>

        <button type="submit" :disabled="isSubmitting">
          <span v-if="isSubmitting">جاري إعادة التعيين...</span>
          <span v-else>إعادة تعيين كلمة المرور</span>
        </button>
      </form>

      <!-- رسالة الخطأ إذا التوكن غير صالح -->
      <div v-else class="error-message">
        <p>رابط إعادة التعيين غير صالح أو انتهت صلاحيته.</p>
        <p>
          يمكنك طلب رابط جديد من صفحة
          <router-link to="/login">تسجيل الدخول</router-link>.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api/axios';
import Swal from "sweetalert2";

export default {
  name: "ResetPassword",
  data() {
    return {
      token: this.$route.params.token || "", // ✅ قراءة التوكن من param
      newPassword: "",
      confirmPassword: "",
      tokenValid: false,
      isSubmitting: false,
    };
  },
  async mounted() {
    if (!this.token) return;

    // تحقق من صلاحية التوكن عند تحميل الصفحة
    try {
      const res = await api.get(`/auth/verify-reset-token/${this.token}`);
      this.tokenValid = res.data.success;
    } catch (err) {
      console.error("Token verification error:", err);
      this.tokenValid = false;
    }
  },
  methods: {
    async submitNewPassword() {
      if (!this.newPassword || !this.confirmPassword) {
        return this.showErrorToast("خطأ", "جميع الحقول مطلوبة");
      }
      if (this.newPassword !== this.confirmPassword) {
        return this.showErrorToast("خطأ", "كلمتا المرور غير متطابقتين");
      }

      // تحقق من قوة كلمة المرور
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])/;
      if (!passwordRegex.test(this.newPassword) || this.newPassword.length < 8) {
        return this.showErrorToast(
          "خطأ",
          "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، مع حروف وأرقام ورمز خاص واحد على الأقل"
        );
      }

      this.isSubmitting = true;

      try {
        const res = await api.post(`/auth/reset-password/${this.token}`, {
          newPassword: this.newPassword
        });

        if (res.data && res.data.success) {
          Swal.fire({
            title: "نجاح",
            text: res.data.message || "تم إعادة تعيين كلمة المرور بنجاح",
            icon: "success",
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: "top-end"
          });
          // التوجيه لصفحة تسجيل الدخول داخل نفس SPA
          setTimeout(() => this.$router.push("/login"), 1500);
        } else {
          this.showErrorToast("خطأ", res.data.message || "فشل إعادة التعيين");
        }
      } catch (err) {
        console.error("Reset password error:", err);
        this.showErrorToast(
          "خطأ",
          err.response?.data?.message || "حدث خطأ أثناء إعادة التعيين"
        );
      } finally {
        this.isSubmitting = false;
      }
    },

    showErrorToast(title, text) {
      Swal.fire({
        title,
        text,
        icon: "error",
        toast: true,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false
      });
    },
  }
};
</script>

<style scoped>
.parent { min-height:100vh; display:flex; justify-content:center; align-items:center; background: linear-gradient(45deg, rgb(247, 211, 211), rgb(252, 252, 218), rgb(180, 180, 255)); padding:20px }
.content { background:white; padding:0; border-radius:5px; box-shadow:0 20px 60px rgba(0,0,0,.3); width:100%; max-width:450px; text-align:center }
.text { background: var(--danger); font-size:18px; padding:15px; color: var(--white); margin-bottom:20px; font-family:'cairo'; font-weight:bold; border-top-left-radius:5px; border-top-right-radius:5px }
.form { margin:15px; display:flex; flex-direction:column; gap:20px; border:1px solid var(--gray); padding:12px; border-radius:5px }
.input-div { position: relative }
.input-div input { width:100%; padding:5px 10px; border:2px solid #e0e0e0; border-radius:5px; font-size:16px; text-align:right; font-family:'cairo', sans-serif; transition: all .3s }
.input-div input:focus { outline:none; border-color:#667eea; box-shadow:0 0 0 3px rgba(102,126,234,.1) }
.lock-icon { position:absolute; left:15px; top:50%; transform:translateY(-50%); color:#999 }
button[type=submit] { background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:#fff; border:none; padding:5px; border-radius:5px; font-size:14px; font-weight:bold; cursor:pointer; transition: all .3s; font-family:'cairo', sans-serif }
button[type=submit]:hover { transform:translateY(-2px); box-shadow:0 10px 20px rgba(102,126,234,.3) }
button[type=submit]:disabled { opacity:.6; cursor:not-allowed; transform:none }
.error-message { color:#e74c3c; padding:15px; font-weight:bold; font-family:'cairo'; font-size:14px }
</style>
