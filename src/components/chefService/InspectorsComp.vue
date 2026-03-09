<template>
    <div class="inspector-page">
        <header class="table-header">
            <div class="title-with-badge">
                <div class="title-and-icon">
                    <font-awesome-icon :icon="['fas', 'user-tie']" class="header-icon" />
                    <h2 class="main-title">قائمة المفتشين</h2>
                </div>
                <span class="count-badge">{{ inspectors.length }} مفتش</span>
            </div>
        </header>

        <div class="table-controls">
            <div class="search-box">
                <div class="custom-input-group">
                    <span class="icon-addon">
                        <font-awesome-icon :icon="['fas', 'search']" />
                    </span>
                    <input type="text" v-model="searchQuery" class="custom-input"
                        placeholder="بحث بالاسم، البريد الإلكتروني أو الهاتف..." />
                </div>
            </div>

            <button class="btn-add" @click="openAddModal">
                <font-awesome-icon :icon="['fas', 'plus']" />
                <span>إضافة مفتش جديد</span>
            </button>
        </div>

        <div v-if="loading" class="text-center" style="padding: 20px;">جاري تحميل البيانات...</div>

        <div v-else class="table-wrapper">
            <table class="modern-table">
                <thead>
                    <tr>
                        <th class="col-id">الرقم</th>
                        <th>المفتش</th>
                        <th>البريد الإلكتروني</th>
                        <th>رقم الهاتف</th>
                        <th class="text-center">الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(inspector, index) in paginatedInspectors" :key="inspector.id">
                        <td>
                            <span class="id-badge">
                                {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                            </span>
                        </td>
                        <td>
                            <div class="inspector-info">
                                <div class="avatar-placeholder">
                                    {{ inspector.username ? inspector.username.charAt(0) : 'U' }}
                                </div>
                                <span class="inspector-name">{{ inspector.username }}</span>
                            </div>
                        </td>
                        <td>
                            <div class="cell-with-icon">
                                {{ inspector.email }}
                                <font-awesome-icon :icon="['fas', 'envelope']" class="cell-icon" />
                            </div>
                        </td>
                        <td>
                            <div class="cell-with-icon">
                                <span dir="ltr">{{ inspector.phone }}</span>
                                <font-awesome-icon :icon="['fas', 'phone']" class="cell-icon" />
                            </div>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-action edit" @click="editInspector(inspector)" title="تعديل">
                                    <font-awesome-icon :icon="['fas', 'user-pen']" />
                                </button>
                                <button class="btn-action delete" @click="deleteInspector(inspector.id)" title="حذف">
                                    <font-awesome-icon :icon="['fas', 'trash-can']" />
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="filteredInspectors.length === 0">
                        <td colspan="5" class="empty-state">لا يوجد مفتشون مطابقون للبحث.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="pagination-container">
            <div class="pagination-btns">
                <button :disabled="currentPage === 1" @click="currentPage--" class="page-link">السابق</button>
                <button v-for="page in totalPages" :key="page" @click="currentPage = page"
                    :class="['page-link', { active: currentPage === page }]">
                    {{ page }}
                </button>
                <button :disabled="currentPage === totalPages" @click="currentPage++" class="page-link">التالي</button>
            </div>
        </div>

        <div v-if="showAddModal" class="modal-overlay">
            <div class="modal-content">
                <header class="modal-header">
                    <div class="title-and-icon">
                        <font-awesome-icon :icon="isEditing ? ['fas', 'user-pen'] : ['fas', 'user-plus']"
                            class="header-icon" />
                        <h3 class="modal-title">{{ isEditing ? 'تعديل بيانات مفتش' : 'إضافة مفتش جديد' }}</h3>
                    </div>
                    <button class="btn-close" @click="closeModal">&times;</button>
                </header>

                <form @submit.prevent="handleSubmit" class="modal-form">
                    <div class="form-body">
                        <div class="form-group">
                            <label>الاسم واللقب</label>
                            <div class="custom-input-group">
                                <span class="icon-addon"><font-awesome-icon :icon="['fas', 'user']" /></span>
                                <input type="text" v-model="inspectorForm.username" class="custom-input" required />
                            </div>
                        </div>

                        <div class="form-group">
                            <label>البريد الإلكتروني</label>
                            <div class="custom-input-group">
                                <span class="icon-addon"><font-awesome-icon :icon="['fas', 'envelope']" /></span>
                                <input type="email" v-model="inspectorForm.email" class="custom-input" required />
                            </div>
                        </div>

                        <div class="form-group">
                            <label>رقم الهاتف</label>
                            <div class="custom-input-group">
                                <span class="icon-addon"><font-awesome-icon :icon="['fas', 'phone']" /></span>
                                <input type="tel" v-model="inspectorForm.phone" class="custom-input" required />
                            </div>
                        </div>

                        <div class="form-group">
                            <label>{{ isEditing ? 'كلمة المرور (اتركها فارغة لعدم التغيير)' : 'كلمة المرور' }}</label>
                            <div class="custom-input-group">
                                <span class="icon-addon"><font-awesome-icon :icon="['fas', 'lock']" /></span>
                                <input :type="showPassword ? 'text' : 'password'" v-model="inspectorForm.password"
                                    class="custom-input" :required="!isEditing" />
                                <font-awesome-icon :icon="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']"
                                    class="eye-toggle-icon" @click="showPassword = !showPassword"
                                    style="cursor: pointer; padding: 0 10px;" />
                            </div>
                        </div>
                    </div>

                    <footer class="modal-footer">
                        <button type="button" class="btn-cancel" @click="closeModal">إلغاء</button>
                        <button type="submit" class="btn-save">
                            <font-awesome-icon :icon="['fas', 'check']" />
                            <span>{{ isEditing ? 'تحديث' : 'حفظ' }}</span>
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import api from '@/api/axios.js';
import Swal from 'sweetalert2';

export default {
    name: "InspectorsManager",
    data() {
        return {
            loading: false,
            showAddModal: false,
            isEditing: false,
            showPassword: false,
            searchQuery: "",
            currentPage: 1,
            itemsPerPage: 10,
            inspectors: [],
            currentUser: (function () {
                try {
                    return JSON.parse(localStorage.getItem('user')) || { willaya_id: null, willaya: { name: "غير محدد" } };
                } catch (e) {
                    return { willaya_id: null, willaya: { name: "غير محدد" } };
                }
            })(),
            inspectorForm: {
                id: null,
                username: "",
                email: "",
                phone: "",
                password: "",
                willaya_id: null,
                role_id: "2"
            }
        };
    },

    watch: {
        searchQuery() {
            this.currentPage = 1;
        }
    },

    computed: {
        filteredInspectors() {
            const query = this.searchQuery.toLowerCase().trim();

            let results = this.inspectors.filter(ins =>
                ins.username?.toLowerCase().includes(query) ||
                ins.email?.toLowerCase().includes(query) ||
                ins.phone?.includes(query)
            );

            // ترتيب البيانات تصاعدياً حسب الـ ID ليظهر أقدم مفتش كرقم 1
            return results.sort((a, b) => a.id - b.id);
        },

        totalPages() {
            return Math.ceil(this.filteredInspectors.length / this.itemsPerPage) || 1;
        },

        paginatedInspectors() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredInspectors.slice(start, start + this.itemsPerPage);
        }
    },

    methods: {
        async fetchInspectors() {
            this.loading = true;
            try {
                const response = await api.get(`/users/role/2`, {
                    params: { willaya_id: this.currentUser.willaya_id }
                });
                if (response.data.success) {
                    this.inspectors = response.data.data;
                }
            } catch (error) {
                console.error("Fetch Error:", error);
            } finally {
                this.loading = false;
            }
        },

        async handleSubmit() {
            if (this.isEditing) {
                await this.updateInspector();
            } else {
                await this.saveInspector();
            }
        },

async saveInspector() {
    try {
        const plainPassword = this.inspectorForm.password;
        this.inspectorForm.willaya_id = this.currentUser.willaya_id;

        const response = await api.post('/users', this.inspectorForm);
        
        if (response.data.success) {
            await this.fetchInspectors();

            // إظهار التنبيه مع توجيهه للـ body مباشرة
            await Swal.fire({
                icon: 'success',
                title: 'تمت الإضافة بنجاح',
                text: 'جاري تحضير بيانات الطباعة...',
                timer: 2000,
                showConfirmButton: false,
                position: 'center',
                target: 'body', // تأكد أنها نص 'body'
                didOpen: (toast) => {
                    // برمجيًا نرفع الـ z-index لأقصى درجة عند الفتح
                    toast.parentElement.style.zIndex = '999999';
                }
            });

            setTimeout(() => {
                this.generateInspectorCredentials(
                    response.data.user || this.inspectorForm, 
                    plainPassword
                );
            }, 500);
            
            this.resetForm();
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'خطأ في الحفظ',
            text: error.response?.data?.message || 'تعذر الاتصال بالخادم',
            target: 'body'
        });
    }
},

        async updateInspector() {
            try {
                const dataToSend = { ...this.inspectorForm };
                if (!dataToSend.password) delete dataToSend.password;

                const response = await api.put(`/users/${this.inspectorForm.id}`, dataToSend);
                if (response.data.success) {
                    await this.fetchInspectors();
                    this.closeModal();
                    this.showAlert('success', 'تم تحديث البيانات بنجاح');
                }
            } catch (error) {
                Swal.fire('خطأ!', 'فشل تحديث البيانات', 'error');
            }
        },

        async deleteInspector(id) {
            const result = await Swal.fire({
                title: 'هل أنت متأكد؟',
                text: "لن تتمكن من التراجع عن هذا!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'نعم، احذف',
                cancelButtonText: 'إلغاء'
            });

            if (result.isConfirmed) {
                try {
                    const response = await api.delete(`/users/${id}`);
                    if (response.data.success) {
                        this.inspectors = this.inspectors.filter(ins => ins.id !== id);
                        this.showAlert('success', 'تم الحذف بنجاح');
                    }
                } catch (error) {
                    Swal.fire('خطأ!', 'حدث خطأ أثناء الحذف', 'error');
                }
            }
        },

        generateInspectorCredentials(inspector, plainPassword) {
            const finalWillayaName = inspector.willaya?.name || this.currentUser.willaya?.name || "مديرية التربية";

            // استخدمنا تقسيم كلمة script لتجنب خطأ Unnecessary escape character
            const scriptClosing = 'sc' + 'ript';

            const htmlContent = `
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>بيانات الحساب - ${inspector.username}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
                body { font-family: 'Cairo', sans-serif; padding: 30px; background-color: #f9f9f9; text-align: right; }
                .card { border: 2px solid #764ba2; border-radius: 12px; padding: 25px; max-width: 500px; margin: auto; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .val { color: #d32f2f; font-weight: bold; font-size: 24px; font-family: monospace; }
                .actions { text-align: center; margin-top: 25px; display: flex; justify-content: center; gap: 10px; }
                .btn { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-family: 'Cairo'; font-weight: bold; transition: 0.3s; text-decoration: none; }
                .btn-print { background-color: #764ba2; color: white; }
                .btn-save { background-color: #2ecc71; color: white; }
                .btn:hover { opacity: 0.8; }
                @media print { .actions { display: none; } body { background: white; padding: 0; } .card { box-shadow: none; border: 1px solid #764ba2; } }
            </style>
        </head>
        <body>
            <div class="card">
                <h2 style="text-align:center; color:#764ba2; margin-top:0;">بيانات الدخول للمنصة</h2>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
                <p><b>المفتش:</b> ${inspector.username}</p>
                <p><b>البريد الإلكتروني:</b> ${inspector.email}</p>
                <p><b>الولاية:</b> ${finalWillayaName}</p>
                <div style="background:#f4f4f4; padding:15px; text-align:center; border-radius:8px; border: 1px dashed #764ba2; margin-top: 15px;">
                    كلمة المرور المؤقتة:<br>
                    <span class="val">${plainPassword}</span>
                </div>
                
                <div class="actions">
                    <button class="btn btn-print" onclick="window.print()">طباعة الوثيقة</button>
                    <button class="btn btn-save" onclick="window.print()">حفظ كـ PDF</button>
                </div>
            </div>

            <${scriptClosing}>
                // تم ربط الزرين بـ window.print مباشرة لضمان التوافقية
            </${scriptClosing}>
        </body>
        </html>`;

            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        },

        openAddModal() {
            this.isEditing = false;
            this.resetForm();
            this.showAddModal = true;
        },

        editInspector(inspector) {
            this.isEditing = true;
            this.inspectorForm = { ...inspector, password: "" };
            this.showAddModal = true;
        },

        closeModal() {
            this.showAddModal = false;
            this.showPassword = false;
            this.resetForm();
        },

        resetForm() {
            this.inspectorForm = {
                id: null, username: "", email: "", phone: "", password: "",
                willaya_id: this.currentUser.willaya_id, role_id: "2"
            };
        },

        showAlert(icon, title) {
            Swal.mixin({
                toast: true, position: 'top-end', showConfirmButton: false,
                timer: 3000, timerProgressBar: true
            }).fire({ icon, title });
        }
    },
    mounted() {
        this.fetchInspectors();
    }
};
</script>

<style scoped>
/* هذا التنسيق سيجبر أي تنبيه Swal على القفز فوق المودال */
body .swal2-container {
    z-index: 999999 !important;
}

/* لضمان عدم حجب التنبيه بواسطة أي خلفية (Overlay) للمودال */
.swal2-shown {
    overflow: hidden; /* لمنع التمرير خلف التنبيه */
}
/* --- 1. التخطيط العام للصفحة (General Layout) --- */
.inspector-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 95px);
    padding: 15px;
    direction: rtl;
    font-family: 'Cairo', sans-serif;
    background-color: #fff;
    box-sizing: border-box;
    border-radius: 12px;
    box-shadow: rgba(149, 157, 165, 0.1) 0px 8px 24px;
    overflow: hidden;
}

/* --- 2. الهيدر وعناصر التحكم (Header & Controls) --- */
.table-header {
    flex-shrink: 0;
    margin-bottom: 20px;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 15px;
}

.title-with-badge {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.title-and-icon {
    display: flex;
    align-items: center;
    gap: 12px;
}

.header-icon {
    font-size: 1.4rem;
    color: #764ba2;
    background: #f0f4ff;
    padding: 8px;
    border-radius: 10px;
}

.main-title {
     font-size: 1rem;
    font-weight: 800;
    color: #2c3e50;
    margin: 0;
}

.count-badge {
    background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
    color: #764ba2;
    padding: 6px 16px;
    border-radius: 50px;
    font-size: 0.85rem;
    font-weight: 800;
    border: 1px solid rgba(118, 75, 162, 0.1);
    white-space: nowrap;
}

.table-controls {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 20px;
    background: #f8fafc;
    padding: 12px;
    border-radius: 12px;
}

.search-box {
    flex: 0 0 45%;
}

/* --- 3. تصميم الجدول (Modern Table) --- */
.table-wrapper {
    flex-grow: 1;
    background: white;
    border: 1px solid #f1f5f9;
    border-radius: 12px;
    overflow-y: auto;
    overflow-x: auto;
    margin-bottom: 15px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
}

.modern-table {
    width: 100%;
    border-collapse: collapse;
}

.modern-table thead th {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #f8fafc;
    padding: 12px 16px;
    text-align: center;
    font-size: 0.85rem;
    color: #64748b;
    box-shadow: 0 1px 0 #e2e8f0;
}

.modern-table td {
    padding: 10px 16px;
    border-bottom: 1px solid #f8fafc;
    font-size: 0.9rem;
    color: #334155;
    text-align: center;
}

/* تفاصيل المفتش داخل الجدول */
.inspector-info {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 15px;
    width: fit-content;
    margin: 0 auto;
    min-width: 180px;
}

.avatar-placeholder {
    width: 35px;
    height: 35px;
    flex-shrink: 0;
    background: #764ba2;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(118, 75, 162, 0.2);
}

.inspector-name {
    text-align: right;
    font-weight: 600;
    color: #1e293b;
    white-space: nowrap;
}

.cell-with-icon {
    display: flex;
    align-items: center;
    justify-content: left;
    gap: 12px;
}

.cell-icon {
    color: #94a3b8;
    font-size: 0.9rem;
    flex-shrink: 0;
    transition: color 0.3s ease;
}

.modern-table tr:hover .cell-icon {
    color: #764ba2;
}

.id-badge {
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 700;
}

/* --- 4. حقول الإدخال المخصصة (Custom Input Group) --- */
.custom-input-group {
    position: relative;
    display: flex;
    align-items: stretch;
    height: 42px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    background-color: #fff;
    transition: all 0.3s ease;
}

.custom-input-group:focus-within {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.08);
}

.icon-addon {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8fafc;
    width: 40px;
    border-left: 1.5px solid #e2e8f0;
    color: #94a3b8;
    flex-shrink: 0;
}

.icon-addon svg {
    width: 13px !important;
    height: 13px !important;
}

.custom-input {
    flex: 1;
    border: none !important;
    padding: 0 12px 0 35px;
    /* مساحة للعين جهة اليسار */
    font-family: inherit;
    font-size: 13px;
    outline: none;
    direction: rtl;
    background-color: transparent;
    text-align: right;
}

.eye-toggle-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #94a3b8;
    width: 14px !important;
    height: 14px !important;
    z-index: 5;
    transition: color 0.2s;
}

.eye-toggle-icon:hover {
    color: #667eea;
}

/* --- 5. الأزرار (Buttons) --- */
.btn-add,
.btn-save {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    transition: 0.3s;
    font-family: 'Cairo', sans-serif;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-add:hover {
    transform: translateY(-2px);
    filter: brightness(1.1);
}

.btn-close {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    background-color: #ba89eb;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(186, 137, 235, 0.3);
}

.btn-close:hover {
    background-color: #a366e5;
    transform: rotate(90deg);
}

.action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
}

.btn-action {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-action.edit {
    background: #eff6ff;
    color: #2563eb;
}

.btn-action.delete {
    background: #fff1f2;
    color: #e11d48;
}

.btn-cancel {
    font-family: 'cairo', sans-serif;
    background-color: #ffffff;
    color: #64748b;
    border: 1px solid #e2e8f0;
    padding: 8px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
}

.btn-cancel:hover {
    background-color: #f1f5f9;
    color: #1e293b;
}

/* --- 6. المودال (Modal) --- */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    backdrop-filter: blur(4px);
}

.modal-content {
    background: white;
    width: 90%;
    max-width: 500px;
    border-radius: 16px;
    animation: slideUp 0.3s ease-out;
}

.modal-header {
    padding: 10px 20px;
    background: #f8fafc;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e2e8f0;
    border-radius: 16px 16px 0 0;
}

.modal-form {
    padding: 20px;
}

.form-body {
    background-color: #f8fafc;
    padding: 15px;
    border-radius: 8px;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 700;
    color: #475569;
    font-size: 0.85rem;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 15px;
}

/* --- 7. الترقيم (Pagination) --- */
.pagination-container {
    margin-top: auto;
    padding-top: 10px;
    border-top: 1px solid #f1f5f9;
    display: flex;
    justify-content: center;
}

.page-link {
    padding: 6px 12px;
    margin: 0 3px;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: 6px;
    cursor: pointer;
}

.page-link.active {
    background: #764ba2;
    color: white;
    border-color: #764ba2;
}

/* --- 8. التحريك (Animations) --- */
@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* --- 9. الموبايل (Responsive) --- */
@media (max-width: 768px) {
    .inspector-page {
        height: auto;
        padding: 10px;
        border-radius: 0;
    }

    .table-controls {
        flex-direction: column;
        gap: 12px;
    }

    .search-box {
        width: 100%;
    }

    .btn-add {
        width: 100%;
        justify-content: center;
    }

    .modern-table thead {
        display: none;
    }

    .modern-table,
    .modern-table tbody,
    .modern-table tr,
    .modern-table td {
        display: block;
        width: 100%;
    }

    .modern-table tr {
        margin-bottom: 15px;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 10px;
        background: #fff;
    }

    .modern-table td {
        text-align: right;
        padding: 8px 5px;
        border: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modern-table td::before {
        content: attr(data-label);
        font-weight: 700;
        color: #64748b;
    }

    .action-buttons {
        width: 100%;
        border-top: 1px solid #f1f5f9;
        padding-top: 10px;
    }
}
</style>