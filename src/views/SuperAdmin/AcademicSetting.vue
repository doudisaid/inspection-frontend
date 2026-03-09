<template>
  <div class="academic-setting-wrapper">
    <div class="page-control-header">
      <button 
        :class="['tab-button', { active: currentTab === 1 }]" 
        @click="currentTab = 1"
      >
        <font-awesome-icon :icon="['fas', 'calendar-check']" />
        إعداد الموسم الدراسي
      </button>
      <button 
        :class="['tab-button', { active: currentTab === 2 }]" 
        @click="currentTab = 2"
      >
        <font-awesome-icon :icon="['fas', 'calendar-alt']" />
        رزنامة العطل المدرسية
      </button>
    </div>

    <AcademicYear v-if="currentTab === 1" />
    <HolidaysComp v-if="currentTab === 2" />
  </div>
</template>

<script setup>
// import "@/assets/academic-theme.css"
import { ref } from 'vue';
import AcademicYear from '@/components/superAdmin/academicYear.vue';
import HolidaysComp from '@/components/superAdmin/holidaysComp.vue';

const currentTab = ref(1);
</script>

