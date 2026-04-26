<template>
  <Nav />
  <router-view />
  <Footer />
</template>

<script setup>
import Nav from '@/components/common/Nav.vue'
import Footer from '@/components/common/PageFooter.vue'
</script>
