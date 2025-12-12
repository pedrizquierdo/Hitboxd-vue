<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal-card slide-up">
      <h2 class="modal-title">Report Review</h2>

      <p class="modal-subtitle">Select a reason for reporting this review:</p>

      <div class="reason-list">
        <label v-for="option in reasons" :key="option.value" class="reason-item">
          <input
            type="radio"
            name="reportReason"
            :value="option.value"
            v-model="selectedReason"
          />
          <span>{{ option.label }}</span>
        </label>
      </div>
      
      <textarea
        v-if="selectedReason === 'other'"
        class="other-textarea"
        v-model="otherReasonText"
        placeholder="Describe the reason..."
      ></textarea>

      <div class="modal-actions">
        <button class="cancel-btn" @click="close">Cancel</button>
        <button
          class="submit-btn"
          :disabled="!canSubmit"
          @click="submit"
        >
          Submit Report
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['close', 'submit'])

const reasons = [
  { label: 'Spoilers without warning', value: 'spoilers' },
  { label: 'Offensive content', value: 'offensive' },
  { label: 'Spam or advertising', value: 'spam' },
  { label: 'Harassment or insults', value: 'harassment' },
  { label: 'Other', value: 'other' }
]

const selectedReason = ref(null)
const otherReasonText = ref('')

const canSubmit = computed(() => {
  if (!selectedReason.value) return false
  if (selectedReason.value === 'other' && otherReasonText.value.trim().length < 4)
    return false
  return true
})

const close = () => emit('close')

const submit = () => {
  let reason = selectedReason.value
  if (reason === 'other') reason = otherReasonText.value.trim()
  emit('submit', reason)
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-card {
  background: #F2F3F5;
  padding: 2rem;
  border-radius: 6px;
  width: 420px;
  box-shadow: 0 6px 12px rgba(0,0,0,0.35);
  animation: fadeIn 0.3s ease;
}

.modal-title {
  font-size: 1.6rem;
  margin: 0 0 0.5rem;
  font-family: 'Courier Prime', monospace;
  color: #2d2d2d;
}

.modal-subtitle {
  font-size: 0.95rem;
  margin-bottom: 1rem;
  color: #555;
}

.reason-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 1rem;
}

.reason-item {
  background: white;
  padding: 10px 14px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.reason-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.other-textarea {
  width: 100%;
  min-height: 80px;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  resize: none;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  background: #ccc;
  color: black;
  border: none;
  padding: 8px 14px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #b1b1b1;
}

.submit-btn {
  background: var(--brand-cyan);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.2s;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.submit-btn:not(:disabled):hover {
  transform: scale(1.05);
  background: #0095cc;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>