<script setup>
import { provide } from 'vue'
import { useUserAccount } from '@/composables/useUserAccount.js'
import UserProfileCard from '@/components/account/UserProfileCard.vue'
import UserAccountOptions from '@/components/account/UserAccountOptions.vue'
import UserAccountPanel from '@/components/account/UserAccountPanel.vue'
import UserPhotoModal from '@/components/account/UserPhotoModal.vue'

const conta = useUserAccount()
provide('pci-user-account', conta)
</script>

<template>
  <div class="pagina">
    <UserProfileCard />
    <UserAccountOptions />
    <UserAccountPanel />
    <UserPhotoModal />
  </div>
</template>

<style scoped src="@/assets/css/UserView-layout.css"></style>
<style scoped src="@/assets/css/UserView-controls.css"></style>