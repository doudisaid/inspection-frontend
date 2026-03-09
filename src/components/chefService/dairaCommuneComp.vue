<template>
    <div class="main-layout-page">
        <div class="top-section">
            <div class="top-section-header">
                <div class="title-wrapper">
                    <font-awesome-icon :icon="['fas', 'building-columns']" class="icon" />
                    <span>الدوائر والبلديات التابعة لها</span>
                </div>

                <button class="btn-add" @click="showModal = true">
                    <font-awesome-icon :icon="['fas', 'plus']" class="plus-icon" />
                    <span> إضافة دائرة جديدة</span>
                </button>
            </div>
        </div>

        <div class="form-container">
            <div class="styled-form">
                <div class="input-row">
                    <div class="form-group searchable-select-container" v-click-outside="closeDairaList">
                        <label>اسم الدائرة</label>
                        <div class="search-wrapper">
                            <input type="text" v-model="dairaSearchQuery" @focus="isDairaListVisible = true"
                                @keydown.down.prevent="onArrowDown" @keydown.up.prevent="onArrowUp"
                                @keydown.enter.prevent="onEnter" placeholder="ابحث عن دائرة..." class="form-control">
                            <ul v-if="isDairaListVisible && searchedDairas.length" class="search-results-list">
                                <li v-for="(daira, index) in searchedDairas" :key="daira.id"
                                    :class="{ 'highlighted': index === selectedIndex }" @mouseover="selectedIndex = index"
                                    @mousedown="selectDaira(daira)">
                                    <font-awesome-icon :icon="['fas', 'location-dot']" class="li-icon" />
                                    {{ daira.dairaname }}
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>اسم البلدية</label>
                        <input type="text" v-model="newCommuneName" placeholder="أدخل اسم البلدية..."
                            class="form-control">
                    </div>

                    <div class="button-group">
                        <span>عدد البلديات في الدائرة : {{ communes.length }}</span>
                        <button class="btn-save" @click="saveCommune">
                            <font-awesome-icon :icon="['fas', 'floppy-disk']" />
                            حفظ البلدية
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <!-- جدول البلديات حسب الدائرة -->
        <div v-if="selectedDairaId" class="communes-table-container">
            <div class="table-header">
                <h3>
                    <font-awesome-icon :icon="['fas', 'city']" class="table-header-icon" />
                    قائمة البلديات في : {{ dairaSearchQuery }}
                </h3>
            </div>

            <table class="custom-table">
                <thead>
                    <tr>
                        <th>الرقم</th>
                        <th>اسم البلدية</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(commune, index) in communes" :key="commune.id">
                        <td>{{ index + 1 }}</td>
                        <td>{{ commune.communename }}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-action btn-edit" @click="editCommune(commune)">
                                    <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                                </button>

                                <button class="btn-action btn-delete" @click="deleteCommune(commune.id)">
                                    <font-awesome-icon :icon="['fas', 'trash-can']" />
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="communes.length === 0">
                        <td colspan="3" class="empty-state">لا توجد بلديات مضافة لهذه الدائرة بعد.</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <transition name="fade">
            <div v-if="showModal" class="modal-overlay" @click.self="showModal = false; resetForm()">
                <div class="glass-modal">
                    <div class="modal-header">
                        <h3>
                            <font-awesome-icon :icon="['fas', isEditing ? 'pen-to-square' : 'map-location-dot']"
                                class="modal-header-icon" />
                            {{ isEditing ? 'تعديل بيانات الدائرة' : 'إضافة دائرة جديدة' }}
                        </h3>
                        <button class="close-btn" @click="showModal = false; resetForm()">&times;</button>
                    </div>

                    <form @submit.prevent="saveDistrict" class="modal-form">
                        <div class="form-group" style="width: 100%;">
                            <label>{{ isEditing ? 'اسم الدائرة الحالي' : 'اسم الدائرة الجديد' }}</label>
                            <input type="text" v-model="newDistrictName" placeholder="مثال: دائرة سيدي عقبة" required />
                        </div>

                        <div class="modal-footer-buttons">
                            <button type="submit" class="btn-modal-save">
                                <font-awesome-icon :icon="['fas', 'check']" />
                                {{ isEditing ? 'حفظ التعديلات' : 'تأكيد الإضافة' }}
                            </button>
                            <button type="button" class="btn-modal-cancel" @click=" resetForm()">
                                <font-awesome-icon :icon="['fas', 'xmark']" />
                                إلغاء
                            </button>
                        </div>
                    </form>

                    <hr class="modal-divider" />

                    <div class="table-section">
                        <h4>الدوائر المسجلة حالياً (ولاية: {{ user.idwillaya }})</h4>
                        <div class="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th class="text-center">الرقم</th>
                                        <th>اسم الدائرة</th>
                                        <th>كود الولاية</th>
                                        <th class="text-center">العمليات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, index) in filteredDistricts" :key="item.id">
                                        <td class="num-daira">{{ index + 1 }}</td>
                                        <td>{{ item.dairaname }}</td>
                                        <td>{{ item.idwillaya }}</td>
                                        <td class="actions-cell">
                                            <button class="btn-action edit" @click="editDistrict(item)" title="تعديل">
                                                <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                                            </button>
                                            <button class="btn-action delete" @click="deleteDistrict(item.id)"
                                                title="حذف">
                                                <font-awesome-icon :icon="['fas', 'trash-can']" />
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="filteredDistricts.length === 0">
                                        <td colspan="4" class="no-results">لا توجد دوائر مسجلة لهذه الولاية حالياً.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
import api from '@/api/axios.js';
import Swal from 'sweetalert2';

export default {
    name: "dairaCommuneComp",
    directives: {
        clickOutside: {
            beforeMount(el, binding) {
                el.clickOutsideEvent = (event) => {
                    if (!(el === event.target || el.contains(event.target))) {
                        binding.value();
                    }
                };
                document.addEventListener("click", el.clickOutsideEvent);
            },
            unmounted(el) {
                document.removeEventListener("click", el.clickOutsideEvent);
            },
        },
    },
    data() {
        return {
            showModal: false,
            isEditing: false,
            editId: null,
            districts: [],        // الدوائر القادمة من السيرفر
            communes: [],         // البلديات التابعة للدائرة المختارة
            newDistrictName: '',
            newCommuneName: '',
            dairaSearchQuery: '',
            isDairaListVisible: false,
            selectedIndex: -1,
            selectedDairaId: '',
            user: { idwillaya: null }
        }
    },
    computed: {
        // تصفية الدوائر حسب ولاية المستخدم
        filteredDistricts() {
            if (!this.districts || this.districts.length === 0) return [];
            return this.districts.filter(d => String(d.idwillaya) === String(this.user.idwillaya));
        },
        // البحث في الدوائر المصفاة
        searchedDairas() {
            if (!this.dairaSearchQuery) return this.filteredDistricts;
            const query = this.dairaSearchQuery.toLowerCase();
            return this.filteredDistricts.filter(d => d.dairaname.toLowerCase().includes(query));
        }
    },
    methods: {
        // --- إدارة البحث والاختيار ---
        onArrowDown() {
            if (this.selectedIndex < this.searchedDairas.length - 1) this.selectedIndex++;
        },
        onArrowUp() {
            if (this.selectedIndex > 0) this.selectedIndex--;
        },
        onEnter() {
            if (this.selectedIndex !== -1) this.selectDaira(this.searchedDairas[this.selectedIndex]);
        },
        closeDairaList() {
            this.isDairaListVisible = false;
            this.selectedIndex = -1;
        },
        async selectDaira(daira) {
            this.selectedDairaId = daira.id;
            this.dairaSearchQuery = daira.dairaname;
            this.isDairaListVisible = false;
            this.selectedIndex = -1;

            // جلب البلديات بمجرد اختيار الدائرة
            await this.fetchCommunes(daira.id);
        },

        // --- جلب البيانات من السيرفر ---
        loadUserData() {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                this.user.idwillaya = parsedUser.idwillaya || parsedUser.willaya_id;
            }
        },
        async fetchDairas() {
            this.loadUserData();
            if (!this.user.idwillaya) return;
            try {
                const response = await api.get(`/dairas/willaya/${this.user.idwillaya}`);
                this.districts = Array.isArray(response.data) ? response.data : [];
            } catch (error) { console.error("Error fetching districts:", error); }
        },
        async fetchCommunes(dairaId) {
            try {
                // جلب قائمة البلديات كـ Objects
                const response = await api.get(`/communes/daira/${dairaId}`);
                this.communes = Array.isArray(response.data) ? response.data : [];
            } catch (error) {
                console.error("Error fetching communes:", error);
                this.communes = [];
            }
        },

        // --- عمليات الحفظ والتعديل ---
        async saveDistrict() {
            if (!this.newDistrictName.trim()) return;
            try {
                if (this.isEditing) {
                    await api.put(`/dairas/${this.editId}`, { dairaname: this.newDistrictName });
                } else {
                    await api.post('/dairas', { dairaname: this.newDistrictName, idwillaya: this.user.idwillaya });
                }
                this.resetForm();
                this.showModal = false;
                await this.fetchDairas();
                this.showAlert('تمت العملية بنجاح');
            } catch (error) { this.showAlert('خطأ في الاتصال', 'error'); }
        },
        async saveCommune() {
            if (!this.selectedDairaId || !this.newCommuneName.trim()) {
                this.showAlert('يرجى ملء كافة البيانات', 'error');
                return;
            }
            try {
                const response = await api.post('/communes', {
                    communename: this.newCommuneName,
                    iddaira: this.selectedDairaId
                });

                // تحديث قائمة البلديات محلياً (إضافة الكائن الجديد)
                if (response.data) {
                    // إذا كان السيرفر يعيد الكائن المضاف، ندفعه للمصفوفة
                    this.communes.push(response.data.data || response.data);
                } else {
                    // إذا لم يعد الكائن، نعيد جلب القائمة من السيرفر
                    await this.fetchCommunes(this.selectedDairaId);
                }

                this.newCommuneName = '';
                this.showAlert('تم حفظ البلدية بنجاح');
            } catch (error) { this.showAlert('فشل الحفظ', 'error'); }
        },

        // --- الحذف والتعديل ---
        editDistrict(item) {
            this.isEditing = true;
            this.editId = item.id;
            this.newDistrictName = item.dairaname;
            this.showModal = true;
        },
        async deleteDistrict(id) {
            const result = await Swal.fire({
                title: 'هل أنت متأكد؟', text: "سيتم حذف الدائرة نهائياً", icon: 'warning',
                showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
                confirmButtonText: 'نعم، احذف', cancelButtonText: 'إلغاء'
            });
            if (result.isConfirmed) {
                try {
                    await api.delete(`/dairas/${id}`);
                    await this.fetchDairas();
                    if (this.selectedDairaId === id) {
                        this.selectedDairaId = '';
                        this.communes = [];
                        this.dairaSearchQuery = '';
                    }
                    this.showAlert('تم الحذف بنجاح');
                } catch (error) { this.showAlert('فشل الحذف', 'error'); }
            }
        },

        // --- المساعدات ---
        showAlert(title, icon = 'success') {
            Swal.fire({
                title: title, icon: icon, timer: 2000, showConfirmButton: false,
                toast: true, position: 'top-end', timerProgressBar: true
            });
        },
        resetForm() {
            this.newDistrictName = '';
            this.isEditing = false;
            this.editId = null;
        }
    },
    mounted() {
        this.fetchDairas();
    }
}
</script>

<style scoped>
/* 1. التنسيقات العامة */
.main-layout-page {
    direction: rtl;
    font-family: 'Cairo', sans-serif;
    background-color: #f8f9fa;
    min-height: calc(100vh - 95px);
    padding: 0;
    margin: 0;
}

/* 2. الهيدر */
.top-section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    padding: 12px;
    border-bottom: 2px solid #eee;
    margin-bottom: 12px;
    border-radius: 8px;
}

.title-wrapper {
    display: flex;
    align-items: center;
    gap: 15px;
    font-size: 1rem;
    font-weight: bold;
    color: #2c3e50;
}

.icon {
    color: #764ba2;
}

.plus-icon {
    color: #fff;
}

/* 3. الأزرار */
.btn-add,
.btn-save,
.btn-modal-save {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    color: white;
    border: none;
    border-radius: 8px;
    font-family: 'Cairo', sans-serif;
    cursor: pointer;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 4px 12px rgba(118, 75, 162, 0.2);
}

.btn-add,
.btn-save {
    width: 180px;
    padding: 8px 20px;
}

.btn-modal-save {
    width: 100%;
    padding: 8px;
    margin-top: 15px;
    font-weight: bold;
}

.btn-add:hover,
.btn-save:hover,
.btn-modal-save:hover {
    transform: translateY(-2px);
    opacity: 0.9;
}

/* 4. النموذج */
.form-container {
    background: white;
    border: 1px solid #ddd;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    width: 100%;
}

.styled-form {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    border-radius: 12px;
    background: #f8fafc;
    min-height: 100px;
}

.input-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.form-group {
    display: flex;
    flex-direction: column;
    width: 40%;
    gap: 5px;
    padding: 12px;
}

.form-group label {
    font-size: 14px;
    font-weight: 600;
    color: #444;
}

.form-group input {
    padding: 8px;
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-family: 'Cairo', sans-serif;
    outline: none;
    transition: border-color 0.3s;
}

.form-group input:focus {
    border-color: #3498db;
}

/* 5. البحث الذكي والقائمة المنسدلة */
.searchable-select-container {
    position: relative;
}

.search-wrapper {
    position: relative;
    width: 100%;
}

.search-wrapper .li-icon {
    color: #2c3e50;
}

.search-results-list {
    position: absolute;
    top: 38px;
    width: 100%;
    max-height: 250px;
    overflow-y: auto;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    z-index: 9999 !important;
    list-style: none;
    padding: 0;
    margin-top: 5px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.search-results-list li {
    padding: 10px;
    color: #2c3e50;
    cursor: pointer;
    border-bottom: 1px solid #eee;
    font-size: 14px;
    transition: all 0.2s;
}

.search-results-list li:hover,
.search-results-list li.highlighted {
    background-color: #f0f7ff;
    color: #764ba2;
    border-right: 4px solid #764ba2;
}

.button-group {
    padding: 0 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    align-items: center;
    height: 100%;
}

.button-group>span {
    font-size: 12px;
    font-weight: 700
}

/* 6. المودال */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.glass-modal {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    width: 600px;
    max-width: 90%;
    padding: 15px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.modal-header h3 {
    display: flex;
    align-items: center;
    gap: 15px;
    font-size: 18px;
    color: #2c3e50;
    margin: 0;
}

.close-btn {
    font-size: 20px;
    background-color: #d1aff3;
    border: none;
    width: 35px;
    height: 35px;
    color: #fff;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.close-btn:hover {
    background-color: #c084fc;
    transform: rotate(90deg);
}

.modal-form .form-group {
    background-color: #f8fafc;
    border-radius: 8px;
    border: 1px solid #ddd;
}

/* 7. الجدول */
.table-wrapper {
    max-height: 200px;
    overflow-y: auto;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.5);
    margin-top: 10px;
}

table {
    width: 100%;
    border-collapse: collapse;
    text-align: right;
}

th {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: #f8fafc;
    color: #764ba2;
    font-weight: 700;
    padding: 5px 8px;
    border-bottom: 2px solid rgba(118, 75, 162, 0.1);
}

td {
    padding: 5px 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.actions-cell {
    display: flex;
    justify-content: center;
    gap: 8px;
}

.btn-action {
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-action.edit {
    background-color: rgba(52, 152, 219, 0.15);
    color: #3498db;
}

.btn-action.delete {
    background-color: rgba(231, 76, 60, 0.15);
    color: #e74c3c;
}

/* تنسيق حاوية الأزرار في المودال */
.modal-footer-buttons {
    display: flex;
    gap: 10px;
    margin-top: 15px;
}

/* زر الحفظ (تعديل العرض ليتناسب مع وجود زر آخر) */
.btn-modal-save {
    flex: 2;
    /* يأخذ مساحة أكبر */
    margin-top: 0 !important;
    /* إلغاء المارجن العلوي القديم */
}

/* زر الإلغاء الجديد */
.btn-modal-cancel {
    flex: 1;
    /* يأخذ مساحة أصغر */
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    background: #ececec;
    color: #555;
    border: none;
    border-radius: 8px;
    font-family: 'Cairo', sans-serif;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-modal-cancel:hover {
    background: #ddd;
    color: #333;
}

/* لضمان التوافق مع الهواتف */
@media (max-width: 480px) {
    .modal-footer-buttons {
        flex-direction: column;
    }
}

/* 8. الانتقالات */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.no-results {
    color: #888;
    text-align: center;
    padding: 20px;
}

/* 9 communes-table-container */
.communes-table-container {
    margin-top: 15px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    border: 1px solid #eee;
}

.table-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 8px 15px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e2b1f5;
}
.table-header-icon{
    color: #764ba2;
    margin-left: 20px;
}

.table-header h3 {
    margin: 0;
    color: #2c3e50;
    font-size: 0.9rem;
}

.custom-table {
    width: 98%;
    margin: 15px auto;
    border: 1px solid #f7f5f5;
    border-radius: 12px;
    border-collapse: collapse;
    text-align: right;
}

.custom-table th {
    background-color: #f8f9fa;
    color: #7f8c8d;
    padding: 5px 15px;
    font-weight: 600;
    text-align: center;
    text-transform: uppercase;
    font-size: 0.85rem;
}

.custom-table td {
    padding: 5px 15px;
    text-align: center;
    font-size: 0.85rem;
    border-bottom: 1px solid #eee;
    color: #34495e;
}

.custom-table tbody tr:hover {
    background-color: #f1f7fd;
    transition: 0.3s;
}

/* حاوية الأزرار */
.action-buttons {
    display: flex;
    gap: 10px; /* المسافة بين الزرين */
    justify-content: center;
}

/* التنسيق المشترك للأزرار (المربعات) */
.btn-action {
    width: 38px;
    height: 38px;
    border: none;
    border-radius: 10px; /* زوايا منحنية مثل الصورة */
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

/* زر التعديل (أزرق) */
.btn-edit {
    background-color: #e3f2fd; /* خلفية زرقاء باهتة جداً */
    color: #2196f3;           /* أيقونة زرقاء */
}

.btn-edit:hover {
    background-color: #2196f3;
    color: white;
}

/* زر الحذف (أحمر) */
.btn-delete {
    background-color: #ffebee; /* خلفية حمراء باهتة جداً */
    color: #ef5350;           /* أيقونة حمراء */
}

.btn-delete:hover {
    background-color: #ef5350;
    color: white;
}

/* تأثير الضغط على الزر */
.btn-action:active {
    transform: scale(0.9);
}

.empty-state {
    text-align: center;
    padding: 30px !important;
    color: #bdc3c7;
    font-style: italic;
}
/* 10. تنسيقات شاشات الموبايل والتابلت */
@media (max-width: 768px) {
    /* تعديل الهيدر ليصبح عمودياً */
    .top-section-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }

    .title-wrapper {
        justify-content: center;
    }

    /* تحويل النموذج (Form) من عرض أفقي إلى عمودي */
    .styled-form {
        flex-direction: column;
        align-items: center;
        padding-bottom: 15px;
    }

    .input-row {
        flex-direction: column;
        width: 100%;
    }

    .form-group {
        width: 90% !important; /* جعل الحقول تأخذ كامل العرض */
        padding: 8px 0;
    }

    /* زر الإضافة والحفظ في الموبايل */
    .btn-add, .btn-save {
        width: 100%;
        margin-top: 10px;
    }

    .button-group {
        width: 90%;
        padding: 10px 0;
    }

    /* تعديل الجدول ليصبح قابلاً للتمرير الأفقي */
    .table-wrapper, .communes-table-container {
        overflow-x: auto;
    }

    .custom-table {
        min-width: 500px; /* لضمان عدم تكدس البيانات */
    }

    /* تصغير حجم الخطوط قليلاً لتناسب الشاشة */
    .table-header h3 {
        font-size: 0.8rem;
    }

    /* تعديل المودال (Glass Modal) */
    .glass-modal {
        width: 95%;
        padding: 10px;
    }

    .modal-header h3 {
        font-size: 16px;
    }
}

/* تعديلات إضافية للشاشات الصغيرة جداً (أقل من 480px) */
@media (max-width: 480px) {
    .btn-action {
        width: 32px; /* تصغير أزرار التعديل والحذف قليلاً */
        height: 32px;
    }

    .custom-table th, .custom-table td {
        padding: 5px 8px;
        font-size: 0.75rem;
    }
}
</style>