<template>
  <section class="academic-setting-wrapper animate-fade">
    <div class="config-section animate-fade">
      <div class="section-header">
        <div class="title-wrapper">
          <font-awesome-icon :icon="['fas', 'calendar-alt']" class="header-icon" />
          <span>رزنامة العطل المدرسية</span>
        </div>

        <div v-if="activeYear" class="active-year-badge">
          <!-- <span class="label">الموسم الدراسي:</span> -->
          <span class="year-value">{{ activeYear.yearname }}</span>
        </div>
      </div>

      <div class="form-container">
        <form @submit.prevent="handleSubmit" class="compact-form">

          <div class="grid-row">
            <div class="form-group-inline">
              <label class="field-label">نوع العطلة</label>
              <div class="custom-input-group">
                <div class="icon-addon">
                  <font-awesome-icon :icon="['fas', 'umbrella-beach']" />
                </div>
                <select v-model="formData.vacance_id" class="custom-input" required>
                  <option value="" disabled>اختر العطلة...</option>
                  <option v-for="v in holidayNames" :key="v.id" :value="v.id">
                    {{ v.vacance_name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group-inline">
              <label class="field-label">الثلاثي</label>
              <div class="custom-input-group">
                <div class="icon-addon">
                  <font-awesome-icon :icon="['fas', 'layer-group']" />
                </div>
                <select v-model="formData.trimestre_id" class="custom-input" required>
                  <option value="" disabled>اختر الثلاثي...</option>
                  <option v-for="t in trimestres" :key="t.id" :value="t.id">
                    {{ t.trimestre_name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="grid-row">
            <div class="form-group-inline">
              <label class="field-label">تاريخ البداية</label>
              <div class="custom-input-group">
                <div class="icon-addon">
                  <font-awesome-icon :icon="['fas', 'calendar-alt']" />
                </div>
                <input v-model="formData.begindate" type="date" class="custom-input holiday-date-input" lang="en-GB"
                  required>
              </div>
            </div>

            <div class="form-group-inline">
              <label class="field-label">تاريخ النهاية</label>
              <div class="custom-input-group">
                <div class="icon-addon">
                  <font-awesome-icon :icon="['fas', 'calendar-alt']" />
                </div>
                <input v-model="formData.enddate" type="date" class="custom-input holiday-date-input" lang="en-GB" required>
              </div>
            </div>
          </div>

          <div class="form-actions-footer">
            <div :class="['btn-container', { 'editing-mode': isEditing }]">
              <button v-if="isEditing" type="button" class="base-btn cancel-btn" @click="resetForm">
                <font-awesome-icon :icon="['fas', 'times']" />
                <span>إلغاء</span>
              </button>

              <button type="submit" class="base-btn submit-btn">
                <font-awesome-icon :icon="isEditing ? ['fas', 'sync-alt'] : ['fas', 'save']" />
                <span>{{ isEditing ? 'تحديث البيانات' : 'حفظ البيانات' }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div class="table-container holidays-table-height">
        <table class="custom-table">
          <thead>
            <tr>
              <th>الثلاثي</th>
              <th>العطلة</th>
              <th>من</th>
              <th>إلى</th>
              <th>المدة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="vacance in vacances" :key="vacance.id">
              <td style="font-weight: bold;">{{ vacance.Trimestre?.trimestre_name || 'غير محدد' }}</td>
              <td class="holiday-name">{{ vacance.Vacance?.vacance_name || 'عطلة' }}</td>
              <td><span class="date-badge">{{ formatDateForDisplay(vacance.begin_date) }}</span></td>
              <td><span class="date-badge">{{ formatDateForDisplay(vacance.end_date) }}</span></td>
              <td><span class="duration-tag">{{ calculateDuration(vacance.begin_date, vacance.end_date) }} يوم</span>
              </td>
              <td>
                <div class="actions-container">
                  <button class="btn-icon edit" @click="prepareEdit(vacance)">
                    <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                  </button>
                  <button class="btn-icon delete" @click="handleDelete(vacance)">
                    <font-awesome-icon :icon="['fas', 'trash-can']" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="vacances.length === 0">
              <td colspan="6" style="text-align: center; padding: 20px;">لا توجد عطل مسجلة لهذه السنة</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from "@/api/axios.js";
import Swal from 'sweetalert2';

const vacances = ref([]);       // بيانات جدول التقويم المعروضة
const holidayNames = ref([]);   // قائمة أنواع العطل (للـ Select الأول)
const trimestres = ref([]);     // قائمة الثلاثيات (للـ Select الثاني)
const isEditing = ref(false);
const currentId = ref(null);
const activeYear = ref(null);   // بيانات السنة النشطة

const formData = ref({
  vacance_id: '',   // معرف العطلة المختارة
  trimestre_id: '', // معرف الثلاثي المختار
  begindate: '',
  enddate: ''
});

// --- الدوال (Methods) ---

/**
 * 1. جلب البيانات الأساسية للقوائم المنسدلة (الخيارات)
 */
const fetchOptions = async () => {
  try {
    // جلب أنواع العطل (خريف، شتاء...)
    const vResponse = await api.get('/vacances');
    holidayNames.value = vResponse.data;

    // جلب الثلاثيات (الأول، الثاني...)
    const tResponse = await api.get('/trimestres');
    trimestres.value = tResponse.data;
  } catch (error) {
    console.error("خطأ في جلب بيانات الخيارات:", error);
  }
};

/**
 * 2. جلب السنة النشطة
 */
const fetchActiveYear = async () => {
  try {
    const response = await api.get('/years/active');

    if (response.data && Object.keys(response.data).length > 0) {
      activeYear.value = response.data;
      if (activeYear.value.id) {
        await fetchCalendarData();
      }
    } else {
      activeYear.value = null;
      console.warn("تنبيه: لا يوجد موسم دراسي نشط.");
    }
  } catch (error) {
    activeYear.value = null;
    console.error("خطأ في جلب السنة النشطة:", error);
  }
};

/**
 * 3. جلب بيانات التقويم (العطل المسجلة للسنة النشطة)
 */
const fetchCalendarData = async () => {
  if (!activeYear.value?.id) return;

  try {
    // نستخدم المسار الذي أنشأناه لجدول التقويم
    const response = await api.get(`/vacance-calendar/year/${activeYear.value.id}`);
    vacances.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("خطأ في جلب بيانات التقويم:", error);
    vacances.value = [];
  }
};

/**
 * 4. حفظ البيانات (إضافة أو تحديث)
 */
const handleSubmit = async () => {
  if (!activeYear.value?.id) {
    Swal.fire('تنبيه', 'يجب تحديد سنة نشطة أولاً', 'warning');
    return;
  }

  try {
    const payload = {
      vacance_id: formData.value.vacance_id,
      trimestre_id: formData.value.trimestre_id,
      begin_date: formData.value.begindate,
      end_date: formData.value.enddate,
      year_id: Number(activeYear.value.id)
    };

    if (isEditing.value) {
      await api.put(`/vacance-calendar/${currentId.value}`, payload);
      Swal.fire({ icon: 'success', title: 'تم التحديث بنجاح', timer: 1500, showConfirmButton: false });
    } else {
      await api.post('/vacance-calendar', payload);
      Swal.fire({ icon: 'success', title: 'تم الحفظ بنجاح', timer: 1500, showConfirmButton: false });
    }

    resetForm();
    await fetchCalendarData();
  } catch (error) {
    const errorMsg = error.response?.data?.message || "خطأ في معالجة الطلب";
    Swal.fire('خطأ', errorMsg, 'error');
  }
};

/**
 * 5. تحضير السجل للتعديل
 */
const prepareEdit = (item) => {
  isEditing.value = true;
  currentId.value = item.id;
  formData.value = {
    vacance_id: item.vacance_id,
    trimestre_id: item.trimestre_id,
    begindate: item.begin_date ? item.begin_date.split('T')[0] : '',
    enddate: item.end_date ? item.end_date.split('T')[0] : ''
  };
};

/**
 * 6. حذف سجل من التقويم
 */
const handleDelete = async (item) => {
  const result = await Swal.fire({
    title: 'هل أنت متأكد؟',
    text: "سيتم حذف هذا الموعد من الرزنامة!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'نعم، احذف',
    cancelButtonText: 'إلغاء',
    reverseButtons: true
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/vacance-calendar/${item.id}`);
      Swal.fire({ icon: 'success', title: 'تم الحذف', timer: 1000, showConfirmButton: false });
      await fetchCalendarData();
    } catch (error) {
      Swal.fire('خطأ', 'فشل الحذف', 'error');
    }
  }
};

/**
 * 7. إعادة تهيئة النموذج
 */
const resetForm = () => {
  formData.value = { vacance_id: '', trimestre_id: '', begindate: '', enddate: '' };
  isEditing.value = false;
  currentId.value = null;
};

// --- دوال المساعدة ---

const formatDateForDisplay = (d) => {
  if (!d) return '-';
  return new Intl.DateTimeFormat('ar-DZ', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(new Date(d));
};

const calculateDuration = (s, e) => {
  if (!s || !e) return 0;
  const start = new Date(s);
  const end = new Date(e);
  const diff = end - start;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  return days > 0 ? days : 0;
};

// --- دورة حياة المكون ---
onMounted(async () => {
  await fetchOptions();    // جلب خيارات الـ Select أولاً
  await fetchActiveYear(); // ثم جلب السنة والبيانات المرتبطة بها
});
</script>

<style scoped>
/* --- 1. الحاوية الرئيسية للهيكل --- */
.academic-setting-wrapper {
  display: flex;
  flex-direction: column;
  direction: rtl;
  height: calc(100vh - 115px);
  padding: 0 12px 12px 12px;
  box-sizing: border-box;
}

/* --- 2. القسم الرئيسي --- */
.config-section {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #edf2f7;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* --- 3. الترويسة --- */
.section-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #b0b1b3;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
}

.header-icon { color: #764ba2; }

.active-year-badge {
    background: #f0ebf8;
    color: #764ba2;
    padding: 5px 15px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 0.9rem;
}

/* --- 4. النموذج والشبكة --- */
.compact-form {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
  background: #f8fafc;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 15px;
}

.grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: center;
}

.form-group-inline {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.field-label {
  min-width: 100px;
  font-weight: 700;
  color: #4a5568;
  font-size: 0.95rem;
  white-space: nowrap;
}

/* --- 5. المداخل الموحدة (تصميم الأيقونة مثل Select) --- */
.custom-input-group {
  display: flex;
  align-items: stretch;
  flex: 1;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  height: 42px;
  transition: 0.3s;
}

.custom-input-group:focus-within {
  border-color: #764ba2;
  box-shadow: 0 0 0 3px rgba(118, 75, 162, 0.1);
}

.icon-addon {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
  width: 42px;
  color: #94a3b8;
  border-left: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.custom-input {
  width: 100%;
  height: 100%;
  padding: 0 12px;
  font-family: 'Cairo', sans-serif;
  border: none !important;
  outline: none !important;
  background: transparent;
  font-size: 0.95rem;
  color: #2d3748;
}

/* --- حل مشكلة التاريخ (إظهار الأرقام فقط ومنع قنس-رهش) --- */
.holiday-date-input {
  direction: ltr !important; 
  text-align: right !important;
  cursor: pointer;
}

/* إخفاء تسميات المتصفح وإجبار الترتيب الرقمي */
.holiday-date-input::-webkit-datetime-edit {
  display: flex;
  flex-direction: row; 
  justify-content: flex-end;
  width: 100%;
}

.holiday-date-input::-webkit-datetime-edit-fields-wrapper {
  display: flex;
  flex-direction: row-reverse; /* لضمان ظهور اليوم أولاً من جهة اليمين */
}

.holiday-date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: invert(30%) sepia(50%) saturate(1000%) hue-rotate(240deg) brightness(90%);
}

/* --- 6. الأزرار (تصحيح مشكلة التراكم) --- */
.form-actions-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 5px;
  padding-top: 10px;
  border-top: 1px solid #edf2f7;
}

.btn-container {
  display: flex !important; /* لضمان بقاء الأزرار بجانب بعضها */
  flex-direction: row !important;
  gap: 15px;
  height: 40px;
  align-items: center;
}

.base-btn {
  height: 42px;
  padding: 0 25px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.3s;
  border: none;
  font-family: 'Cairo', sans-serif;
  white-space: nowrap; /* لمنع انكسار النص داخل الزر */
}

.submit-btn { 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
  color: white; 
}

.cancel-btn { 
  background: #f1f5f9; 
  color: #475569; 
  border: 1px solid #e2e8f0; 
}

.base-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* --- 7. الجدول --- */
.table-container {
  flex-grow: 1;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow-y: auto;
  background: white;
}

.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th {
  position: sticky; top: 0; background: #f8fafc;
  padding: 5px; color: #475569; font-weight: 700;
  border-bottom: 2px solid #edf2f7; z-index: 1;
}

.custom-table td { padding: 5px; text-align: center; border-bottom: 1px solid #f1f5f9; }
.actions-container{
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
.btn-icon {
  width: 32px; height: 32px; border-radius: 6px; border: none; cursor: pointer; transition: 0.2s;
}
.btn-icon.edit { background: #f0f4ff; color: #764ba2; }
.btn-icon.delete { background: #fff5f5; color: #ff7675; }

@media (max-width: 900px) {
  .grid-row { grid-template-columns: 1fr; gap: 10px; }
  .academic-setting-wrapper { height: auto; }
}
</style>