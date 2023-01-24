<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { createContractCallTransaction } from '@/helpers/transactions';
import hardcodedSpace from '@/helpers/space.json';
import { useWalletConnect } from '@/composables/useWalletConnect';
import { clone, shorten, explorerUrl, getUrl } from '@/helpers/utils';

const DEFAULT_FORM_STATE = {
  link: ''
};

const props = defineProps({
  open: Boolean,
  initialState: Object
});

const { connect, logout, loading, logged, address, requests, parseCall, connectionDetails } =
  useWalletConnect();

const emit = defineEmits(['add', 'close']);

const form = reactive(clone(DEFAULT_FORM_STATE));

function handleSubmit() {
  connect(hardcodedSpace.wallet, form.link);
  emit('close');
}

function handleLogout() {
  form.link = '';
  logout();
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
      <div v-if="!connectionDetails.value || !connectionDetails.value.connected">
        <UiButton class="w-full" @click="handleSubmit">Connect</UiButton>
      </div>
      <div v-else-if="connectionDetails.value.connected">
        <UiButton class="button-outline w-full !text-red" @click="handleLogout">Log out</UiButton>
      </div>
    </template>
  </UiModal>
</template>
