<script setup lang="ts">
import '../../dist/esm/screenShot.css';
import ScreenShot from '../../dist/esm/screenShot';

const screenShot = new ScreenShot({
  mode: 'displayMedia',
});

const handleStartShot = () => {
  screenShot.shot();
};
</script>

<template>
  <div>
    <button class="shot-button" @click="handleStartShot">截屏</button>

    <img src="./assets/R.jfif" />
  </div>
</template>

<style lang="scss" scoped>
.shot-button {
  display: block;
}
</style>
