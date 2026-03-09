<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>
          <font-awesome-icon :icon="['fas', secteur.inspector ? 'exchange-alt' : 'user-plus']" class="header-icon" />
          {{ secteur.inspector ? 'حركة نقل مفتش' : 'تعيين مفتش جديد' }}
        </h3>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="info-tag">
          <span class="label">المقاطعة المستهدفة:</span>
          <span class="value">{{ secteur.secteurname }}</span>
        </div>
        
        <div class="form-group">
          <label>اختيار المفتش (من ولاية {{ currentUserWilayaName }}):</label>
          <div class="select-wrapper">
            <select v-model="form.userId" class="custom-select">
              <option :value="null">-- اختر المفتش من القائمة --</option>
              <option v-for="ins in availableInspectors" :key="ins.id" :value="ins.id">
                {{ ins.username }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>ملاحظات إضافية:</label>
          <textarea 
            v-model="form.note" 
            placeholder="اكتب سبب النقل أو أي ملاحظات إدارية هنا..."
            rows="4"
          ></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">إلغاء</button>
        <button class="btn-save" @click="submit" :disabled="loading || !form.userId">
          <span v-if="loading">جاري المعالجة...</span>
          <span v-else>تأكيد العملية</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    secteur: { type: Object, required: true },
    inspectors: { type: Array, required: true }
  },
  data() {
    return {
      form: { 
        userId: null, 
        note: '' 
      },
      loading: false
    }
  },
  computed: {
    // تصفية القائمة لاستبعاد المفتش الذي يشغل المقاطعة حالياً من الاختيارات
    availableInspectors() {
      if (!this.secteur || !this.secteur.user_id) return this.inspectors;
      return this.inspectors.filter(ins => ins.id !== this.secteur.user_id);
    }
  },
  methods: {
    async submit() {
      // التحقق من اختيار مفتش ومنع النقر المتكرر
      if (!this.form.userId || this.loading) return;
      
      this.loading = true;
      try {
        // إرسال البيانات للأب
        // ملاحظة: الأب (InspectorMouvePage) سيقوم بـ axios.post ثم يغلق المودال
        this.$emit('confirm', { 
          ...this.form, 
          secteurId: this.secteur.id 
        });
      } catch (error) {
        console.error("خطأ في المكون الفرعي:", error);
        this.loading = false;
      }
      // ملاحظة: loading = false ستتم في الملف الرئيسي أو هنا حسب نجاح العملية
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.6);
  display: flex; justify-content: center; align-items: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
  direction: rtl;
}

.modal-content {
  background: white;
  width: 480px;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: modalEnter 0.3s ease-out;
}

@keyframes modalEnter {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0; font-size: 1.25rem; color: #1e293b;
  display: flex; align-items: center; gap: 10px;
}

.header-icon { color: #3b82f6; }

.close-btn {
  background: none; border: none; font-size: 24px;
  color: #94a3b8; cursor: pointer; transition: color 0.2s;
}

.close-btn:hover { color: #ef4444; }

.modal-body { padding: 20px; }

.info-tag {
  background: #eff6ff;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-right: 4px solid #3b82f6;
}

.info-tag .label { color: #1e40af; font-size: 0.9rem; margin-left: 8px; }
.info-tag .value { font-weight: bold; color: #1e3a8a; }

.form-group { margin-bottom: 18px; }
.form-group label {
  display: block; margin-bottom: 8px;
  font-weight: 600; color: #475569; font-size: 0.95rem;
}

.custom-select, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-family: 'Cairo', sans-serif;
  font-size: 0.9rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.custom-select:focus, textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-footer {
  padding: 15px 20px;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #e2e8f0;
}

.btn-cancel {
  padding: 10px 20px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-family: 'cairo',sans-serif;
  color: #64748b;
  cursor: pointer;
  font-weight: 600;
}

.btn-save {
  padding: 10px 24px;
  background: #3b82f6;
  color: white;
  font-family: 'cairo',sans-serif;
  
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-save:hover:not(:disabled) { background: #2563eb; }
.btn-save:disabled { background: #94a3b8; cursor: not-allowed; }
</style>