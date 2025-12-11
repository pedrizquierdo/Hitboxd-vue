<script setup></script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@700&family=Inter:wght@400;600;800&display=swap');

:root {
  --bg-color: #E3E4E8;
  --text-main: #2D2D2D;
  --card-bg: #757575;
  --brand-cyan: #00AEEF;
  --brand-red:#FF4444;
  --brand-green:  #00CC66;
  --brand-yellow: #FFD700;
  --white: #FFFFFF;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: var(--bg-color);
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
  scroll-behavior: smooth;
}

#app {
  margin: 0;
  padding: 0;
  width: 100%;
}
</style>
