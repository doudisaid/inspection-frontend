<template>
    <div class="willaya-container">
        <div class="page-header">
            <div class="header-title">
                <font-awesome-icon :icon="['fas', 'map-location-dot']" class="header-icon" />
                <h3>إدارة مديريات التربية</h3>
            </div>

            <div class="search-box">
                <div class="input-div long-search">
                    <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="search-icon" />
                    <input type="text" v-model="searchQuery" placeholder="ابحث بالاسم أو الرقم..." autocomplete="off" />
                </div>
            </div>
            <button class="add-btn" @click="openAddModal" title="إضافة مديرية جديدة">
                <font-awesome-icon :icon="['fas', 'plus']" />
                <span>إضافة جديد</span>
            </button>
        </div>

        <div class="content-body">
            <div v-if="loading" class="loader-box">
                <div class="spinner"></div>
                <p>جاري جلب البيانات...</p>
            </div>

            <div v-else-if="error" class="error-box">
                <p>{{ error }}</p>
                <button @click="fetchWillayas" class="retry-btn">إعادة المحاولة</button>
            </div>

            <div v-else-if="filteredWillayas.length > 0" class="table-wrapper">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th style="width: 80px;">الرقم</th>
                            <th>اسم الولاية</th>
                            <th style="width: 120px; text-align: center;">العمليات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="willaya in filteredWillayas" :key="willaya.id">
                            <td><span class="id-badge">{{ willaya.id }}</span></td>
                            <td class="willaya-name">مديرية التربية لولاية <span>{{ willaya.willayaname }}</span></td>
                            <td class="actions">
                                <button class="action-btn edit" @click="editWillaya(willaya)" title="تعديل">
                                    <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                                </button>

                                <button class="action-btn delete" @click="confirmDelete(willaya.id)" title="حذف">
                                    <font-awesome-icon :icon="['fas', 'trash-can']" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-else class="no-data-box">
                <p>لا توجد بيانات تطابق بحثك.</p>
            </div>
        </div>

        <transition name="fade-slide">
            <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
                <div class="modal-card">
                    <div class="modal-header">
                        <div class="header-info">
                            <div class="icon-box">
                                <font-awesome-icon :icon="isEditMode ? ['fas', 'pen-to-square'] : ['fas', 'plus']" />
                            </div>
                            <h3>{{ isEditMode ? 'تعديل بيانات الولاية' : 'إضافة ولاية جديدة' }}</h3>
                        </div>
                        <button type="button" @click="showAddModal = false" class="close-x">&times;</button>
                    </div>

                    <form @submit.prevent="saveNewWillaya">
                        <div class="modal-body">
                            <div class="form-grid">
                                <div class="input-group">
                                    <label>رقم الولاية</label>
                                    <div class="input-field" :class="{ 'disabled-field': isEditMode }">
                                        <input type="number" v-model="newWillaya.id" :disabled="isEditMode"
                                            placeholder="مثلاً: 17" required />
                                    </div>
                                </div>

                                <div class="input-group">
                                    <label>اسم الولاية</label>
                                    <div class="input-field">
                                        <input type="text" v-model="newWillaya.willayaname" placeholder="مثلاً: الجلفة"
                                            required />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button type="submit" class="btn-save" :disabled="isSaving">
                                <span v-if="isSaving">جاري الحفظ...</span>
                                <span v-else>{{ isEditMode ? 'تحديث البيانات' : 'حفظ وإضافة' }}</span>
                            </button>
                            <button type="button" @click="showAddModal = false" class="btn-cancel">إلغاء</button>
                        </div>
                    </form>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import api from '@/api/axios.js';
import Swal from "sweetalert2";

export default {
    name: "WillayaComp",
    data() {
        return {
            searchQuery: "",
            willayas: [],
            loading: true,
            error: null,
            showAddModal: false,
            isEditMode: false,
            isSaving: false,
            newWillaya: {
                id: '',
                willayaname: ''
            }
        };
    },
    computed: {
        filteredWillayas() {
            if (!this.willayas || !Array.isArray(this.willayas)) return [];
            const search = this.searchQuery.toLowerCase().trim();
            return this.willayas.filter(willaya => {
                const name = (willaya.willayaname || "").toString().toLowerCase();
                const id = (willaya.id || "").toString().toLowerCase();
                return name.includes(search) || id.includes(search);
            });
        }
    },
    methods: {
        async fetchWillayas() {
            try {
                this.loading = true;
                const response = await api.get('http://localhost:3000/api/willayas');
                this.willayas = response.data;
            } catch (err) {
                this.error = "فشل في جلب بيانات الولايات";
                console.error(err);
            } finally {
                this.loading = false;
            }
        },

        openAddModal() {
            this.isEditMode = false;
            this.newWillaya = { id: '', willayaname: '' };
            this.showAddModal = true;
        },

        editWillaya(willaya) {
            this.isEditMode = true;
            // نسخ الكائن لفك الارتباط المباشر بالجدول قبل الحفظ
            this.newWillaya = { ...willaya };
            this.showAddModal = true;
        },

        async saveNewWillaya() {
            if (!this.newWillaya.id || !this.newWillaya.willayaname) {
                Swal.fire({
                    icon: 'warning',
                    title: 'بيانات ناقصة',
                    text: 'يرجى إدخال جميع الحقول المطلوبة',
                    confirmButtonColor: '#6f42c1'
                });
                return;
            }

            try {
                this.isSaving = true;
                if (this.isEditMode) {
                    // منطق التعديل
                    const response = await api.put(`http://localhost:3000/api/willayas/${this.newWillaya.id}`, this.newWillaya);
                    const index = this.willayas.findIndex(w => w.id === this.newWillaya.id);
                    if (index !== -1) {
                        this.willayas.splice(index, 1, response.data);
                    }
                    this.showAddModal = false;
                    Swal.fire({ icon: 'success', title: 'تم التحديث بنجاح', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
                } else {
                    // منطق الإضافة
                    const response = await api.post('http://localhost:3000/api/willayas', this.newWillaya);
                    this.willayas.unshift(response.data);
                    this.newWillaya = { id: '', willayaname: '' };
                    Swal.fire({ icon: 'success', title: 'تم الحفظ بنجاح', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
                }
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'خطأ في العملية', text: 'يرجى التأكد من البيانات أو الاتصال بالسيرفر' });
            } finally {
                this.isSaving = false;
            }
        },

        async confirmDelete(id) {
            const result = await Swal.fire({
                title: 'هل أنت متأكد؟',
                text: "سيتم حذف هذه الولاية نهائياً!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'نعم، احذف',
                cancelButtonText: 'إلغاء'
            });

            if (result.isConfirmed) {
                try {
                    await api.delete(`http://localhost:3000/api/willayas/${id}`);
                    this.willayas = this.willayas.filter(w => w.id !== id);
                    Swal.fire({ title: 'تم الحذف!', icon: 'success', timer: 1500, showConfirmButton: false });
                } catch (err) {
                    Swal.fire('خطأ!', 'تعذر حذف البيانات.', 'error');
                }
            }
        }
    },
    mounted() {
        this.fetchWillayas();
    }
};
</script>

<style scoped>
/* 1. الحاوية الكبرى (المسؤولة عن ثبات الصفحة) */
.willaya-container {
    display: flex;
    flex-direction: column;
    /* ضبط الارتفاع ليتناسب مع الشاشة ويمنع السكرول الخارجي */
    height: calc(100vh - 60px);
    padding: 15px;
    gap: 15px;
    direction: rtl;
    font-family: 'Cairo', sans-serif;
    box-sizing: border-box;
    overflow: hidden;
    background-color: #f4f7f6;
    /* خلفية خفيفة للمساحة المحيطة بالجدول */
}

/* 2. رأس الصفحة (العنوان والبحث) */
.page-header {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
    padding: 12px 25px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-title {
    display: flex;
    align-items: center;
    gap: 12px;

}

.header-icon {
    font-size: 1.4rem;
    color: #6f42c1;
}

.header-title h3 {
    font-size: 1.1rem;
    margin: 0;
    color: #2c3e50;
    font-weight: 700;
}

/* 3. صندوق البحث المطور (عرض 600px) */
/* حاوية البحث - تقليص الارتفاع الكلي */
.input-div.long-search {
    display: flex;
    align-items: center;
    width: 600px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    /* الحواف الخارجية للحاوية */
    padding: 0;
    /* حذفنا الـ padding الداخلي ليلتصق الزر بالإطار */
    height: 45px;
    /* تقليص الارتفاع الإجمالي */
    transition: 0.3s;
    overflow: hidden;
    /* لضمان عدم خروج خلفية الأيقونة عن زوايا الحاوية */
}

/* أيقونة البحث - التصاق تام بالجهة اليمنى */
.search-icon {
    background-color: #f3f0ff;
    color: #6f42c1;
    padding: 15px 8px;
    /* height: 100%;  */
    width: 45px;
    /* عرض ثابت ومناسب */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    /* الحواف: دائرية من اليمين (الخارج) ومستقيمة من اليسار (الداخل) */
    border-radius: 0;
    /* تصفير الكل أولاً */
    border-top-right-radius: 9px;
    /* تطابق انحناء الحاوية من الأعلى */
    border-bottom-right-radius: 9px;
    /* تطابق انحناء الحاوية من الأسفل */

    margin-left: 15px;
    /* مباعدة النص عن الأيقونة */
    flex-shrink: 0;
}

/* حقل الإدخال */
.input-div input {
    border: none;
    outline: none;
    width: 100%;
    height: 100%;
    background: transparent;
    font-family: 'Cairo', sans-serif;
    font-size: 0.9rem;
    color: #334155;
}

/* تأثير التفاعل */
.input-div.long-search:focus-within {
    border-color: #6f42c1;
    box-shadow: 0 0 0 3px rgba(111, 66, 193, 0.08);
}

.input-div.long-search:focus-within .search-icon {
    background-color: #6f42c1;
    color: #ffffff;
}

/* إضافة جديد */
/* تنسيق زر الإضافة */
.add-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #6f42c1;
    /* البنفسجي الموحد */
    color: white;
    border: none;
    padding: 6px 15px;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Cairo', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.3s ease;
    margin-right: 20px;
    /* مسافة بين العنوان والزر */
}

.add-btn:hover {
    background-color: #5a32a3;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(111, 66, 193, 0.2);
}

.add-btn:active {
    transform: translateY(0);
}

.add-btn svg {
    font-size: 0.9rem;
}


/* 4. منطقة المحتوى (تمدد لملء الفراغ السفلي) */
.content-body {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    /* ضروري لتفعيل السكرول الداخلي */
}

/* 5. غلاف الجدول (المسؤول عن التمرير) */
.table-wrapper {
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #eef2f6;
    flex-grow: 1;
    overflow-y: auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

/* 6. تنسيق الجدول مع الـ Padding الجانبي الواسع */
.custom-table {
    width: 100%;
    border-collapse: collapse;
    text-align: right;
}

.custom-table th {
    position: sticky;
    top: 0;
    background: #f8fafc;
    /* padding 30px لليمين واليسار لإبعاد المحتوى عن الحواف */
    padding: 12px 30px;
    color: #64748b;
    font-size: 0.85rem;
    font-weight: 700;
    z-index: 10;
    border-bottom: 2px solid #edf2f7;
}

.custom-table td {
    /* padding 30px لليمين واليسار لضمان تناسق المحتوى مع الرأس */
    padding: 10px 30px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 0.95rem;
    color: #334155;
}

.custom-table tr:hover {
    background-color: #f9faff;
}

/* 7. أزرار العمليات والـ Badges */
.actions {
    display: flex;
    gap: 12px;
    justify-content: center;
}

.action-btn {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
}

.edit {
    background: #f0f7ff;
    color: #3498db;
}

.delete {
    background: #fff5f5;
    color: #e74c3c;
}

.action-btn:hover {
    transform: translateY(-2px);
    filter: brightness(0.95);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.id-badge {
    background: #f1f5f9;
    color: #475569;
    padding: 3px 10px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.8rem;
}

.willaya-name {
    font-weight: 600;
    color: #1e293b;
}

.willaya-name>span {
    color: #4604ca;
    font-weight: bold;
}

/* تخصيص السكرول بار ليكون أنيقاً ونحيفاً */
.table-wrapper::-webkit-scrollbar {
    width: 6px;
}

.table-wrapper::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
    background: transparent;
}

/* ============================================================
   MODAL - DARK GLASSMORPHISM STYLE
   ============================================================ */

/* 1. الغطاء الخلفي (الأسود الشفاف مع الضبابية) */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    /* خلفية سوداء شفافة لتركيز النظر على النافذة */
    background: rgba(0, 0, 0, 0.45);
    /* تأثير الزجاج المتجمد */
    backdrop-filter: blur(10px) saturate(140%);
    -webkit-backdrop-filter: blur(10px) saturate(140%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    padding: 20px;
}

/* 2. بطاقة النافذة (The Card) */
.modal-card {
    background: rgba(255, 255, 255, 0.98);
    width: 100%;
    max-width: 480px;
    border-radius: 8px;
    /* ظل عميق ليعطي إيحاء بالارتفاع فوق الخلفية الداكنة */
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.3);
    overflow: hidden;
    position: relative;
}

/* 3. الرأس (Header) */
.modal-header {
    padding: 20px 25px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(to bottom, #fcfaff, #ffffff);
    border-bottom: 1px solid #f1f5f9;
}

.header-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.icon-box {
    width: 42px;
    height: 42px;
    background: #f3f0ff;
    color: #6f42c1;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
}

.modal-header h3 {
    font-size: 1.15rem;
    color: #1e293b;
    margin: 0;
    font-weight: 800;
}

.close-x {
    background: none;
    border: none;
    font-size: 1.8rem;
    color: #94a3b8;
    cursor: pointer;
    transition: 0.2s ease;
    line-height: 1;
}

.close-x:hover {
    color: #e74c3c;
    transform: rotate(90deg);
}

/* 4. محتوى النموذج (Form Body) */
.modal-body {
    padding: 30px 25px;
}

.input-group {
    margin-bottom: 22px;
}

.input-group label {
    display: block;
    margin-bottom: 8px;
    color: #475569;
    font-weight: 700;
    font-size: 0.9rem;
}

.input-field {
    display: flex;
    align-items: center;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 5px;
    padding: 0 15px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-field:focus-within {
    border-color: #6f42c1;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(111, 66, 193, 0.12);
}

.input-field svg {
    color: #94a3b8;
    font-size: 0.9rem;
}

.input-field input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    padding: 5px 15px;
    font-family: 'Cairo', sans-serif;
    font-size: 0.95rem;
    color: #1e293b;
}

/* 5. التذييل (Footer) */
.modal-footer {
    padding: 12px 25px;
    background: #f8fafc;
    display: flex;
    gap: 12px;
}

.btn-save {
    flex: 2;
    background: #6f42c1;
    color: white;
    border: none;
    padding: 5px;
    border-radius: 5px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Cairo', sans-serif;
}

.btn-save:hover {
    background: #5a32a3;
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(111, 66, 193, 0.25);
}

.btn-save:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
    transform: none;
}

.btn-cancel {
    flex: 1;
    background: #ffffff;
    color: #64748b;
    border: 1px solid #e2e8f0;
    padding: 5px;
    border-radius: 5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Cairo', sans-serif;
}

.btn-cancel:hover {
    background: #f1f5f9;
    color: #334155;
    border-color: #cbd5e1;
}

/* 6. تأثيرات الحركة (Transitions) */
.fade-slide-enter-active {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-slide-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
    opacity: 0;
    transform: scale(0.9) translateY(30px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
}
</style>