<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import hardcodedSpace from '@/helpers/space.json';
import { clone, shorten, explorerUrl } from '@/helpers/utils';
import { validateForm } from '@/helpers/validation';

const DEFAULT_FORM_STATE = {
  link: ''
};

const props = defineProps({
  open: Boolean,
  connectionDetails: {
    type: Object,
    required: true
  },
  loading: Boolean
});

const emit = defineEmits(['add', 'close', 'connect', 'logout']);

const form = reactive(clone(DEFAULT_FORM_STATE));
const connectionLoading = ref(false);

watch(
  () => props.loading,
  () => {
    if (!props.loading) {
      connectionLoading.value = false;
      emit('close');
    }
  }
);

function handleSubmit() {
  connectionLoading.value = true;
  emit('connect', hardcodedSpace.wallet, form.link);
}

const errors = computed(() =>
  validateForm(
    {
      type: 'object',
      properties: {
        link: {
          type: 'string',
          format: 'walletConnectLink'
        }
      },
      additionalProperties: true
    },
    { link: form.link }
  )
);

function handleLogout() {
  form.link = '';
  emit('logout');
}
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template #header>
      <h3 v-text="'WalletConnect'" />
    </template>

    <div class="s-box p-4">
      <div v-if="!connectionDetails.value || !connectionDetails.value.connected" class="relative">
        <SIString
          v-model="form.link"
          :error="errors.link"
          :definition="{
            title: 'Connection link',
            examples: ['e.g. wc:e195250f-26ab...']
          }"
        />
      </div>
      <div v-else-if="connectionDetails.value.connected">
        <a
          :href="explorerUrl(connectionDetails.value.chainId, connectionDetails.value.accounts[0])"
          target="_blank"
          class="block"
        >
          <UiButton class="button-outline w-full flex justify-center items-center">
            <Stamp :id="connectionDetails.value.accounts[0]" :size="18" class="mr-2 -ml-1" />
            <span v-text="shorten(connectionDetails.value.accounts[0])" />
            <IH-external-link class="inline-block ml-1" />
          </UiButton>
        </a>
      </div>
    </div>

    <template #footer>
      <div v-if="connectionLoading" class="px-4 py-3 block flex justify-center">
        <UiLoading />
      </div>
      <template v-else>
        <div v-if="!connectionDetails.value || !connectionDetails.value.connected">
          <UiButton class="w-full" :disabled="!!errors.link" @click="handleSubmit"
            >Connect</UiButton
          >
        </div>
        <div v-else-if="connectionDetails.value.connected">
          <UiButton class="button-outline w-full !text-red" @click="handleLogout">Log out</UiButton>
        </div>
      </template>
    </template>
  </UiModal>
</template>
