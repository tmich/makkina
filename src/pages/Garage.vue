<template>
  <q-page class="bg-dark-page">
    <!-- Header -->
    <div class="garage-header q-pa-md">
      <div class="text-h5 text-white text-weight-medium q-mb-md">My Garage</div>
      <div class="text-body2 text-grey-4">Manage your vehicles</div>
    </div>

    <!-- Vehicle Cards -->
    <div class="vehicles-section q-px-md q-pb-xl">
      <div v-if="vehicles.length === 0" class="empty-state text-center q-pa-xl">
        <q-icon name="garage" size="72px" color="grey-6" class="q-mb-md" />
        <div class="text-h6 text-grey-4 q-mb-sm">No vehicles in garage</div>
        <div class="text-body2 text-grey-6 q-mb-lg">
          Add your first vehicle to start tracking maintenance
        </div>
        <q-btn 
          color="primary" 
          rounded 
          @click="router.push('/garage/add')"
          class="q-px-lg"
        >
          <q-icon name="add" class="q-mr-sm" />
          Add First Vehicle
        </q-btn>
      </div>

      <div v-else class="vehicles-grid">
        <q-card
          v-for="vehicle in vehicles"
          :key="vehicle.id"
          class="vehicle-card"
          :class="{ 'active-vehicle': vehicle.id === activeVehicleId }"
          @click="selectVehicle(vehicle.id)"
        >
          <q-card-section>
            <div class="vehicle-header q-mb-md">
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-h6 text-weight-medium text-white">
                    {{ vehicle.name }}
                  </div>
                  <div class="text-caption text-grey-4">
                    {{ vehicle.year }} {{ vehicle.make }} {{ vehicle.model }}
                  </div>
                </div>
                <div class="col-auto">
                  <q-btn
                    flat
                    round
                    icon="more_vert"
                    color="grey-5"
                    @click.stop="showVehicleMenu(vehicle, $event)"
                  />
                </div>
              </div>
            </div>

            <div class="vehicle-details q-mb-md">
              <div class="row q-gutter-sm">
                <q-chip 
                  dense 
                  :color="getFuelTypeColor(vehicle.fuelType)"
                  text-color="white" 
                  :icon="getFuelTypeIcon(vehicle.fuelType)"
                  class="chip-small"
                >
                  {{ vehicle.fuelType }}
                </q-chip>
                <q-chip 
                  dense 
                  color="grey-7" 
                  text-color="white" 
                  icon="palette"
                  class="chip-small"
                >
                  {{ vehicle.color }}
                </q-chip>
              </div>
            </div>

            <div class="vehicle-stats">
              <div class="row q-gutter-md">
                <div class="col text-center">
                  <div class="stat-value text-primary">{{ getRecordCount(vehicle.id) }}</div>
                  <div class="stat-label">Records</div>
                </div>
                <div class="col text-center">
                  <div class="stat-value text-accent">${{ getTotalCost(vehicle.id).toLocaleString() }}</div>
                  <div class="stat-label">Total Cost</div>
                </div>
                <div class="col text-center">
                  <div class="stat-value text-warning">{{ getUpcomingCount(vehicle.id) }}</div>
                  <div class="stat-label">Upcoming</div>
                </div>
              </div>
            </div>

            <div class="vehicle-mileage q-mt-md">
              <div class="text-caption text-grey-4">Current Mileage</div>
              <div class="text-h6 text-white">{{ vehicle.currentMileage.toLocaleString() }} km</div>
            </div>

            <div v-if="vehicle.id === activeVehicleId" class="active-badge">
              <q-icon name="check_circle" color="positive" />
              <span class="text-positive text-caption q-ml-xs">Active Vehicle</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Floating Action Button -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="add"
        color="primary"
        @click="router.push('/garage/add')"
        class="fab-shadow"
        size="lg"
      />
    </q-page-sticky>

    <!-- Vehicle Menu -->
    <q-menu
      v-model="vehicleMenu.show"
      :target="vehicleMenu.target"
      anchor="bottom right"
      self="top right"
      class="vehicle-menu"
    >
      <q-list dense>
        <q-item 
          v-if="vehicleMenu.vehicle?.id !== activeVehicleId"
          clickable 
          v-ripple 
          @click="setActiveVehicle(vehicleMenu.vehicle?.id)"
        >
          <q-item-section avatar>
            <q-icon name="radio_button_checked" color="positive" />
          </q-item-section>
          <q-item-section>Set as Active</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="editVehicle(vehicleMenu.vehicle?.id)">
          <q-item-section avatar>
            <q-icon name="edit" color="primary" />
          </q-item-section>
          <q-item-section>Edit</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="confirmDeleteVehicle(vehicleMenu.vehicle?.id)">
          <q-item-section avatar>
            <q-icon name="delete" color="negative" />
          </q-item-section>
          <q-item-section>Delete</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-page>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useVehiclesStore, type Vehicle } from '../stores/vehicles'
import { useMaintenanceStore } from '../stores/maintenance'
import { Dialog } from 'quasar'

const router = useRouter()
const vehiclesStore = useVehiclesStore()
const maintenanceStore = useMaintenanceStore()

const vehicles = computed(() => vehiclesStore.sortedVehicles)
const activeVehicleId = computed(() => vehiclesStore.activeVehicleId)

const vehicleMenu = reactive({
  show: false,
  target: null as any,
  vehicle: null as Vehicle | null
})

const getFuelTypeColor = (fuelType: string) => {
  const colors = {
    gasoline: 'orange',
    diesel: 'brown',
    electric: 'green',
    hybrid: 'blue'
  }
  return colors[fuelType as keyof typeof colors] || 'grey'
}

const getFuelTypeIcon = (fuelType: string) => {
  const icons = {
    gasoline: 'local_gas_station',
    diesel: 'local_gas_station',
    electric: 'electric_bolt',
    hybrid: 'eco'
  }
  return icons[fuelType as keyof typeof icons] || 'local_gas_station'
}

const getRecordCount = (vehicleId: string) => {
  return maintenanceStore.getRecordsForVehicle(vehicleId).length
}

const getTotalCost = (vehicleId: string) => {
  return maintenanceStore.getTotalCostForVehicle(vehicleId)
}

const getUpcomingCount = (vehicleId: string) => {
  return maintenanceStore.getUpcomingMaintenanceForVehicle(vehicleId).length
}

const selectVehicle = (vehicleId: string) => {
  vehiclesStore.setActiveVehicle(vehicleId)
  router.push('/')
}

const setActiveVehicle = (vehicleId?: string) => {
  if (vehicleId) {
    vehiclesStore.setActiveVehicle(vehicleId)
    vehicleMenu.show = false
  }
}

const editVehicle = (vehicleId?: string) => {
  if (vehicleId) {
    vehicleMenu.show = false
    router.push(`/garage/edit/${vehicleId}`)
  }
}

const showVehicleMenu = (vehicle: Vehicle, event: Event) => {
  vehicleMenu.vehicle = vehicle
  vehicleMenu.target = event.currentTarget
  
  setTimeout(() => {
    vehicleMenu.show = true
  }, 0)
}

const confirmDeleteVehicle = (vehicleId?: string) => {
  if (!vehicleId) return
  
  vehicleMenu.show = false
  
  const recordCount = getRecordCount(vehicleId)
  const message = recordCount > 0 
    ? `This vehicle has ${recordCount} maintenance record${recordCount > 1 ? 's' : ''}. Deleting the vehicle will also delete all associated maintenance records. This action cannot be undone.`
    : 'Are you sure you want to delete this vehicle? This action cannot be undone.'
  
  Dialog.create({
    title: 'Delete Vehicle',
    message,
    cancel: true,
    persistent: true,
    color: 'negative'
  }).onOk(() => {
    // Delete all maintenance records for this vehicle
    const records = maintenanceStore.getRecordsForVehicle(vehicleId)
    records.forEach(record => {
      maintenanceStore.deleteRecord(record.id)
    })
    
    // Delete the vehicle
    vehiclesStore.deleteVehicle(vehicleId)
  })
}
</script>

<style lang="sass" scoped>
.garage-header
  background: rgba(139, 92, 246, 0.1)
  backdrop-filter: blur(10px)

.vehicles-grid
  display: grid
  gap: 16px

.vehicle-card
  background: rgba(255, 255, 255, 0.05)
  border: 1px solid rgba(255, 255, 255, 0.1)
  border-radius: 16px
  backdrop-filter: blur(10px)
  cursor: pointer
  transition: all 0.3s ease

  &:hover
    background: rgba(255, 255, 255, 0.08)
    transform: translateY(-2px)
    box-shadow: 0 8px 32px rgba(139, 92, 246, 0.2)

  &.active-vehicle
    border-color: rgba(16, 185, 129, 0.5)
    background: rgba(16, 185, 129, 0.1)

.chip-small
  font-size: 11px
  border-radius: 12px

.vehicle-stats
  padding: 16px
  background: rgba(255, 255, 255, 0.05)
  border-radius: 12px

.stat-value
  font-size: 18px
  font-weight: bold
  margin-bottom: 4px

.stat-label
  font-size: 11px
  color: rgba(255, 255, 255, 0.6)
  text-transform: uppercase
  letter-spacing: 0.5px

.vehicle-mileage
  padding: 12px
  background: rgba(255, 255, 255, 0.05)
  border-radius: 8px
  border-left: 3px solid #8B5CF6

.active-badge
  display: flex
  align-items: center
  justify-content: center
  margin-top: 12px
  padding: 8px
  background: rgba(16, 185, 129, 0.1)
  border-radius: 8px

.empty-state
  margin-top: 60px

.fab-shadow
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4)

.vehicle-menu
  background: rgba(30, 30, 46, 0.95)
  backdrop-filter: blur(10px)
  border-radius: 12px
</style>