<template>
    <div class="academic-setting-wrapper">
        <div class="config-section Section-card">
            <header class="section-header content-fade-in">
                <div class="title-wrapper">
                    <div class="header-icon-container">
                        <font-awesome-icon :icon="['fas', 'map-location-dot']" class="header-icon" />
                    </div>
                    <div class="text-group">
                        <span class="main-title">إدارة المقاطعات البيداغوجية</span>
                    </div>
                </div>
                <div class="active-year-badge shadow-sm">
                    إجمالي المقاطعات: {{ secteurs.length }}
                </div>
            </header>

            <div class="toolbar-section">
                <div class="form">
                    <div class="search-box">
                        <div class="custom-input-group focus-ring">
                            <div class="icon-addon">
                                <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                            </div>
                            <input type="text" v-model="searchQuery" class="custom-input"
                                placeholder="ابحث باسم المقاطعة، المفتش، الدائرة أو البلدية..." />
                        </div>
                    </div>

                    <div class="action-group">
                        <button class="base-btn add-btn ripple" @click="showModal = true">
                            <font-awesome-icon :icon="['fas', 'plus']" />
                            <span>إضافة مقاطعة</span>
                        </button>
                    </div>
                </div>

                <div class="table-container custom-scrollbar">
                    <table class="custom-table table-hover">
                        <thead>
                            <tr>
                                <th width="80px" class="text-center">الرقم</th>
                                <th>اسم المقاطعة</th>
                                <th>المفتش المسؤول</th>
                                <th>الدائرة</th>
                                <th>البلدية</th>
                                <th width="120px" class="text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="isLoading">
                                <td colspan="6" class="loader-cell">
                                    <div class="shimmer-loader">جاري جلب البيانات...</div>
                                </td>
                            </tr>

                            <tr v-for="(secteur, index) in filteredSecteurs" :key="secteur.id" class="table-row">
                                <td class="text-center id-cell">{{ index + 1 }}</td>

                                <td>
                                    <div class="primary-text">{{ secteur.secteurname }}</div>
                                </td>

                                <td>
                                    <div class="user-badge" v-if="secteur.inspector">
                                        {{ secteur.inspector.name || secteur.inspector.username }}
                                    </div>
                                    <span v-else class="text-muted">غير معين</span>
                                </td>

                                <td>
                                    <div class="commune-info" v-if="secteur.Commune && secteur.Commune.Daira">
                                        {{ secteur.Commune.Daira.dairaname }}
                                    </div>
                                    <span v-else class="text-muted">غير محدد</span>
                                </td>

                                <td>
                                    <div class="commune-info" v-if="secteur.Commune">
                                        {{ secteur.Commune.communename }}
                                    </div>
                                    <span v-else class="text-muted">غير محدد</span>
                                </td>

                                <td>
                                    <div class="btn-container j-center">
                                        <button class="btn-icon edit-h" title="تعديل" @click="editSecteur(secteur)">
                                            <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                                        </button>
                                        <button class="btn-icon delete-h" title="حذف"
                                            @click="deleteSecteur(secteur.id)">
                                            <font-awesome-icon :icon="['fas', 'trash-can']" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <Transition name="modal-zoom">
            <div v-if="showModal" class="custom-modal-overlay" @click.self="closeModal">
                <div class="custom-modal-content wide-modal shadow-lg">
                    <div class="modal-header-banner" :class="isEditing ? 'edit-mode' : 'add-mode'">
                        <font-awesome-icon :icon="isEditing ? ['fas', 'pen-to-square'] : ['fas', 'circle-plus']"
                            class="banner-icon" />
                        <h4 class="banner-title">{{ isEditing ? 'تعديل بيانات المقاطعة' : 'إضافة مقاطعة جديدة' }}</h4>
                        <button class="close-modal-btn" @click="closeModal">&times;</button>
                    </div>

                    <div class="modal-body p-20">
                        <div class="modal-grid">
                            <div class="modal-form-group full-width">
                                <label class="required-label">اسم المقاطعة البيداغوجية</label>
                                <div class="custom-input-group focus-ring">
                                    <div class="icon-addon"><font-awesome-icon :icon="['fas', 'map-pin']" /></div>
                                    <input type="text" v-model="newSecteur.secteurname" class="custom-input"
                                        placeholder="مثال: مقاطعة مروانة 01">
                                </div>
                            </div>

                            <div class="modal-form-group">
                                <label>المفتش المسؤول</label>
                                <div class="custom-input-group focus-ring searchable-dropdown">
                                    <div class="icon-addon"><font-awesome-icon :icon="['fas', 'user-tie']" /></div>
                                    <input type="text" class="custom-input" v-model="inspectorSearch"
                                        @focus="openInspectorList" @blur="hideInspectorList"
                                        @keydown="onInspectorKeydown" placeholder="ابحث عن مفتش...">

                                    <ul v-if="showInspectorList" class="dropdown-list custom-scrollbar">
                                        <li v-for="(ins, index) in filteredInspectors" :key="ins.id"
                                            :id="'ins-' + index" :class="{ 'highlighted': index === inspectorIndex }"
                                            @mousedown="selectInspector(ins)">
                                            {{ ins.name || ins.username }}
                                        </li>
                                        <li v-if="filteredInspectors.length === 0" class="no-result">لا توجد نتائج</li>
                                    </ul>
                                </div>
                            </div>

                            <div class="modal-form-group">
                                <label class="required-label">البلدية التابعة لها</label>
                                <div class="custom-input-group focus-ring searchable-dropdown">
                                    <div class="icon-addon"><font-awesome-icon :icon="['fas', 'city']" /></div>
                                    <input type="text" class="custom-input" v-model="communeSearch"
                                        @focus="openCommuneList" @blur="hideCommuneList" @keydown="onCommuneKeydown"
                                        placeholder="ابحث عن بلدية...">

                                    <ul v-if="showCommuneList" class="dropdown-list custom-scrollbar">
                                        <li v-for="(com, index) in filteredCommunesInsideModal" :key="com.id"
                                            :id="'com-' + index" :class="{ 'highlighted': index === communeIndex }"
                                            @mousedown="selectCommune(com)">
                                            {{ com.communename }}
                                        </li>
                                        <li v-if="filteredCommunesInsideModal.length === 0" class="no-result">لا توجد
                                            نتائج</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer bg-light">
                        <button class="base-btn cancel-btn ripple" @click="closeModal">إلغاء الأمر</button>
                        <button class="base-btn submit-btn ripple" @click="saveSecteur">
                            <font-awesome-icon :icon="['fas', 'check']" class="m-left-5" />
                            {{ isEditing ? 'تحديث البيانات' : 'حفظ المقاطعة' }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script>
import api from '@/api/axios';
import Swal from 'sweetalert2';

export default {
    name: 'SecteurComp',
    data() {
        return {
            showModal: false,
            isEditing: false,
            isLoading: false,
            currentId: null,
            searchQuery: '',

            inspectorSearch: '',
            showInspectorList: false,
            inspectorIndex: -1,

            communeSearch: '',
            showCommuneList: false,
            communeIndex: -1,

            newSecteur: {
                secteurname: '',
                user_id: null,
                idcommune: null
            },
            secteurs: [],
            inspectorsList: [],
            communesList: [],
        }
    },
    computed: {
        filteredInspectors() {
            const list = this.inspectorsList || [];
            const s = (this.inspectorSearch || '').toLowerCase();
            return list.filter(i => (i.name || i.username || '').toLowerCase().includes(s));
        },
        filteredCommunesInsideModal() {
            const list = this.communesList || [];
            const s = (this.communeSearch || '').toLowerCase();
            return list.filter(c => (c.communename || '').toLowerCase().includes(s));
        },
        filteredSecteurs() {
            const list = this.secteurs || [];
            if (!this.searchQuery) return list;
            const search = this.searchQuery.toLowerCase();
            return list.filter(s => {
                const nameMatch = s.secteurname?.toLowerCase().includes(search);
                const inspectorMatch = (s.inspector?.name || s.inspector?.username || '').toLowerCase().includes(search);
                const communeMatch = (s.Commune?.communename || '').toLowerCase().includes(search);
                return nameMatch || inspectorMatch || communeMatch;
            });
        }
    },
    mounted() {
        this.fetchInitialData();
    },
    methods: {
        async fetchInitialData() {
            this.isLoading = true;
            this.secteurs = [];
            this.inspectorsList = [];
            this.communesList = [];
            try {
                const user = JSON.parse(localStorage.getItem('user'));

                // التأكد من وجود user و willaya_id لتجنب الأخطاء
                if (!user || !user.willaya_id) {
                    console.error("لم يتم العثور على بيانات المستخدم أو رقم الولاية");
                    return;
                }

                const wId = user.willaya_id;

                const [resS, resI, resC] = await Promise.all([
                    // تصحيح: إضافة الفلترة للمقاطعات أيضاً بناءً على الولاية
                    api.get(`/secteurs?willaya_id=${wId}`),
                    api.get(`/users/role/2?willaya_id=${wId}`),
                    api.get(`/communes?willaya_id=${wId}`)
                ]);

                this.secteurs = resS.data?.data || resS.data || [];
                this.inspectorsList = resI.data?.data || resI.data || [];
                this.communesList = resC.data?.data || resC.data || [];

            } catch (error) {
                this.handleApiError(error);
            } finally {
                this.isLoading = false;
            }
        },

        fixScroll(type, index) {
            this.$nextTick(() => {
                const item = document.getElementById(`${type}-${index}`);
                if (item) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            });
        },

        // إدارة المفتش
        openInspectorList() {
            this.showInspectorList = true;
            this.showCommuneList = false;
            this.inspectorIndex = -1;
        },
        hideInspectorList() {
            setTimeout(() => { this.showInspectorList = false; }, 250);
        },
        onInspectorKeydown(e) {
            if (!this.showInspectorList) return;
            if (e.key === 'ArrowDown') {
                if (this.inspectorIndex < this.filteredInspectors.length - 1) {
                    this.inspectorIndex++;
                    this.fixScroll('ins', this.inspectorIndex);
                }
            } else if (e.key === 'ArrowUp') {
                if (this.inspectorIndex > 0) {
                    this.inspectorIndex--;
                    this.fixScroll('ins', this.inspectorIndex);
                }
            } else if (e.key === 'Enter' && this.inspectorIndex >= 0) {
                this.selectInspector(this.filteredInspectors[this.inspectorIndex]);
            }
        },
        selectInspector(ins) {
            this.newSecteur.user_id = ins.id;
            this.inspectorSearch = ins.name || ins.username;
            this.showInspectorList = false;
        },

        // إدارة البلدية
        openCommuneList() {
            this.showCommuneList = true;
            this.showInspectorList = false;
            this.communeIndex = -1;
        },
        hideCommuneList() {
            setTimeout(() => { this.showCommuneList = false; }, 250);
        },
        onCommuneKeydown(e) {
            if (!this.showCommuneList) return;
            if (e.key === 'ArrowDown') {
                if (this.communeIndex < this.filteredCommunesInsideModal.length - 1) {
                    this.communeIndex++;
                    this.fixScroll('com', this.communeIndex);
                }
            } else if (e.key === 'ArrowUp') {
                if (this.communeIndex > 0) {
                    this.communeIndex--;
                    this.fixScroll('com', this.communeIndex);
                }
            } else if (e.key === 'Enter' && this.communeIndex >= 0) {
                this.selectCommune(this.filteredCommunesInsideModal[this.communeIndex]);
            }
        },
        selectCommune(com) {
            this.newSecteur.idcommune = com.id;
            this.communeSearch = com.communename;
            this.showCommuneList = false;
        },

        async saveSecteur() {
            // التأكد من وجود القيم المطلوبة
            if (!this.newSecteur.secteurname || !this.newSecteur.idcommune) {
                this.showAlert('يرجى ملء الحقول الإجبارية (الاسم والبلدية)', 'warning');
                return;
            }

            try {
                const payload = {
                    secteurname: this.newSecteur.secteurname,
                    user_id: this.newSecteur.user_id || null, // المفتش اختياري
                    idcommune: parseInt(this.newSecteur.idcommune)
                };

                if (this.isEditing) {
                    await api.put(`/secteurs/${this.currentId}`, payload);
                } else {
                    await api.post('/secteurs', payload);
                }

                // إغلاق المودال أولاً ثم إظهار رسالة النجاح لتجنب تداخل الطبقات
                const successMsg = this.isEditing ? 'تم تحديث البيانات بنجاح' : 'تمت إضافة المقاطعة بنجاح';
                this.closeModal();
                this.showAlert(successMsg, 'success');
                this.fetchInitialData();

            } catch (error) {
                this.handleApiError(error);
            }
        },

        async deleteSecteur(id) {
            const result = await Swal.fire({
                title: 'هل أنت متأكد؟',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم، احذف',
                cancelButtonText: 'إلغاء'
            });
            if (result.isConfirmed) {
                try {
                    await api.delete(`/secteurs/${id}`);
                    this.fetchInitialData();
                    this.showAlert('تم الحذف', 'success');
                } catch (error) { this.handleApiError(error); }
            }
        },

        editSecteur(secteur) {
            this.isEditing = true;
            this.currentId = secteur.id;
            this.newSecteur = { secteurname: secteur.secteurname, user_id: secteur.user_id, idcommune: secteur.idcommune };
            this.inspectorSearch = secteur.inspector ? (secteur.inspector.name || secteur.inspector.username) : '';
            this.communeSearch = secteur.Commune ? secteur.Commune.communename : '';
            this.showModal = true;
        },

        closeModal() {
            this.showModal = false;
            this.isEditing = false;
            this.newSecteur = { secteurname: '', user_id: null, idcommune: null };
            this.inspectorSearch = '';
            this.communeSearch = '';
            this.showInspectorList = this.showCommuneList = false;
        },

        // تحديث دالة إظهار التنبيه
        showAlert(msg, icon) {
            // نبحث عن حاوية المودال
            const modalContainer = document.querySelector('.custom-modal-overlay');

            Swal.fire({
                title: msg,
                icon: icon,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                /* الحل السحري: إذا كان المودال مفتوحاً، اجعل الرسالة تظهر بداخله. 
                   إذا كان مغلقاً، اجعلها تظهر في الـ body كالمعتاد.
                */
                target: modalContainer ? modalContainer : 'body'
            });
        },

        handleApiError(error) {
            this.showAlert(error.response?.data?.message || "خطأ في الاتصال", 'error');
        }
    }
}
</script>

<style scoped>
/* --- الحاوية الرئيسية --- */
.academic-setting-wrapper {
    display: flex;
    flex-direction: column;
    direction: rtl;
    height: calc(100vh - 65px);
    /* الطول الكامل المتاح */
    padding: 15px;
    background-color: #f8f9fa;
    box-sizing: border-box;
    font-family: 'Cairo', sans-serif;
    overflow: hidden;
    /* لمنع التمرير الخارجي المزدوج */
}

/* --- البطاقة الرئيسية --- */
.config-section {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    /* الحفاظ على العناصر داخل البطاقة */
}

/* --- الترويسة --- */
.section-header {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
    margin-bottom: 12px;
}

.title-wrapper {
    display: flex;
    align-items: center;
    gap: 15px;
}

.header-icon-container {
    color: #6d28d9;
}

.main-title {
    font-size: 1rem;
    font-weight: 800;
    color: #2c3e50;
}

.active-year-badge {
    background: #f0ebf8;
    color: #96619b;
    padding: 6px 16px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.85rem;
}

/* --- شريط الأدوات (الإصلاح الجوهري هنا) --- */
.toolbar-section {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    /* منع تقلص منطقة البحث */
    background: #fff;
    border-radius: 8px;
    height: calc(100vh - 170px);
    padding: 15px;
    margin-bottom: 12px;
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
}

.form {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    width: 100%;
    background: #f8fafc;
    padding: 15px;
    border-radius: 8px;
    flex-wrap: wrap;
    box-shadow: inset 0 0 0 1px #e2e8f0;
}

.search-box {

    min-width: 50%;
}

.custom-input-group {
    display: flex;
    align-items: center;
    /* width: 50%; */
    background: #fff;
    border: 1px solid #e4e7e9;
    border-radius: 8px;
    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}


.custom-input-group:focus-within {
    border-color: #764ba2;
    box-shadow: 0 0 0 4px rgba(118, 75, 162, 0.1);
}

.icon-addon {
    padding: 0 15px;
    color: #a0aec0;
}

.custom-input {
    flex: 1;
    height: 45px;
    border: none !important;
    background: transparent;
    font-family: inherit;
    font-size: 0.95rem;
    outline: none;
}

.empty-icon {
    color: #6d28d9;
}

/* --- الأزرار --- */
.base-btn,
.submit-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'cairo', sans-serif;
    gap: 8px;
    color: #fff;
    padding: 8px 24px;
    border-radius: 5px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    transition: 0.3s;
}

.base-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(118, 75, 162, 0.4);
}

/* --- حاوية الجدول (الإصلاح الجوهري هنا) --- */
.table-container {
    flex: 1;
    /* ستأخذ كل المساحة المتبقية تلقائياً */
    overflow-y: auto;
    border-radius: 8px;
    margin-top: 15px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);
}

.custom-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    text-align: right;
}

.custom-table th {
    position: sticky;
    top: 0;
    background: #f8fafc;
    padding: 5px 16px;
    font-weight: 800;
    color: #475569;
    font-size: 0.8rem;
    z-index: 10;
    border-bottom: 2px solid #e2e8f0;
    white-space: nowrap;
}

.custom-table td {
    padding: 5px 16px;
    vertical-align: middle;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
    font-size: 0.85rem;
}

.table-row:hover td {
    background-color: #f1f5f9;
}

/* --- الإجراءات في الجدول --- */
.btn-container {
    display: flex;
    gap: 8px;
    justify-content: center;
}

.btn-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    transition: 0.2s;
    cursor: pointer;
}

.btn-icon.edit-h {
    background: #eef2ff;
    color: #4f46e5;
}

.btn-icon.edit-h:hover {
    background: #4f46e5;
    color: white;
}

.btn-icon.delete-h {
    background: #fff1f2;
    color: #e11d48;
}

.btn-icon.delete-h:hover {
    background: #e11d48;
    color: white;
}

/* --- المودال --- */
.custom-modal-overlay {
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(8px);
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 20px;
}

.custom-modal-content {
    background: #ffffff;
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header-banner {
    padding: 0 30px;
    display: flex;
    align-items: center;
    gap: 15px;
    color: white;
}

.modal-header-banner .banner-icon {
    font-size: 25px;
}

.modal-header-banner.add-mode {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.modal-header-banner.edit-mode {
    background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
}

.close-modal-btn {
    margin-right: auto;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 25px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    /* إضافة سلاسة في الحركة */
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

/* تأثير الـ Hover */
.close-modal-btn:hover {
    background: rgba(255, 255, 255, 0.4);
    /* تفتيح الخلفية */
    transform: rotate(90deg);
    /* تدوير الزر لإعطاء لمسة حيوية */
    color: #ff4d4d;
    /* اختياري: تغيير لون الكس (X) للأحمر الهادئ */
}

.modal-body {
    padding: 15px;
    margin: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
}

.modal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.modal-form-group.full-width {
    grid-column: span 2;
    width: 535px;
}

.modal-footer {
    padding: 15px 30px;
    background: #f8fafc;
    display: flex;
    gap: 10px;
    border-top: 1px solid #f1f5f9;
}

.cancel-btn {
    background: rgb(53, 52, 52) !important;
    border: 1px solid #ddd !important;
}

/* --- خانات البحث المنسدلة --- */

/* الحاوية الرئيسية */
.searchable-dropdown {
    position: relative;
    width: 100%;
    direction: rtl;
    /* ضمان الاتجاه العربي */
}

/* تنسيق قائمة النتائج المنبثقة */
.dropdown-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    z-index: 3000;

    /* ضبط الارتفاع لإظهار عنصرين فقط */
    /* بما أن ارتفاع العنصر الواحد 40px، نضبط القائمة على 80px */
    max-height: 80px;
    overflow-y: auto;

    padding: 0;
    /* إزالة الحشو الداخلي لضبط دقة الحساب */
    margin-top: 5px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
        0 8px 10px -6px rgba(0, 0, 0, 0.1);
    animation: slideDown 0.2s ease-out;
    list-style: none;
    margin-bottom: 0;
}

/* تأثير ظهور القائمة */
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* تنسيق العناصر داخل القائمة */
.dropdown-list li {
    padding: 0 16px;
    cursor: pointer;
    font-size: 0.90rem;
    color: #4a5568;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    text-align: right;
    border-right: 3px solid transparent;

    /* تثبيت الارتفاع لضمان ظهور عنصرين فقط دائماً */
    height: 40px;
    box-sizing: border-box;
}

/* تأثير عند تمرير الفأرة + حالة التحديد بالأسهم (highlighted) */
.dropdown-list li:hover,
.dropdown-list li.highlighted {
    background-color: #f3f0ff !important;
    color: #764ba2 !important;
    border-right: 3px solid #764ba2 !important;
    padding-right: 22px;
    /* حركة طفيفة لليسار عند التحديد */
    outline: none;
}

/* تنسيق حالة "لا توجد نتائج" */
.no-result {
    height: 40px;
    /* متناسق مع ارتفاع العناصر */
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a0aec0;
    font-style: italic;
    font-size: 0.9rem;
}

/* شريط التمرير الأنيق - تم تنحيفه ليتناسب مع القائمة الصغيرة */
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f8fafc;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #764ba2;
}

/* إضافة أيقونة السهم في الجهة اليسرى */
.searchable-dropdown::after {
    content: '';
    /* إزالة الكود البرمجي للأيقونة */
    position: absolute;
    left: 15px;
    top: 45%;
    /* تعديل بسيط للمركز */

    /* رسم سهم باستخدام الحدود */
    width: 6px;
    height: 6px;
    border-left: 2px solid #cbd5e0;
    border-bottom: 2px solid #cbd5e0;

    /* تدوير المربع ليصبح سهماً يشير للأسفل */
    transform: translateY(-50%) rotate(-45deg);

    pointer-events: none;
    transition: all 0.3s ease;
}

/* تدوير السهم عند الفتح */
.searchable-dropdown:focus-within::after {
    transform: translateY(-20%) rotate(135deg);
    /* تدويره ليشير للأعلى */
    color: #764ba2;
    border-color: #764ba2;
}

/* تحسين حقل الإدخال عند البحث */
.custom-input:focus {
    border-color: #764ba2;
    box-shadow: 0 0 0 3px rgba(118, 75, 162, 0.1);
    outline: none;
}

/* --- التجاوب --- */
@media (max-width: 640px) {
    .modal-grid {
        grid-template-columns: 1fr;
    }

    .modal-form-group.full-width {
        grid-column: span 1;
    }

    .custom-modal-content {
        margin-top: auto;
        border-radius: 24px 24px 0 0;
    }
}
</style>