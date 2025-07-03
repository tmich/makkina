<template>
  <q-page class="bg-dark-page">
    <div class="settings-container q-pa-md">
      <!-- Header -->
      <div class="page-header q-mb-lg">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="white"
          @click="$router.back()"
          class="q-mr-md"
        />
        <div class="text-h5 text-white text-weight-medium">Settings</div>
      </div>

      <!-- Settings Cards -->
      <div class="settings-content">
        <!-- Data Management -->
        <q-card class="settings-card q-mb-md">
          <q-card-section>
            <div class="text-h6 text-white q-mb-md">
              <q-icon name="storage" class="q-mr-sm" />
              Data Management
            </div>
            
            <q-list>
              <q-item clickable v-ripple @click="exportData" class="rounded-borders">
                <q-item-section avatar>
                  <q-icon name="download" color="accent" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-white">Export Data</q-item-label>
                  <q-item-label caption>Download your maintenance records as JSON</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="arrow_forward_ios" color="grey-5" size="sm" />
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="triggerImport" class="rounded-borders">
                <q-item-section avatar>
                  <q-icon name="upload" color="secondary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-white">Import Data</q-item-label>
                  <q-item-label caption>Upload maintenance records from JSON file</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="arrow_forward_ios" color="grey-5" size="sm" />
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="confirmClearData" class="rounded-borders">
                <q-item-section avatar>
                  <q-icon name="delete_sweep" color="negative" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-white">Clear All Data</q-item-label>
                  <q-item-label caption>Remove all maintenance records</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="arrow_forward_ios" color="grey-5" size="sm" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Statistics -->
        <q-card class="settings-card q-mb-md">
          <q-card-section>
            <div class="text-h6 text-white q-mb-md">
              <q-icon name="analytics" class="q-mr-sm" />
              Statistics
            </div>
            
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value text-primary">{{ records.length }}</div>
                <div class="stat-label">Total Records</div>
              </div>
              <div class="stat-item">
                <div class="stat-value text-accent">${{ totalCost.toLocaleString() }}</div>
                <div class="stat-label">Total Spent</div>
              </div>
              <div class="stat-item">
                <div class="stat-value text-secondary">{{ upcomingCount }}</div>
                <div class="stat-label">Upcoming</div>
              </div>
              <div class="stat-item">
                <div class="stat-value text-warning">{{ averageCost.toLocaleString() }}</div>
                <div class="stat-label">Avg Cost</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Notifications -->
        <q-card class="settings-card q-mb-md">
          <q-card-section>
            <div class="text-h6 text-white q-mb-md">
              <q-icon name="notifications" class="q-mr-sm" />
              Notifications
            </div>
            
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label class="text-white">Enable Notifications</q-item-label>
                  <q-item-label caption>Get reminded about upcoming maintenance</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    v-model="notificationsEnabled"
                    color="primary"
                    @update:model-value="updateNotificationSettings"
                  />
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <q-item-label class="text-white">Reminder Days</q-item-label>
                  <q-item-label caption>Days before maintenance to remind</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-select
                    v-model="reminderDays"
                    :options="reminderOptions"
                    dense
                    dark
                    filled
                    style="min-width: 80px"
                    @update:model-value="updateNotificationSettings"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- About -->
        <q-card class="settings-card">
          <q-card-section>
            <div class="text-h6 text-white q-mb-md">
              <q-icon name="info" class="q-mr-sm" />
              About Makkina
            </div>
            
            <div class="about-content">
              <div class="app-logo q-mb-md">
                <q-icon name="build_circle" size="48px" color="primary" />
              </div>
              <div class="text-body1 text-white q-mb-sm">Makkina v1.0</div>
              <div class="text-body2 text-grey-4 q-mb-md">
                Your personal car maintenance companion. Keep track of all your vehicle maintenance records with ease.
              </div>
              <div class="text-caption text-grey-5">
                Built with Vue 3 + Quasar Framework
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      @change="handleImport"
      style="display: none"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMaintenanceStore } from '../stores/maintenance'
import { Dialog, LocalStorage } from 'quasar'

const router = useRouter()
const maintenanceStore = useMaintenanceStore()
const fileInput = ref<HTMLInputElement>()

// Settings state
const notificationsEnabled = ref(true)
const reminderDays = ref(7)
const reminderOptions = [1, 3, 7, 14, 30]

// Computed stats
const records = computed(() => maintenanceStore.records)
const totalCost = computed(() => maintenanceStore.totalCost)
const upcomingCount = computed(() => maintenanceStore.upcomingMaintenance.length)
const averageCost = computed(() => {
  const total = totalCost.value
  const count = records.value.length
  return count > 0 ? Math.round(total / count) : 0
})

onMounted(() => {
  // Load settings from localStorage
  const savedNotifications = LocalStorage.getItem('makkina-notifications-enabled')
  const savedReminderDays = LocalStorage.getItem('makkina-reminder-days')
  
  if (savedNotifications !== null) {
    notificationsEnabled.value = savedNotifications
  }
  if (savedReminderDays !== null) {
    reminderDays.value = savedReminderDays
  }
})

const updateNotificationSettings = () => {
  LocalStorage.set('makkina-notifications-enabled', notificationsEnabled.value)
  LocalStorage.set('makkina-reminder-days', reminderDays.value)
  
  // Request notification permission if enabling
  if (notificationsEnabled.value && 'Notification' in window) {
    Notification.requestPermission()
  }
}

const exportData = () => {
  maintenanceStore.exportData()
}

const triggerImport = () => {
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

const confirmClearData = () => {
  Dialog.create({
    title: 'Clear All Data',
    message: 'Are you sure you want to delete all maintenance records? This action cannot be undone.',
    cancel: true,
    persistent: true,
    color: 'negative'
  }).onOk(() => {
    LocalStorage.remove('makkina-maintenance-records')
    maintenanceStore.records.length = 0
    router.push('/')
  })
}
</script>

<style lang="sass" scoped>
.settings-container
  max-width: 600px
  margin: 0 auto

.page-header
  display: flex
  align-items: center

.settings-card
  background: rgba(255, 255, 255, 0.05)
  border: 1px solid rgba(255, 255, 255, 0.1)
  border-radius: 16px
  backdrop-filter: blur(10px)

.stats-grid
  display: grid
  grid-template-columns: 1fr 1fr
  gap: 16px

.stat-item
  text-align: center
  padding: 16px
  background: rgba(255, 255, 255, 0.05)
  border-radius: 12px

.stat-value
  font-size: 20px
  font-weight: bold
  margin-bottom: 4px

.stat-label
  font-size: 12px
  color: rgba(255, 255, 255, 0.6)
  text-transform: uppercase
  letter-spacing: 0.5px

.about-content
  text-align: center

.app-logo
  display: flex
  justify-content: center
</style>