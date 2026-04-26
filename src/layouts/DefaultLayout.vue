<template>
  <Nav />
  <router-view />
  <Footer />
  <ToastNotification />
</template>

<script setup>
import Nav from '@/components/common/Nav.vue'
import Footer from '@/components/common/PageFooter.vue'
import ToastNotification from '@/components/common/ToastNotification.vue'
</script>
