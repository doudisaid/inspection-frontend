<template>
    <div class="chef-service-container">
        <div class="page-header">
            <div class="header-title">
                <font-awesome-icon :icon="['fas', 'user-tie']" class="header-icon" />
                <h3>إدارة رؤساء المصالح</h3>
            </div>
            <div class="search-box">
                <div class="input-div long-search">
                    <div class="search-icon">
                        <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                    </div>
                    <input type="text" v-model="searchQuery" placeholder="ابحث بالاسم أو البريد أو الهاتف..."
                        autocomplete="off" />
                </div>
            </div>
            <button class="add-btn" @click="openAddModal">
                <font-awesome-icon :icon="['fas', 'user-plus']" class="add-btn-icon" />
                <span>إضافة رئيس مصلحة</span>
            </button>
        </div>

        <div class="content-body">
            <div v-if="loading" class="loader-box">
                <div class="spinner"></div>
                <p>جاري تحميل قائمة المستخدمين...</p>
            </div>

            <div v-else-if="filteredUsers.length > 0" class="table-wrapper">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>الاسم الكامل</th>
                            <th>رقم الهاتف</th>
                            <th>البريد الإلكتروني</th>
                            <th>المديرية (الولاية)</th>
                            <th style="text-align: center;">العمليات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in filteredUsers" :key="user.id">
                            <td class="user-name">{{ user.username }}</td>
                            <td class="user-phone">{{ user.phone || '---' }}</td>
                            <td>{{ user.email }}</td>
                            <td>
                                <span class="willaya-badge">
                                    {{ user.willaya?.willayaname ? `مديرية التربية لولاية ${user.willaya.willayaname}` :
                                        'غير محدد' }}
                                </span>
                            </td>
                            <td class="actions">
                                <button class="action-btn edit" @click="editUser(user)" title="تعديل">
                                    <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                                </button>
                                <button class="action-btn delete" @click="confirmDelete(user.id)" title="حذف">
                                    <font-awesome-icon :icon="['fas', 'trash-can']" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-else class="no-data-box">
                <p>لا يوجد رؤساء مصالح مسجلين حالياً.</p>
            </div>
        </div>

        <transition name="fade-slide">
            <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
                <div class="modal-card">
                    <div class="modal-header">
                        <div class="header-right">
                            <div class="icon-box">
                                <font-awesome-icon :icon="isEditMode ? ['fas', 'user-pen'] : ['fas', 'user-plus']" />
                            </div>
                            <h3>{{ isEditMode ? 'تعديل بيانات الحساب' : 'إنشاء حساب رئيس مصلحة' }}</h3>
                        </div>
                        <button type="button" @click="closeModal" class="close-x">&times;</button>
                    </div>

                    <form @submit.prevent="saveUser">
                        <div class="modal-body">
                            <div class="form-grid">

                                <div class="input-group">
                                    <label>الاسم الكامل</label>
                                    <div class="input-wrapper">
                                        <div class="input-icon"><font-awesome-icon :icon="['fas', 'user']" /></div>
                                        <input type="text" v-model="currentUser.username" required
                                            placeholder="الاسم و اللقب" />
                                    </div>
                                </div>

                                <div class="input-group">
                                    <label>البريد الإلكتروني</label>
                                    <div class="input-wrapper">
                                        <div class="input-icon"><font-awesome-icon :icon="['fas', 'envelope']" /></div>
                                        <input type="email" v-model="currentUser.email" required
                                            placeholder="example@edu.dz" />
                                    </div>
                                </div>

                                <div class="input-group">
                                    <label>رقم الموبايل</label>
                                    <div class="input-wrapper">
                                        <div class="input-icon"><font-awesome-icon :icon="['fas', 'phone']" /></div>
                                        <input type="tel" v-model="currentUser.phone" required
                                            placeholder="0XXXXXXXXX" />
                                    </div>
                                </div>

                                <div class="input-group">
                                    <label>المديرية</label>
                                    <div class="searchable-select" v-click-outside="closeWillayaList">
                                        <div class="input-wrapper">
                                            <div class="input-icon">
                                                <font-awesome-icon :icon="['fas', 'location-dot']" />
                                            </div>
                                            <input type="text" v-model="willayaSearchQuery" ref="willayaInput"
                                                @focus="onWillayaFocus" @input="onWillayaInput"
                                                @keydown.down.prevent="moveDown" @keydown.up.prevent="moveUp"
                                                @keydown.enter.prevent="selectHighlighted"
                                                @keydown.esc="showWillayaList = false"
                                                placeholder="ابحث برقم أو اسم الولاية..." required />
                                        </div>

                                        <ul v-if="showWillayaList && filteredWillayas.length > 0" class="glass-dropdown"
                                            ref="willayaList">
                                            <li v-for="(w, index) in filteredWillayas" :key="w.id"
                                                :class="{ 'highlighted': index === highlightedIndex }"
                                                @click="selectWillaya(w)" @mouseover="highlightedIndex = index">
                                                <span class="w-name">{{ w.willayaname }}</span>
                                                <span class="w-code">{{ w.id }}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div class="input-group">
                                    <label>كلمة المرور</label>
                                    <div class="input-wrapper">
                                        <div class="input-icon">
                                            <font-awesome-icon :icon="['fas', 'lock']" />
                                        </div>

                                        <input type="password" v-model="currentUser.password" ref="passwordInput"
                                            :placeholder="isEditMode ? 'اتركها فارغة في حال عدم التغيير' : 'أدخل كلمة المرور الجديدة'"
                                            :required="!isEditMode" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn-cancel" @click="closeModal">
                                <font-awesome-icon :icon="['fas', 'times']" />
                                إلغاء
                            </button>

                            <button type="submit" class="btn-save" :disabled="isSaving">
                                <font-awesome-icon v-if="!isSaving" :icon="['fas', 'check']" />
                                <font-awesome-icon v-else :icon="['fas', 'spinner']" spin />
                                {{ isSaving ? 'جاري الحفظ...' : 'حفظ البيانات' }}
                            </button>
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
    name: "ChefServiceComp",
    data() {
        return {
            // منطق الولايات والقائمة المنسدلة
            showWillayaList: false,
            highlightedIndex: -1,
            willayas: [],
            willayaSearchQuery: '',

            // بيانات المستخدمين
            users: [],
            searchQuery: '',
            loading: false,
            isSaving: false,
            showModal: false,
            isEditMode: false,

            currentUser: {
                id: null,
                username: '',
                email: '',
                phone: '',
                password: '',
                willaya_id: '',
                role_id: '1'
            }
        };
    },
    computed: {
        filteredWillayas() {
            if (!this.willayas) return [];
            const query = (this.willayaSearchQuery || '').toLowerCase();
            return this.willayas.filter(w =>
                w.id.toString().includes(query) ||
                w.willayaname.toLowerCase().includes(query)
            );
        },
        filteredUsers() {
            if (!this.users) return [];
            const query = (this.searchQuery || '').toLowerCase();
            return this.users.filter(user =>
                (user.username?.toLowerCase().includes(query)) ||
                (user.email?.toLowerCase().includes(query)) ||
                (user.phone?.includes(query))
            );
        }
    },
    methods: {
        // --- منطق البحث المتقدم في الولايات ---
        onWillayaFocus() {
            this.showWillayaList = true;
            this.highlightedIndex = -1;
        },
        onWillayaInput() {
            this.showWillayaList = true;
            this.highlightedIndex = 0;
        },
        moveDown() {
            if (!this.showWillayaList) {
                this.showWillayaList = true;
                return;
            }
            if (this.highlightedIndex < this.filteredWillayas.length - 1) {
                this.highlightedIndex++;
                this.scrollToHighlighted();
            }
        },
        moveUp() {
            if (this.highlightedIndex > 0) {
                this.highlightedIndex--;
                this.scrollToHighlighted();
            }
        },
        selectHighlighted() {
            if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredWillayas.length) {
                this.selectWillaya(this.filteredWillayas[this.highlightedIndex]);
            }
        },
        selectWillaya(willaya) {
            this.currentUser.willaya_id = willaya.id;
            this.willayaSearchQuery = willaya.willayaname;
            this.showWillayaList = false;
            this.highlightedIndex = -1;

            // الانتقال التلقائي لخانة كلمة المرور
            this.$nextTick(() => {
                if (this.$refs.passwordInput) {
                    this.$refs.passwordInput.focus();
                }
            });
        },
        closeWillayaList() {
            this.showWillayaList = false;
            this.highlightedIndex = -1;
        },
        scrollToHighlighted() {
            this.$nextTick(() => {
                const list = this.$refs.willayaList;
                if (!list) return;
                const highlightedItem = list.querySelectorAll('li')[this.highlightedIndex];
                if (highlightedItem) {
                    highlightedItem.scrollIntoView({ block: 'nearest' });
                }
            });
        },

        // --- منطق الطباعة الاحترافية ---
        generatePDFCredentials(user, plainPassword) {
            const htmlContent = `
                <!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <title>بيانات الحساب - ${user.username}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
                        body { font-family: 'Cairo', sans-serif; padding: 50px; color: #1e293b; background: white; }
                        .card { border: 2px solid #e2e8f0; border-radius: 15px; padding: 40px; max-width: 700px; margin: auto; position: relative; }
                        .header { text-align: center; border-bottom: 3px solid #6f42c1; padding-bottom: 20px; margin-bottom: 30px; }
                        .header h1 { margin: 0; font-size: 24px; color: #6f42c1; }
                        .info-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px dashed #e2e8f0; }
                        .label { font-weight: 700; color: #64748b; }
                        .value { font-weight: 400; color: #0f172a; }
                        .password-box { background: #f8fafc; border: 1px solid #6f42c1; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px; }
                        .password-box .val { font-family: monospace; font-size: 22px; color: #d32f2f; font-weight: bold; letter-spacing: 2px; }
                        .footer-note { margin-top: 40px; font-size: 13px; color: #94a3b8; text-align: center; line-height: 1.6; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="header">
                            <h1>بطاقة معلومات الولوج</h1>
                            <p>منصة تسيير  المقاطعات البيداغوجية - وزارة التربية</p>
                        </div>
                        <div class="info-row"><span class="label">رئيس المصلحة:</span> <span class="value">${user.username}</span></div>
                        <div class="info-row"><span class="label">البريد الإلكتروني:</span> <span class="value">${user.email}</span></div>
                        <div class="info-row"><span class="label">الولاية / المديرية:</span> <span class="value">${this.willayaSearchQuery}</span></div>
                        <div class="password-box">
                            <div class="label">كلمة المرور المؤقتة</div>
                            <div class="val">${plainPassword}</div>
                        </div>
                        <div class="footer-note">
                            يُرجى الاحتفاظ بهذه الورقة في مكان آمن. يُنصح بتغيير كلمة المرور فور الدخول الأول للمنصة.<br>
                            تم إصدار هذه الوثيقة آلياً بتاريخ: ${new Date().toLocaleDateString('ar-DZ')}
                        </div>
                    </div>
                    <div style="text-align:center; margin-top:20px;" class="no-print">
                        <button onclick="window.print()" style="padding:10px 20px; cursor:pointer;">اضغط للطباعة</button>
                    </div>
                </body>
                </html>
            `;

            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        },

        // --- منطق إدارة المستخدمين ---
        async fetchData() {
            this.loading = true;
            try {
                const [userRes, willayaRes] = await Promise.all([
                    api.get('/users/role/1'),
                    api.get('/willayas')
                ]);
                this.users = userRes.data.data || [];
                this.willayas = willayaRes.data || [];
            } catch (error) {
                console.error("خطأ في جلب البيانات:", error);
            } finally {
                this.loading = false;
            }
        },

        openAddModal() {
            this.isEditMode = false;
            this.willayaSearchQuery = '';
            this.currentUser = {
                id: null, username: '', email: '', phone: '', password: '', willaya_id: '', role_id: '1'
            };
            this.showModal = true;
        },

        editUser(user) {
            this.isEditMode = true;
            this.willayaSearchQuery = user.willaya?.willayaname || '';
            this.currentUser = {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone || '',
                willaya_id: user.willaya_id,
                role_id: user.role_id,
                password: ''
            };
            this.showModal = true;
        },

        async saveUser() {
            if (this.isSaving) return;

            const payload = {
                username: this.currentUser.username,
                email: this.currentUser.email,
                phone: this.currentUser.phone,
                willaya_id: this.currentUser.willaya_id,
                role_id: '1'
            };

            if (this.currentUser.password) {
                payload.password = this.currentUser.password;
            }

            this.isSaving = true;
            try {
                if (this.isEditMode) {
                    await api.put(`/users/${this.currentUser.id}`, payload);
                } else {
                    await api.post('/users', payload);
                }

                Swal.fire("تم", "حفظ البيانات بنجاح", "success");

                // طباعة المعلومات فقط في حالة إضافة مستخدم جديد بكلمة مرور
                if (!this.isEditMode && this.currentUser.password) {
                    this.generatePDFCredentials(this.currentUser, this.currentUser.password);
                }

                this.closeModal();
                this.fetchData();
            } catch (error) {
                Swal.fire("خطأ", error.response?.data?.message || "فشل في الحفظ", "error");
            } finally {
                this.isSaving = false;
            }
        },

        closeModal() {
            this.showModal = false;
            this.showWillayaList = false;
        },

        confirmDelete(id) {
            Swal.fire({
                title: 'هل أنت متأكد؟',
                text: "سيتم حذف الحساب نهائياً",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'نعم، احذف',
                cancelButtonText: 'إلغاء'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await api.delete(`/users/${id}`);
                        this.users = this.users.filter(u => u.id !== id);
                        Swal.fire("تم!", "تم الحذف بنجاح", "success");
                    } catch (error) {
                        Swal.fire("خطأ", "لا يمكن الحذف حالياً", "error");
                    }
                }
            });
        }
    },
    mounted() {
        this.fetchData();
    }
};
</script>

<style scoped>
/* ==========================================================================
   1. الحاوية العامة (Main Container)
   ========================================================================== */
.chef-service-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 60px);
    padding: 20px;
    gap: 20px;
    direction: rtl;
    font-family: 'Cairo', sans-serif;
    background-color: #f8fafc;
}

/* ==========================================================================
   2. الهيدر العلوي (Page Header)
   ========================================================================== */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
    padding: 0 25px;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 20%;
    margin: 0;
    padding: 0;
}

.header-title .header-icon {
    color: #6f42c1;
    font-size: 22px;
}

.header-title>h3 {
    color: #334155;

}

.input-div {
    position: relative;
    overflow: hidden;
}

.input-div .search-icon {
    position: absolute;
    top: 0;
    padding: 8px 15px;
    background: #f1f5f9;
}

.page-header .input-div>input[type="text"] {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    font-family: 'cairo', sans-serif;
    font-size: 14px;
    padding: 5px 55px 5px 5px;
}


/* زر الإضافة (لحل مشكلة الظهور في الصورة 1) */
.add-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: #6f42c1;
    color: white;
    font-family: 'cairo', sans-serif;
    font-size: 14px;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.add-btn:hover {
    background-color: #5a32a3;
    transform: translateY(-2px);
}

.add-btn-icon {
    font-size: 18px;
}

/* صندوق البحث */
.input-div.long-search {
    display: flex;
    align-items: center;
    width: 450px;
    background: #f1f5f9;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    height: 45px;
    transition: 0.3s ease;
}

.input-div.long-search:focus-within {
    border-color: #6f42c1;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(111, 66, 193, 0.1);
}

/* ==========================================================================
   3. الجدول (Data Table)
   ========================================================================== */
.content-body {
    min-height: calc(100vh - 190px);
}

.table-wrapper {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
    border: 1px solid #f1f5f9;
}

.custom-table {
    width: 100%;
    border-collapse: collapse;
}

.custom-table th {
    background-color: #f8fafc;
    padding: 8px;
    color: #64748b;
    font-weight: 600;
    text-align: right;
    border-bottom: 2px solid #f1f5f9;
}

.custom-table td {
    padding: 8px 18px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
}

/* الأزرار داخل الجدول */
.actions {
    display: flex;
    gap: 8px;
}

.action-btn {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.2s;
    cursor: pointer;
}

.action-btn.edit {
    background: #f0fdf4;
    color: #16a34a;
}

.action-btn.delete {
    background: #fef2f2;
    color: #dc2626;
}

.action-btn:hover {
    transform: scale(1.1);
}

/* شارة المديرية (Badge) */
.willaya-badge {
    padding: 6px 16px;
    background: #f3e8ff;
    color: #6b21a8;
    border-radius: 99px;
    font-size: 0.85rem;
    font-weight: 700;
}

/* ==========================================================================
   4. المودال (Professional Modal)
   ========================================================================== */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.modal-card {
    background: white;
    width: 100%;
    max-width: 650px;
    border-radius: 8px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    background: #6f42c1;
    color: white;
    padding: 15px;
    position: relative;
}

.header-right {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 50%;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
}

.close-x {
    position: absolute;
    left: 20px;
    top: 20px;
    font-size: 14px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    cursor: pointer;
}

/* تنسيق الحقول داخل المودال (لحل مشكلة الصورة 2) */
.modal-body {
    padding: 30px;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 25px;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* جعل كلمة المرور تأخذ العرض كاملاً */
.input-group.full-width {
    grid-column: span 2;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon {
    position: absolute;
    right: 2px;
    width: 38px;
    height: calc(100% - 4px);
    background: #f8fafc;
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    z-index: 2;
    transition: 0.3s;
}

.input-wrapper input {
    width: 100%;
    height: 50px;
    padding: 0 55px 0 15px !important;
    /* مساحة للأيقونة يميناً */
    border: 2px solid #f1f5f9;
    border-radius: 5px;
    font-family: 'Cairo';
    font-size: 0.95rem;
    transition: 0.3s ease;
}

.input-wrapper input:focus {
    border-color: #6f42c1;
    outline: none;
    background: #fff;
}

.input-wrapper input:focus+.input-icon {
    background: #6f42c1;
    color: #fff;
}

/* willaya list */
/* الحاوية الأساسية للبحث */
.searchable-select {
    position: relative;
    /* ضروري لتموضع القائمة بالأسفل */
    width: 100%;
}

/* تنسيق القائمة المنسدلة */
.glass-dropdown {
    position: absolute;
    top: 100%;
    /* تفتح أسفل الخانة مباشرة مع مسافة بسيطة */
    left: 0;
    right: 0;
    max-height: 200px;
    /* تحديد ارتفاع أقصى للقائمة */
    overflow-y: auto;
    /* إضافة شريط تمرير عند تجاوز الارتفاع */
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 999;
    /* التأكد من ظهورها فوق العناصر الأخرى */
    list-style: none;
    /* إزالة النقاط */
    padding: 0;
    margin: 0;
}

/* تنسيق عناصر القائمة */
.glass-dropdown li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    cursor: pointer;
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.2s;
}

.glass-dropdown li:last-child {
    border-bottom: none;
}

.glass-dropdown li:hover {
    background-color: #f8fafc;
}

.glass-dropdown .w-name {
    font-size: 0.9rem;
    color: #334155;
    font-weight: 500;
}

.glass-dropdown .w-code {
    font-size: 0.8rem;
    color: #94a3b8;
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 4px;
}

.glass-dropdown li.highlighted {
    background-color: #3b82f6 !important;
    /* لون أزرق */
    color: white !important;
}

.glass-dropdown li.highlighted .w-name,
.glass-dropdown li.highlighted .w-code {
    color: white !important;
}

/* تحسين شكل شريط التمرير */
.glass-dropdown::-webkit-scrollbar {
    width: 6px;
}

.glass-dropdown::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

/* أزرار الفوتر */
.modal-footer {
    padding: 15px 30px;
    background: #e4ecf3;
    display: flex;
    flex-direction: row-reverse;
    /* لجعل الحفظ يميناً والإلغاء يساراً */
    gap: 12px;
}

.btn-save,
.btn-cancel {
    padding: 10px 30px;
    /* زيادة الطول قليلاً للمظهر العصري */
    border-radius: 8px;
    /* زوايا أنعم */
    font-family: 'Cairo';
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    /* انتقال ناعم واحترافي */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
    overflow: hidden;
}

/* --- زر الحفظ --- */
.btn-save {
    background: #6f42c1;
    color: white;
    box-shadow: 0 4px 6px -1px rgba(111, 66, 193, 0.2);
}

.btn-save:hover {
    background: #5a32a3;
    /* درجة أغمق قليلاً */
    transform: translateY(-2px);
    /* حركة للأعلى */
    box-shadow: 0 10px 15px -3px rgba(111, 66, 193, 0.4);
}

.btn-save:active {
    transform: translateY(0);
    /* العودة للوضع الطبيعي عند الضغط */
    background: #4e2a8e;
}

/* --- زر الإلغاء --- */
.btn-cancel {
    background: #f1f5f9;
    /* لون فاتح هادئ */
    border: 1px solid #e2e8f0;
    color: #475569;
}

.btn-cancel:hover {
    background: #e2e8f0;
    color: #1e293b;
    border-color: #cbd5e1;
    transform: translateY(-2px);
}

.btn-cancel:active {
    transform: translateY(0);
    background: #cbd5e1;
}

/* تأثير الـ Disabled (عند الحفظ) */
.btn-save:disabled {
    background: #a588d9;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

/* ==========================================================================
   5. الحركات (Transitions)
   ========================================================================== */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
}
</style>