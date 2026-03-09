<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content">
            <div class="modal-header">
                <h3>
                    <font-awesome-icon :icon="['fas', 'history']" class="header-icon" />
                    سجل تحركات المقاطعة: {{ secteur?.secteurname }}
                </h3>
                <button class="close-btn" @click="$emit('close')">&times;</button>
            </div>

            <div class="modal-body">
                <div v-if="!history || history.length === 0" class="empty-state">
                    <font-awesome-icon :icon="['fas', 'folder-open']" class="empty-icon" />
                    <p>لا يوجد سجل تحركات لهذه المقاطعة حتى الآن.</p>
                </div>

                <div v-else class="timeline-container">
                    <div v-for="(item, index) in history" :key="item.id" class="timeline-item">
                        <div class="timeline-marker">
                            <div class="dot"></div>
                            <div v-if="index !== history.length - 1" class="line"></div>
                        </div>

                        <div class="timeline-content">
                            <div class="timeline-header">
                                <span class="date">{{ formatDate(item.createdAt) }}</span>
                            </div>

                            <div class="timeline-card">
                                <div class="inspector-info">
                                    <font-awesome-icon :icon="['fas', 'user-check']" class="info-icon" />
                                    <span>المفتش: <strong>{{ item.inspector?.username || 'غير محدد' }}</strong></span>
                                </div>

                                <div class="year-info">
                                    <span>السنة الدراسية: {{ item.year?.yearname }}</span>
                                </div>

                                <div v-if="item.note" class="note-box">
                                    <font-awesome-icon :icon="['fas', 'sticky-note']" />
                                    <p>{{ item.note }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-close" @click="$emit('close')">إغلاق النافذة</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'HistoryModal',
    props: {
        secteur: {
            type: Object,
            required: true
        },
        history: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        formatDate(dateString) {
            if (!dateString) return '';
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return new Date(dateString).toLocaleDateString('ar-DZ', options);
        }
    }
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(15, 23, 42, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    backdrop-filter: blur(4px);
    direction: rtl;
    
}

.modal-content {
    background: white;
    width: 550px;
    max-height: 85vh;
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    animation: modalSlide 0.3s ease-out;
    overflow: hidden;;
}

@keyframes modalSlide {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header {
    padding: 20px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8fafc;
}

.header-icon {
    color: #8b5cf6;
    margin-left: 10px;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #94a3b8;
    cursor: pointer;
}

.modal-body {
    padding: 25px;
    overflow-y: auto;
    flex-grow: 1;
}

/* Timeline CSS */
.timeline-container {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.timeline-item {
    display: flex;
    gap: 20px;
}

.timeline-marker {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.dot {
    width: 14px;
    height: 14px;
    background: #8b5cf6;
    border-radius: 50%;
    border: 3px solid #ddd6fe;
}

.line {
    width: 2px;
    flex-grow: 1;
    background: #e2e8f0;
    margin: 5px 0;
}

.timeline-content {
    padding-bottom: 30px;
    flex-grow: 1;
}

.timeline-header {
    margin-bottom: 8px;
}

.date {
    font-size: 0.8rem;
    color: #64748b;
    background: #f1f5f9;
    padding: 4px 10px;
    border-radius: 20px;
}

.timeline-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.inspector-info {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #1e293b;
    margin-bottom: 10px;
}

.info-icon {
    color: #10b981;
}

.note-box {
    background: #fdf4ff;
    border-right: 3px solid #d946ef;
    padding: 10px;
    border-radius: 4px;
    display: flex;
    gap: 10px;
    font-size: 0.85rem;
    color: #701a75;
}

.empty-state {
    text-align: center;
    padding: 40px;
    color: #94a3b8;
}

.empty-icon {
    font-size: 3rem;
    margin-bottom: 15px;
    opacity: 0.3;
}

.modal-footer {
    padding: 15px 20px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
    background: #f8fafc;
}

.btn-close {
    padding: 10px 20px;
    background: #64748b;
    font-family: 'cairo',sans-serif;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}
</style>