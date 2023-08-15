<script setup lang="ts">
import ScreenShot from '@screenshots/ScreenShot';

const screenShot = new ScreenShot();

const handleStartShot = () => {
  screenShot.shot();
};
</script>

<template>
  <button @click="handleStartShot">截屏</button>
</template>

<style scoped></style>
