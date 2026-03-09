<template>
    <div class="layout-page">
        <div class="inspector-mouve-header">
            <div class="annee-scolare-container">
                <div class="willaya-title">
                    <font-awesome-icon :icon="['fas', 'route']" class="title-icon" />
                    إدارة حركة المفتشين 
                </div>
                <div class="info-box">
                    <span class="value">السنة الدراسية الحالية: {{ activeYear?.yearname || 'جاري التحميل...' }}</span>
                </div>
            </div>
        </div>

        <div class="card-secteur-container">
            <div v-for="(secteur, index) in secteurs" :key="secteur.id" class="secteur-card">
                <div class="card-header">
                    <div class="header-top">
                        <span class="secteur-label">{{ index + 1 }}</span>
                        <span class="secteur-id">{{ secteur.secteurname }}</span>
                    </div>
                    <div class="commune-name">
                        <span class="commune-name-icon"> <font-awesome-icon :icon="['fas', 'city']" /> </span>
                        {{ secteur.Commune?.communename || 'بلدية غير محددة' }}
                    </div>
                </div>

                <div class="card-body">
                    <div v-if="secteur.inspector" class="inspector-section">
                        <div class="avatar-box">
                            <font-awesome-icon :icon="['fas', 'user-tie']" />
                        </div>
                        <div class="inspector-details">
                            <span class="role-title">المفتش الحالي:</span>
                            <span class="inspector-name">{{ secteur.inspector.username }}</span>
                        </div>
                    </div>

                    <div v-else class="vacant-section">
                        <div class="avatar-box vacant">
                            <font-awesome-icon :icon="['fas', 'user-slash']" />
                        </div>
                        <div class="inspector-details">
                            <span class="role-title">الحالة:</span>
                            <span class="vacant-text">مقاطعة شاغرة</span>
                        </div>
                    </div>
                </div>

                <div class="card-footer">
                    <button class="btn-transfer" @click="openTransferModal(secteur)">
                        <font-awesome-icon :icon="['fas', 'exchange-alt']" />
                        <span>{{ secteur.inspector ? 'نقل المفتش' : 'تعيين' }}</span>
                    </button>
                    <button class="btn-history" @click="openHistoryModal(secteur)">
                        <font-awesome-icon :icon="['fas', 'history']" />
                        <span>سجل</span>
                    </button>
                </div>
            </div>
        </div>

        <TransferModal 
            v-if="showTransferModal" 
            :secteur="selectedSecteur" 
            :inspectors="inspectors" 
            @close="showTransferModal = false" 
            @confirm="handleTransferConfirm" 
        />

        <HistoryModal 
            v-if="showHistoryModal" 
            :secteur="selectedSecteurHistory" 
            :history="historyData" 
            @close="showHistoryModal = false" 
        />
    </div>
</template>

<script>
import TransferModal from '@/components/chefService/inspector-mouve-modals/TransferModal.vue';
import HistoryModal from '@/components/chefService/inspector-mouve-modals/HistoryModal.vue';
import api from '@/api/axios.js';
import Swal from 'sweetalert2';

export default {
    name: 'InspectorMouvePage',
    components: { 
        TransferModal, 
        HistoryModal 
    },
    data() {
        return {
            // بيانات الحالة العامة
            activeYear: null,    // السنة الدراسية
            currentUser: null,   // بيانات رئيس المصلحة
            secteurs: [],        // قائمة المقاطعات (البطاقات)
            inspectors: [],      // قائمة المفتشين المتاحين للتعيين
            loading: false,

            // التحكم في نافذة النقل والتعيين
            showTransferModal: false,
            selectedSecteur: null,

            // التحكم في نافذة السجل
            showHistoryModal: false,
            selectedSecteurHistory: null,
            historyData: []
        }
    },
    async mounted() {
        this.loading = true;

        // 1. تحميل بيانات المستخدم من التخزين المحلي
        this.loadUserFromStorage();

        try {
            // 2. تحميل البيانات الأساسية بالتوازي
            await Promise.all([
                this.fetchActiveYear(),
                this.fetchSecteurs(),
                this.fetchInspectors()
            ]);
        } catch (error) {
            console.error("حدث خطأ أثناء تحميل البيانات الأولية:", error);
        } finally {
            this.loading = false;
        }
    },
    methods: {
        // --- إدارة البيانات ---
        
        loadUserFromStorage() {
            const userData = localStorage.getItem('user');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                console.log( this.currentUser)
            }
            else { console.log( "no user")}
        },

        async fetchActiveYear() {
            try {
                const response = await api.get('/years/active');
                this.activeYear = response.data;
            } catch (error) {
                console.error("خطأ في جلب السنة الدراسية:", error);
            }
        },

        async fetchSecteurs() {
            try {
                const response = await api.get('/secteurs');
                this.secteurs = response.data.data;
            } catch (error) {
                console.error("خطأ في جلب المقاطعات:", error);
            }
        },

    async fetchInspectors() {
    try {
        if (!this.currentUser || !this.currentUser.willaya_id) {
            console.error("بيانات ولاية المستخدم الحالي غير متوفرة");
            return;
        }

        // إرسال الطلب مع التأكد من اسم المعامل: willaya_id
        const response = await api.get('/users/role/2', {
            params: {
                willaya_id: this.currentUser.willaya_id 
            }
        });
        
        this.inspectors = response.data.data;
       
    } catch (error) {
        console.error("خطأ في جلب المفتشين:", error);
    }
},

        // --- منطق نافذة النقل والتعيين ---

        openTransferModal(secteur) {
            this.selectedSecteur = secteur;
            this.showTransferModal = true;
        },

      async handleTransferConfirm(payload) {
    try {
        this.loading = true;
        // 1. إرسال الطلب للسيرفر
        await api.post('/secteurs/change-inspector', payload);

        // 2. إغلاق النافذة فوراً قبل أي شيء آخر
        this.showTransferModal = false;

        // 3. إظهار رسالة النجاح
        Swal.fire({
            title: 'تمت العملية',
            text: 'تم تحديث بيانات المقاطعة وتوثيق الحركة بنجاح',
            icon: 'success',
            confirmButtonText: 'موافق',
            timer: 2000 // إغلاق التنبيه تلقائياً بعد ثانيتين
        });

        // 4. تحديث البيانات في الخلفية
        await this.fetchSecteurs(); 

    } catch (error) {
        console.error("خطأ في العملية:", error);
        Swal.fire('فشل التحديث', 'حدث خطأ أثناء محاولة تغيير المفتش', 'error');
    } finally {
        this.loading = false;
    }
},

        // --- منطق نافذة السجل ---

        async openHistoryModal(secteur) {
            this.selectedSecteurHistory = secteur;
            try {
                this.loading = true;
                const response = await api.get(`/secteurs/${secteur.id}/history`);
                this.historyData = response.data.data;
                this.showHistoryModal = true;
            } catch (error) {
                Swal.fire('تنبيه', 'لا يوجد سجل تحركات لهذه المقاطعة حالياً', 'info');
            } finally {
                this.loading = false;
            }
        }
    }
}
</script>

<style scoped>
/* تخطيط الصفحة العام */
.layout-page {
    width: 100%;
    margin: 15px;
    height: calc(100vh - 100px);
}

/* هيدر الصفحة العلوي */
.inspector-mouve-header {
    background-color: #fff;
    width: 100%;
    font-size: 14px;
    font-weight: 700;
    border-radius: 8px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    margin-bottom: 10px;
}

.annee-scolare-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 12px;
}

.title-icon {
    color: #764ba2;
    font-size: 1.2rem;
    margin-left: 15px;
}

.willaya-title,
.info-box {
    font-size: 1rem;
    font-weight: 800;
    color: #2c3e50;
}

/* ------------------------------------------------------ */
/* الحاوية الرئيسية للمقاطعات (Grid System) */
/* ------------------------------------------------------ */
.card-secteur-container {
    margin: 15px auto;
    padding: 10px 15px; 

    /* نظام الشبكة: 4 أعمدة وصفوف مرنة تلقائية */
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: min-content; 
    
    /* المسافات */
    column-gap: 25px;
    row-gap: 15px;
    
    /* محاذاة العناصر للأعلى لمنع التمدد الطولي */
    align-content: start;

    /* التحكم في الارتفاع والسكرول */
    height: calc(100vh - 180px); 
    overflow-y: auto;
    overflow-x: hidden;

    background-color: #f8fafc;
    border-radius: 8px; 
    direction: rtl;
}

/* تحسين شريط التمرير */
.card-secteur-container::-webkit-scrollbar {
    width: 6px;
}
.card-secteur-container::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}
.card-secteur-container::-webkit-scrollbar-thumb:hover {
    background: #3b82f6;
}

/* ------------------------------------------------------ */
/* بطاقة المقاطعة (Secteur Card) */
/* ------------------------------------------------------ */
.secteur-card {
    width: 100%;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
    direction: rtl;
    height: fit-content; /* تنكمش البطاقة حسب محتواها */
}

.secteur-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* الرأس (Header) */
.card-header {
    background: #f8fafc;
    padding: 12px 15px 5px 15px;
    border-bottom: 1px solid #a827f3;
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
}

.secteur-label {
    font-size: 1rem;
    padding: 0 10px;
    margin-left: 8px;
    border-radius: 5px;
    background-color: rgb(212, 250, 231);
    color: #64748b;
}

.secteur-id {
    color: #1e3a8a;
    font-size: 0.85rem;
    border-radius: 5px;
    background-color: rgb(212, 250, 231);
    padding: 0 10px;
    font-weight: 800;
    flex-grow: 1;
    text-align: center;
}

.commune-name {
    color: #475569;
    font-size: 0.8rem;
    padding: 2px 10px;
    display: flex;
    align-items: center;
    border-radius: 5px;
    border: 1px solid #ddd;
    gap: 8px;
}
.commune-name-icon{
    color:#a9a9aa;
}

/* الجسم (Body) - تم توحيد الارتفاع هنا لضمان تماثل البطاقات */
.card-body {
    padding: 15px 20px;
    background: white;
    min-height: 75px; /* يضمن تماثل الارتفاع بين الشاغر والمشغول */
    display: flex;
    align-items: center;
}

/* تنسيق موحد للقسم الداخلي */
.inspector-section, .vacant-section {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
}

/* صندوق الأيقونة/الأفاتار */
.avatar-box {
    width: 45px;
    height: 45px;
    background: #eff6ff;
    color: #3b82f6;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
    flex-shrink: 0;
}

/* تغيير لون الأيقونة في حالة الشغور */
.avatar-box.vacant {
    background: #fef2f2;
    color: #ef4444;
}

.inspector-details {
    display: flex;
    flex-direction: column;
}

.role-title {
    font-size: 0.75rem;
    color: #94a3b8;
}

.inspector-name {
    font-weight: bold;
    color: #334155;
    font-size: 0.95rem;
}

.vacant-text {
    font-weight: bold;
    color: #ef4444;
    font-size: 0.95rem;
}

/* التذييل (Footer) */
.card-footer {
    display: flex;
    border-top: 1px solid #f1f5f9;
}

.btn-transfer,
.btn-history {
    flex: 1;
    padding: 10px;
    border: none;
    background: white;
    cursor: pointer;
    font-weight: bold;
    font-size: 0.75rem;
    font-family: 'Cairo', sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    transition: background 0.2s;
}

.btn-transfer {
    color: #2563eb;
    border-left: 1px solid #f1f5f9;
}

.btn-history {
    color: #64748b;
}

.btn-transfer:hover {
    background: #eff6ff;
}

.btn-history:hover {
    background: #f8fafc;
}

/* ====================================================== */
/* وضع الموبايل والشاشات الصغيرة (Responsive Design) */
/* ====================================================== */

/* الشاشات المتوسطة (Tablets) */
@media (max-width: 1024px) {
    .card-secteur-container {
        grid-template-columns: repeat(2, 1fr); /* عمودين فقط */
        column-gap: 15px;
    }
}

/* الشاشات الصغيرة (Mobile Phones) */
@media (max-width: 600px) {
    .layout-page {
        margin: 5px;
        height: auto;
    }

    .annee-scolare-container {
        flex-direction: column; /* جعل الهيدر عمودياً */
        gap: 10px;
        text-align: center;
    }

    .title-icon {
        margin-left: 5px;
    }

    .card-secteur-container {
        grid-template-columns: 1fr; /* عمود واحد فقط */
        margin: 10px 5px;
        padding: 5px;
        height: calc(100vh - 220px); /* تقليل الارتفاع لمراعاة حجم الهيدر الجديد */
    }

    .secteur-card {
        margin-bottom: 5px;
    }

    .header-top {
        flex-wrap: wrap; /* السماح للعناصر بالنزول لسطر جديد إذا ضاق المكان */
        gap: 5px;
    }

    .secteur-id {
        font-size: 0.75rem;
    }

    .card-body {
        padding: 10px;
        min-height: 60px;
    }

    .avatar-box {
        width: 35px;
        height: 35px;
        font-size: 1rem;
    }

    .inspector-name, .vacant-text {
        font-size: 0.85rem;
    }

    .btn-transfer, .btn-history {
        padding: 12px 5px; /* تكبير منطقة الضغط للأصابع */
        font-size: 0.7rem;
    }
}
</style>