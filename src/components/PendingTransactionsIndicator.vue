<script lang="ts">
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUiStore } from '@/stores/ui';

const uiStore = useUiStore();
const pendingTransactionsModalOpen = ref(false);

const totalCount = computed(
  () => uiStore.pendingTransactions.length + uiStore.broadcastingTransactionsCount
);
</script>

<template>
  <UiButton
    v-if="totalCount > 0"
    v-bind="$attrs"
    class="!px-0 w-[46px] text-white bg-blue border-blue focus-within:border-blue focus:border-blue"
    title="Pending transactions"
    @click="pendingTransactionsModalOpen = true"
  >
    {{ totalCount }}
  </UiButton>
  <teleport to="#modal">
    <ModalPendingTransactions
      :open="pendingTransactionsModalOpen"
      @close="pendingTransactionsModalOpen = false"
    />
  </teleport>
</template>
