<script setup lang="ts">
import ScreenShot from '@screenshots/ScreenShot';

const screenShot = new ScreenShot({});

const handleStartShot = () => {
  screenShot.shot();
};
</script>

<template>
  <div>
    <button @click="handleStartShot">截屏</button>

    <img src="./assets/R.jfif" />
  </div>
</template>

<style scoped></style>
@screenshots/screenShot