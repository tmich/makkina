<template>
  <q-page class="bg-dark-page">
    <!-- Vehicle Selector -->
    <div v-if="vehicles.length > 0" class="vehicle-selector q-pa-md">
      <q-select
        v-model="selectedVehicleId"
        :options="vehicleOptions"
        label="Select Vehicle"
        filled
        dark
        emit-value
        map-options
        @update:model-value="onVehicleChange"
        class="vehicle-select"
      >
        <template v-slot:prepend>
          <q-icon name="directions_car" />
        </template>
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
              <q-item-label caption>{{ scope.opt.description }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>

    <!-- No Vehicle Selected State -->
    <div v-if="vehicles.length === 0" class="no-vehicles-state text-center q-pa-xl">
      <q-icon name="garage" size="72px" color="grey-6" class="q-mb-md" />
      <div class="text-h6 text-grey-4 q-mb-sm">No vehicles in garage</div>
      <div class="text-body2 text-grey-6 q-mb-lg">
        Add a vehicle to start tracking maintenance
      </div>
      <q-btn 
        color="primary" 
        rounded 
        @click="$router.push('/garage/add')"
        class="q-px-lg"
      >
        <q-icon name="add" class="q-mr-sm" />
        Add Vehicle
      </q-btn>
    </div>

    <!-- Content for selected vehicle -->
    <div v-else-if="selectedVehicleId">
      <!-- Search Header -->
      <div class="search-header q-pa-md">
        <q-input
          v-model="maintenanceStore.searchQuery"
          placeholder="Search maintenance records..."
          dark
          filled
          rounded
          clearable
          class="search-input"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <!-- Stats Cards -->
      <div class="stats-section q-px-md q-pb-md">
        <div class="row q-gutter-md">
          <div class="col-5">
            <q-card class="stat-card bg-gradient-primary">
              <q-card-section class="text-white text-center">
                <div class="text-h4 text-weight-bold">{{ currentVehicleRecords.length }}</div>
                <div class="text-subtitle2">Total Records</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col">
            <q-card class="stat-card bg-gradient-secondary">
              <q-card-section class="text-white text-center">
                <div class="text-h5 text-weight-bold">${{ currentVehicleCost.toLocaleString() }}</div>
                <div class="text-subtitle2">Total Cost</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Records List -->
      <div class="records-section q-px-md">
        <div v-if="currentVehicleFilteredRecords.length === 0" class="empty-state text-center q-pa-xl">
          <q-icon name="build" size="72px" color="grey-6" class="q-mb-md" />
          <div class="text-h6 text-grey-4 q-mb-sm">No maintenance records</div>
          <div class="text-body2 text-grey-6 q-mb-lg">
            {{ maintenanceStore.searchQuery ? 'No records match your search' : 'Start by adding your first maintenance record' }}
          </div>
          <q-btn 
            v-if="!maintenanceStore.searchQuery"
            color="primary" 
            rounded 
            @click="$router.push('/add')"
            class="q-px-lg"
          >
            <q-icon name="add" class="q-mr-sm" />
            Add First Record
          </q-btn>
        </div>

        <div v-else class="q-pb-xl">
          <q-card
            v-for="record in currentVehicleFilteredRecords"
            :key="record.id"
            class="maintenance-card q-mb-md"
            @click="editRecord(record.id)"
          >
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-h6 text-weight-medium text-white q-mb-xs">
                    {{ record.description }}
                  </div>
                  <div class="text-caption text-grey-4 q-mb-sm">
                    {{ formatDate(record.date) }} • {{ record.mileage.toLocaleString() }} km
                  </div>
                  <div class="row items-center q-gutter-sm">
                    <q-chip 
                      dense 
                      color="primary" 
                      text-color="white" 
                      icon="person"
                      class="chip-small"
                    >
                      {{ record.technician }}
                    </q-chip>
                    <q-chip 
                      dense 
                      color="accent" 
                      text-color="white" 
                      icon="attach_money"
                      class="chip-small"
                    >
                      ${{ record.cost }}
                    </q-chip>
                  </div>
                </div>
                <div class="col-auto q-pl-md">
                  <q-btn
                    :ref="el => setRecordButtonRef(record.id, el)"
                    flat
                    round
                    icon="more_vert"
                    color="grey-5"
                    @click.stop="showRecordMenu(record.id)"
                  />
                </div>
              </div>
              
              <div v-if="record.nextMaintenance" class="next-maintenance q-mt-md">
                <q-icon name="schedule" color="warning" class="q-mr-xs" />
                <span class="text-warning text-caption">
                  Next: {{ formatDate(record.nextMaintenance) }}
                  <span v-if="record.nextMaintenanceMileage">
                    at {{ record.nextMaintenanceMileage.toLocaleString() }} km
                  </span>
                </span>
              </div>
              
              <div v-if="record.notes" class="notes q-mt-sm">
                <div class="text-body2 text-grey-4">{{ record.notes }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Record Menu -->
    <q-menu
      v-model="recordMenu.show"
      :target="recordMenu.target"
      anchor="bottom right"
      self="top right"
      class="record-menu"
    >
      <q-list dense>
        <q-item clickable v-ripple @click="editRecord(recordMenu.record?.id)">
          <q-item-section avatar>
            <q-icon name="edit" color="primary" />
          </q-item-section>
          <q-item-section>Edit</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="confirmDelete(recordMenu.record?.id)">
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
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMaintenanceStore, type MaintenanceRecord } from '../stores/maintenance'
import { useVehiclesStore } from '../stores/vehicles'
import { date, Dialog } from 'quasar'

const router = useRouter()
const maintenanceStore = useMaintenanceStore()
const vehiclesStore = useVehiclesStore()

const selectedVehicleId = ref<string | null>(null)
const recordButtonRefs = ref<Record<string, HTMLElement | null>>({})

const vehicles = computed(() => vehiclesStore.sortedVehicles)
const activeVehicle = computed(() => vehiclesStore.activeVehicle)

// Set initial selected vehicle
watch(activeVehicle, (newActiveVehicle) => {
  if (newActiveVehicle && !selectedVehicleId.value) {
    selectedVehicleId.value = newActiveVehicle.id
  }
}, { immediate: true })

const vehicleOptions = computed(() => {
  return vehicles.value.map(vehicle => ({
    label: vehicle.name,
    value: vehicle.id,
    description: `${vehicle.year} ${vehicle.make} ${vehicle.model}`
  }))
})

const currentVehicleRecords = computed(() => {
  if (!selectedVehicleId.value) return []
  return maintenanceStore.getRecordsForVehicle(selectedVehicleId.value)
})

const currentVehicleFilteredRecords = computed(() => {
  if (!selectedVehicleId.value) return []
  return maintenanceStore.getFilteredRecordsForVehicle(selectedVehicleId.value)
})

const currentVehicleCost = computed(() => {
  if (!selectedVehicleId.value) return 0
  return maintenanceStore.getTotalCostForVehicle(selectedVehicleId.value)
})

const recordMenu = reactive({
  show: false,
  target: null as any,
  record: null as MaintenanceRecord | null
})

const setRecordButtonRef = (id: string, el: HTMLElement | null) => {
  if (el) {
    recordButtonRefs.value[id] = el
  } else {
    delete recordButtonRefs.value[id]
  }
}

const formatDate = (dateStr: string) => {
  return date.formatDate(dateStr, 'MMM DD, YYYY')
}

const onVehicleChange = (vehicleId: string) => {
  vehiclesStore.setActiveVehicle(vehicleId)
}

const editRecord = (id?: string) => {
  if (id) {
    recordMenu.show = false
    router.push(`/edit/${id}`)
  }
}

const showRecordMenu = (recordId: string) => {
  const targetEl = recordButtonRefs.value[recordId]
  const record = maintenanceStore.getRecord(recordId)
  
  if (targetEl && record) {
    recordMenu.record = record
    recordMenu.target = targetEl
    
    // Defer showing the menu to the next tick to ensure target is properly set
    setTimeout(() => {
      recordMenu.show = true
    }, 0)
  }
}

const confirmDelete = (id?: string) => {
  if (!id) return
  
  recordMenu.show = false
  
  Dialog.create({
    title: 'Delete Record',
    message: 'Are you sure you want to delete this maintenance record? This action cannot be undone.',
    cancel: true,
    persistent: true,
    color: 'negative'
  }).onOk(() => {
    maintenanceStore.deleteRecord(id)
  })
}
</script>

<style lang="sass" scoped>
.vehicle-selector
  background: rgba(139, 92, 246, 0.1)
  backdrop-filter: blur(10px)

.vehicle-select
  .q-field__control
    border-radius: 16px

.search-header
  background: rgba(139, 92, 246, 0.05)
  backdrop-filter: blur(10px)

.search-input
  .q-field__control
    border-radius: 24px

.stats-section
  .stat-card
    border-radius: 16px
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3)

.bg-gradient-primary
  background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)

.bg-gradient-secondary
  background: linear-gradient(135deg, #F97316 0%, #FB923C 100%)

.maintenance-card
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

.chip-small
  font-size: 11px
  border-radius: 12px

.next-maintenance
  padding: 8px 12px
  background: rgba(245, 158, 11, 0.1)
  border-radius: 8px
  border-left: 3px solid #F59E0B

.notes
  padding: 8px 12px
  background: rgba(255, 255, 255, 0.05)
  border-radius: 8px
  border-left: 3px solid rgba(255, 255, 255, 0.2)

.empty-state, .no-vehicles-state
  margin-top: 60px

.record-menu
  background: rgba(30, 30, 46, 0.95)
  backdrop-filter: blur(10px)
  border-radius: 12px
</style>