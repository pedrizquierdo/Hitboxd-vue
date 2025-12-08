<template>
  <div class="star-wrap">
    <span
      v-for="n in 5"
      :key="n"
      class="star"
      :class="{ active: n <= modelValue }"
      @click="disabled ? null : update(n)"
    >★</span>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: Number,
  disabled: Boolean
});

const emit = defineEmits(["update:modelValue"]);

const update = (value) => emit("update:modelValue", value);
</script>

<style scoped>
.star-wrap {
  font-size: 1.6rem;
  color: #999;
  cursor: pointer;
}
.star {
  margin: 0 3px;
}
.active {
  color: var(--brand-cyan);
}
</style>