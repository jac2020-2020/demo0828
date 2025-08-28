<template>
    <div id="app" class="app-container">
        <router-view />
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
    // 设置iOS状态栏样式
    document.documentElement.style.setProperty('--status-bar-height', 'env(safe-area-inset-top)');
});
</script>

<style scoped>
.app-container {
    height: 100vh;
    width: 100vw;
    background: linear-gradient(180deg, #000000 0%, #1a1a1a 100%);
    overflow: hidden;
}
</style> 