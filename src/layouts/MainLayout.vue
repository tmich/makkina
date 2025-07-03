<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-gradient-primary text-white" elevated>
      <q-toolbar>
        <q-avatar size="40px" class="q-mr-sm">
          <div class="logo-icon">
            <q-icon name="build_circle" size="28px" />
          </div>
        </q-avatar>
        
        <q-toolbar-title class="text-weight-bold">
          Makkina
        </q-toolbar-title>

        <q-btn 
          flat 
          round 
          dense 
          icon="notifications"
          @click="showNotifications"
          class="q-mr-xs"
        >
          <q-badge 
            v-if="upcomingCount > 0"
            color="negative" 
            floating
            rounded
          >
            {{ upcomingCount }}
          </q-badge>
        </q-btn>

        <q-btn 
          flat 
          round 
          dense 
          icon="more_vert"
          @click="showMenu = !showMenu"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="showMenu"
      side="right"
      overlay
      behavior="mobile"
      class="bg-dark text-white"
      width="280"
    >
      <q-list class="q-pt-lg">
        <q-item 
          clickable 
          v-ripple 
          @click="$router.push('/garage')"
          class="rounded-borders q-ma-sm"
        >
          <q-item-section avatar>
            <q-icon name="garage" color="secondary" />
          </q-item-section>
          <q-item-section>My Garage</q-item-section>
        </q-item>

        <q-item 
          clickable 
          v-ripple 
          @click="$router.push('/settings')"
          class="rounded-borders q-ma-sm"
        >
          <q-item-section avatar>
            <q-icon name="settings" color="primary" />
          </q-item-section>
          <q-item-section>Settings</q-item-section>
        </q-item>
        
        <q-separator class="q-my-md" dark />
        
        <q-item 
          clickable 
          v-ripple 
          @click="exportData"
          class="rounded-borders q-ma-sm"
        >
          <q-item-section avatar>
            <q-icon name="download" color="accent" />
          </q-item-section>
          <q-item-section>Export Data</q-item-section>
        </q-item>
        
        <q-item 
          clickable 
          v-ripple 
          @click="triggerImport"
          class="rounded-borders q-ma-sm"
        >
          <q-item-section avatar>
            <q-icon name="upload" color="secondary" />
          </q-item-section>
          <q-item-section>Import Data</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Floating Action Button -->
    <q-page-sticky 
      v-if="$route.name === 'home'"
      position="bottom-right" 
      :offset="[18, 18]"
    >
      <q-btn
        fab
        icon="add"
        color="primary"
        @click="$router.push('/add')"
        class="fab-shadow"
        size="lg"
      />
    </q-page-sticky>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      @change="handleImport"
      style="display: none"
    />

    <!-- Notifications Dialog -->
    <q-dialog v-model="notificationsDialog">
      <q-card class="notification-card" style="min-width: 300px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Upcoming Maintenance</div>
        </q-card-section>
        
        <q-card-section v-if="upcomingMaintenance.length === 0">
          <div class="text-center text-grey-6 q-pa-md">
            <q-icon name="check_circle" size="48px" color="positive" class="q-mb-md" />
            <div class="text-subtitle1">All caught up!</div>
            <div class="text-body2">No upcoming maintenance scheduled.</div>
          </div>
        </q-card-section>
        
        <q-card-section v-else class="q-pa-none">
          <q-list>
            <q-item 
              v-for="record in upcomingMaintenance.slice(0, 5)" 
              :key="record.id"
              class="q-pa-md"
            >
              <q-item-section avatar>
                <q-icon name="schedule" color="warning" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ record.description }}
                </q-item-label>
                <q-item-label caption>
                  {{ getVehicleName(record.vehicleId) }}
                </q-item-label>
                <q-item-label caption>
                  Due: {{ formatDate(record.nextMaintenance!) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMaintenanceStore } from '../stores/maintenance'
import { useVehiclesStore } from '../stores/vehicles'
import { date } from 'quasar'

const maintenanceStore = useMaintenanceStore()
const vehiclesStore = useVehiclesStore()
const showMenu = ref(false)
const notificationsDialog = ref(false)
const fileInput = ref<HTMLInputElement>()

const upcomingMaintenance = computed(() => maintenanceStore.upcomingMaintenance)
const upcomingCount = computed(() => upcomingMaintenance.value.length)

const formatDate = (dateStr: string) => {
  return date.formatDate(dateStr, 'MMM DD, YYYY')
}

const getVehicleName = (vehicleId: string) => {
  const vehicle = vehiclesStore.getVehicle(vehicleId)
  return vehicle ? vehicle.name : 'Unknown Vehicle'
}

const showNotifications = () => {
  notificationsDialog.value = true
}

const exportData = () => {
  showMenu.value = false
  maintenanceStore.exportData()
}

const triggerImport = () => {
  showMenu.value = false
  fileInput.value?.click()
}

const handleImport = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    maintenanceStore.importData(file)
    target.value = '' // Reset input
  }
}
</script>

<style lang="sass" scoped>
.bg-gradient-primary
  background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)

.logo-icon
  background: rgba(255, 255, 255, 0.2)
  border-radius: 50%
  padding: 6px
  display: flex
  align-items: center
  justify-content: center

.fab-shadow
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4)

.notification-card
  border-radius: 16px
  overflow: hidden
</style>