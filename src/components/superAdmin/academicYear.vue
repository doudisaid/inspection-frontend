<template>
  <section class="academic-setting-wrapper animate-fade">
    <div class="config-section">
      <div class="section-header">
        <div class="title-wrapper">
          <font-awesome-icon :icon="['fas', 'calendar-check']" class="header-icon" />
          <span>إعدادات الموسم الدراسي</span>
        </div>

        <div v-if="activeYear" class="active-year-badge">
          <!-- <span class="label">الموسم النشط:</span> -->
          <span class="year-value">{{ activeYear.yearname }}</span>
        </div>
      </div>

      <div class="content-body">
        <form @submit.prevent="addNewSeason" class="input-group">
          <div class="right-controls">
  <label class="field-label">سنة دراسية جديدة</label>
  <div class="custom-input-group">
    <div class="icon-addon">
      <font-awesome-icon :icon="['fas', 'calendar-plus']" />
    </div>
    <input 
      type="text" 
      v-model.trim="newYearInput" 
      placeholder="مثال: 2026/2025" 
      class="custom-input"
      required 
    />
  </div>
</div>

          <div class="action-controls-wrapper">
            <div class="filter-toggle">
              <label class="switch-wrapper">
                <div class="switch">
                  <input type="checkbox" v-model="showOnlyActive">
                  <span class="slider round"></span>
                </div>
                <span class="filter-label">الموسم النشط فقط</span>
              </label>
            </div>

            <div class="button-container">
              <button type="submit" class="btn-primary" :disabled="loading">
                <font-awesome-icon :icon="['fas', loading ? 'spinner' : 'plus']" :spin="loading" />
                <span>إضافة موسم جديد</span>
              </button>
            </div>
          </div>
        </form>

        <div class="table-container season-table-height">
          <div v-if="loading && seasons.length === 0" class="loading-state">جاري التحميل...</div>

          <table v-else class="custom-table">
            <thead>
              <tr>
                <th>الموسم الدراسي</th>
                <th>الحالة</th>
                <th>تفعيل كنشط</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="season in filteredSeasons" :key="season.id"
                :class="{ 'row-editing': editingId === season.id }">
                <td>
                  <input v-if="editingId === season.id" v-model="editYearInput" class="inline-edit-input"
                    @keyup.enter="saveEdit(season.id)" />
                  <span v-else>{{ season.yearname }}</span>
                </td>

                <td :class="season.status ? 'status-bg-active' : 'status-bg-inactive'">
                  <span :class="['status', season.status ? 'active' : 'inactive']">
                    {{ season.status ? 'نشط حالياً' : 'مؤرشف' }}
                  </span>
                </td>

                <td>
                  <input type="radio" name="activeSeason" :checked="season.status"
                    @change="handleStatusChange(season.id)">
                </td>

                <td>
                  <div class="actions-container">
                    <template v-if="editingId === season.id">
                      <button class="btn-icon save" @click="saveEdit(season.id)">
                        <font-awesome-icon :icon="['fas', 'check']" />
                      </button>
                      <button class="btn-icon cancel" @click="cancelEdit">
                        <font-awesome-icon :icon="['fas', 'times']" />
                      </button>
                    </template>
                    <template v-else>
                      <button class="btn-icon edit" @click="startEdit(season)">
                        <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                      </button>
                      <button class="btn-icon delete" @click="removeSeason(season.id)">
                        <font-awesome-icon :icon="['fas', 'trash-can']" />
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/api/axios.js';
import Swal from 'sweetalert2';


// --- الحالات العامة ---
const newYearInput = ref('');
const showOnlyActive = ref(false); 
const seasons = ref([]);
const loading = ref(false);

// --- حالات التعديل ---
const editingId = ref(null);
const editYearInput = ref('');

const path = '/years';

// --- استخراج السنة النشطة برمجياً من المصفوفة ---
const activeYear = computed(() => {
  return seasons.value.find(s => s.status === true || s.status === 1);
});

// --- إعدادات التنبيهات ---
const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
});

// 1. جلب البيانات
const fetchSeasons = async () => {
  loading.value = true;
  try {
    const response = await api.get(path);
    seasons.value = response.data;
  } catch (error) {
    showErrorSwal("فشل جلب البيانات", error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchSeasons);

// 2. تصفية البيانات (للسويتش)
const filteredSeasons = computed(() => {
  if (showOnlyActive.value) {
    return seasons.value.filter(s => s.status === true || s.status === 1);
  }
  return seasons.value;
});

// 3. إضافة موسم جديد
const addNewSeason = async () => {
  if (!newYearInput.value.trim()) return;
  loading.value = true;
  try {
    const response = await api.post(path, {
      yearname: newYearInput.value,
      status: false
    });
    seasons.value.unshift(response.data.data || response.data);
    newYearInput.value = '';
    toast.fire({ icon: 'success', title: 'تمت إضافة الموسم بنجاح' });
  } catch (error) {
    showErrorSwal("فشل إضافة الموسم", error);
  } finally {
    loading.value = false;
  }
};

// 4. تفعيل سنة كنشطة
const handleStatusChange = async (id) => {
  try {
    // تحديث بصري فوري محلياً
    seasons.value = seasons.value.map(s => ({
      ...s,
      status: s.id === id
    }));

    await api.put(`${path}/${id}`, { status: true });
    // لا نحتاج لعمل fetchSeasons كاملة لأننا حدثنا المصفوفة محلياً 
    // والـ computed سيقوم بتحديث الهيدر فوراً
    toast.fire({ icon: 'success', title: 'تم تنشيط الموسم الدراسي' });
  } catch (error) {
    showErrorSwal("فشل التنشيط", error);
    fetchSeasons();
  }
};

// 5. وظائف التعديل
const startEdit = (season) => {
  editingId.value = season.id;
  editYearInput.value = season.yearname;
};

const cancelEdit = () => {
  editingId.value = null;
  editYearInput.value = '';
};

const saveEdit = async (id) => {
  if (!editYearInput.value.trim()) return;
  try {
    await api.put(`${path}/${id}`, { yearname: editYearInput.value });
    const item = seasons.value.find(s => s.id === id);
    if (item) item.yearname = editYearInput.value;
    editingId.value = null;
    toast.fire({ icon: 'success', title: 'تم تحديث الاسم بنجاح' });
  } catch (error) {
    showErrorSwal("فشل التحديث", error);
  }
};

// 6. حذف موسم
const removeSeason = async (id) => {
  const result = await Swal.fire({
    title: 'هل أنت متأكد؟',
    text: "سيتم حذف الموسم نهائياً!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'نعم، احذفه',
    cancelButtonText: 'إلغاء',
    reverseButtons: true
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`${path}/${id}`);
      seasons.value = seasons.value.filter(s => s.id !== id);
      toast.fire({ icon: 'success', title: 'تم الحذف بنجاح' });
    } catch (error) {
      showErrorSwal("فشل الحذف", error);
    }
  }
};

const showErrorSwal = (title, error) => {
  const detail = error.response?.data?.message || error.message;
  Swal.fire({ icon: 'error', title: title, text: detail, confirmButtonText: 'حسناً' });
};
</script>

<style scoped>
/* --- 1. الحاوية الرئيسية للهيكل --- */
.academic-setting-wrapper {
    display: flex;
    flex-direction: column;
    direction: rtl;
    height: 100%;
    min-height: calc(100vh - 115px);
    padding: 0 12px 12px 12px;
}

/* --- 2. القسم الرئيسي (Config Section) --- */
.config-section {
    background: white;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    border: 1px solid #edf2f7;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 5px;
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

.header-icon {
    color: #764ba2;
}

.active-year-badge {
    background: #f0ebf8;
    color: #764ba2;
    padding: 5px 15px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 0.9rem;
}

/* --- 3. مجموعة الإدخال والتحكم (Input Group) --- */
.input-group {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 20px;
    margin-bottom: 25px;
    background: #f8fafc;
    padding: 20px;
    border-radius: 10px;
}

.right-controls {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.field-label {
    font-weight: 700;
    color: #4a5568;
    font-size: 0.95rem;
}

/* --- التنسيق الموحد للأيقونة (مثل Select) --- */
.custom-input-group {
    display: flex;
    align-items: center;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    height: 45px;
    overflow: hidden;
    transition: all 0.3s ease;
    width: 100%;
}

.custom-input-group:focus-within {
    border-color: #764ba2;
    box-shadow: 0 0 0 3px rgba(118, 75, 162, 0.1);
}

.icon-addon {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f1f5f9; /* الخلفية المميزة للأيقونة */
    height: 100%;
    width: 45px;
    color: #94a3b8;
    border-left: 1px solid #e2e8f0; /* الخط الفاصل */
    flex-shrink: 0;
}

.custom-input-group input {
    flex: 1;
    border: none !important;
    outline: none !important;
    padding: 0 15px;
    font-family: 'Cairo', sans-serif;
    font-size: 0.95rem;
    color: #2d3748;
    background: transparent;
    height: 100%;
}

.action-controls-wrapper {
    display: flex;
    align-items: center;
    gap: 25px;
}

/* --- 4. مفتاح التبديل (Switch) --- */
.switch-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}

.switch {
    position: relative;
    width: 40px;
    height: 20px;
}

.switch input { opacity: 0; width: 0; height: 0; }

.slider {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: #cbd5e1;
    transition: .4s;
    border-radius: 34px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 14px; width: 14px;
    left: 3px; bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
}

input:checked + .slider { background: #764ba2; }
input:checked + .slider:before { transform: translateX(20px); }

.filter-label { font-size: 0.9rem; color: #64748b; font-weight: 600; }

/* --- 5. الأزرار --- */
.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    height: 40px;
    padding: 0 25px;
    border-radius: 8px;
    font-weight: 700;
    font-family: "Cairo", sans-serif;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(118, 75, 162, 0.3);
}

.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

/* --- 6. الجدول --- */
.table-container {
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
    margin-top: 10px;
}

.custom-table {
    width: 100%;
    border-collapse: collapse;
}

.custom-table th {
    background: #f8fafc;
    padding: 5px;
    text-align: center;
    color: #475569;
    font-weight: 700;
    border-bottom: 2px solid #edf2f7;
}

.custom-table td {
    padding: 5px 15px;
    text-align: center;
    border-bottom: 1px solid #f1f5f9;
}

.status {
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 700;
}

.status.active { background: #ecfdf5; color: #059669; }
.status.inactive { background: #f1f5f9; color: #64748b; }

.actions-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.btn-icon {
    width: 34px; height: 34px;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    border: none; cursor: pointer; transition: 0.2s;
}

.btn-icon.edit { background: #f0f4ff; color: #764ba2; }
.btn-icon.delete { background: #fff5f5; color: #ff7675; }
.btn-icon.save { background: #f0fdf4; color: #16a34a; }
.btn-icon.cancel { background: #f1f5f9; color: #475569; }

.btn-icon:hover { transform: scale(1.1); }

/* --- 7. التعديل السريع داخل الجدول --- */
.inline-edit-input {
    width: 120px;
    padding: 5px;
    border: 1px solid #764ba2;
    border-radius: 4px;
    text-align: center;
    font-family: 'Cairo', sans-serif;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
