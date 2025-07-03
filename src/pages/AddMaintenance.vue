<template>
  <q-page class="bg-dark-page">
    <div class="add-page-container q-pa-md">
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
        <div class="text-h5 text-white text-weight-medium">
          {{ isEdit ? 'Edit Maintenance' : 'Add Maintenance' }}
        </div>
      </div>

      <!-- No Vehicle Warning -->
      <div v-if="vehicles.length === 0" class="no-vehicle-warning q-mb-lg">
        <q-banner class="bg-warning text-dark rounded-borders">
          <template v-slot:avatar>
            <q-icon name="warning" />
          </template>
          You need to add a vehicle first before creating maintenance records.
          <template v-slot:action>
            <q-btn 
              flat 
              color="dark" 
              label="Add Vehicle" 
              @click="$router.push('/garage/add')"
            />
          </template>
        </q-banner>
      </div>

      <!-- Form -->
      <q-form v-if="vehicles.length > 0" @submit="saveRecord" class="maintenance-form">
        <q-card class="form-card">
          <q-card-section class="q-pa-lg">
            <!-- Vehicle Selection (only show if not editing and multiple vehicles) -->
            <div v-if="!isEdit && vehicles.length > 1" class="form-group q-mb-lg">
              <label class="form-label">Vehicle</label>
              <q-select
                v-model="form.vehicleId"
                :options="vehicleOptions"
                emit-value
                map-options
                filled
                dark
                :rules="[val => !!val || 'Vehicle is required']"
                class="form-input"
              >
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

            <!-- Date -->
            <div class="form-group q-mb-lg">
              <label class="form-label">Date</label>
              <q-input
                v-model="form.date"
                type="date"
                filled
                dark
                :rules="[val => !!val || 'Date is required']"
                class="form-input"
              />
            </div>

            <!-- Description -->
            <div class="form-group q-mb-lg">
              <label class="form-label">Description</label>
              <q-input
                v-model="form.description"
                placeholder="e.g., Oil change, Brake inspection..."
                filled
                dark
                :rules="[val => !!val || 'Description is required']"
                class="form-input"
              />
            </div>

            <!-- Technician -->
            <div class="form-group q-mb-lg">
              <label class="form-label">Technician</label>
              <q-input
                v-model="form.technician"
                placeholder="Technician name"
                filled
                dark
                :rules="[val => !!val || 'Technician name is required']"
                class="form-input"
              />
            </div>

            <!-- Cost and Mileage Row -->
            <div class="row q-gutter-md q-mb-lg">
              <div class="col">
                <div class="form-group">
                  <label class="form-label">Cost ($)</label>
                  <q-input
                    v-model.number="form.cost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    filled
                    dark
                    :rules="[val => val >= 0 || 'Cost must be positive']"
                    class="form-input"
                  />
                </div>
              </div>
              <div class="col">
                <div class="form-group">
                  <label class="form-label">Mileage (km)</label>
                  <q-input
                    v-model.number="form.mileage"
                    type="number"
                    min="0"
                    placeholder="0"
                    filled
                    dark
                    :rules="[val => val >= 0 || 'Mileage must be positive']"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div class="form-group q-mb-lg">
              <label class="form-label">Notes</label>
              <q-input
                v-model="form.notes"
                type="textarea"
                placeholder="Additional notes or observations..."
                filled
                dark
                rows="3"
                class="form-input"
              />
            </div>

            <!-- Next Maintenance Section -->
            <div class="next-maintenance-section q-mb-lg">
              <div class="section-header q-mb-md">
                <q-icon name="schedule" color="warning" class="q-mr-sm" />
                <span class="text-subtitle1 text-white text-weight-medium">Next Maintenance</span>
              </div>

              <!-- Next Maintenance Date -->
              <div class="form-group q-mb-md">
                <label class="form-label">Next Service Date</label>
                <q-input
                  v-model="form.nextMaintenance"
                  type="date"
                  filled
                  dark
                  clearable
                  class="form-input"
                />
              </div>

              <!-- Next Maintenance Mileage -->
              <div class="form-group">
                <label class="form-label">Next Service Mileage (km)</label>
                <q-input
                  v-model.number="form.nextMaintenanceMileage"
                  type="number"
                  min="0"
                  placeholder="Optional"
                  filled
                  dark
                  clearable
                  class="form-input"
                />
              </div>
            </div>
          </q-card-section>

          <!-- Actions -->
          <q-card-section class="q-pa-lg q-pt-none">
            <div class="row q-gutter-md">
              <div class="col">
                <q-btn
                  outline
                  color="grey-5"
                  label="Cancel"
                  @click="$router.back()"
                  class="full-width action-btn"
                  size="lg"
                />
              </div>
              <div class="col">
                <q-btn
                  type="submit"
                  color="primary"
                  :label="isEdit ? 'Update Record' : 'Save Record'"
                  class="full-width action-btn"
                  size="lg"
                  :loading="saving"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-form>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMaintenanceStore } from '../stores/maintenance'
import { useVehiclesStore } from '../stores/vehicles'

const route = useRoute()
const router = useRouter()
const maintenanceStore = useMaintenanceStore()
const vehiclesStore = useVehiclesStore()

const saving = ref(false)
const isEdit = computed(() => !!route.params.id)

const vehicles = computed(() => vehiclesStore.sortedVehicles)
const activeVehicle = computed(() => vehiclesStore.activeVehicle)

const vehicleOptions = computed(() => {
  return vehicles.value.map(vehicle => ({
    label: vehicle.name,
    value: vehicle.id,
    description: `${vehicle.year} ${vehicle.make} ${vehicle.model}`
  }))
})

const form = reactive({
  vehicleId: '',
  date: new Date().toISOString().split('T')[0],
  description: '',
  technician: '',
  cost: 0,
  mileage: 0,
  notes: '',
  nextMaintenance: '',
  nextMaintenanceMileage: undefined as number | undefined
})

onMounted(() => {
  // Set default vehicle if not editing
  if (!isEdit.value && activeVehicle.value) {
    form.vehicleId = activeVehicle.value.id
  }

  if (isEdit.value) {
    const record = maintenanceStore.getRecord(route.params.id as string)
    if (record) {
      Object.assign(form, {
        vehicleId: record.vehicleId,
        date: record.date,
        description: record.description,
        technician: record.technician,
        cost: record.cost,
        mileage: record.mileage,
        notes: record.notes,
        nextMaintenance: record.nextMaintenance || '',
        nextMaintenanceMileage: record.nextMaintenanceMileage
      })
    } else {
      router.push('/')
    }
  }
})

const saveRecord = async () => {
  saving.value = true
  
  try {
    const recordData = {
      vehicleId: form.vehicleId,
      date: form.date,
      description: form.description,
      technician: form.technician,
      cost: form.cost,
      mileage: form.mileage,
      notes: form.notes,
      nextMaintenance: form.nextMaintenance || undefined,
      nextMaintenanceMileage: form.nextMaintenanceMileage
    }

    if (isEdit.value) {
      maintenanceStore.updateRecord(route.params.id as string, recordData)
    } else {
      maintenanceStore.addRecord(recordData)
    }

    router.push('/')
  } catch (error) {
    console.error('Error saving record:', error)
  } finally {
    saving.value = false
  }
}
</script>

<style lang="sass" scoped>
.add-page-container
  max-width: 600px
  margin: 0 auto

.page-header
  display: flex
  align-items: center

.no-vehicle-warning
  max-width: 600px
  margin: 0 auto

.form-card
  background: rgba(255, 255, 255, 0.05)
  border: 1px solid rgba(255, 255, 255, 0.1)
  border-radius: 20px
  backdrop-filter: blur(10px)

.form-group
  .form-label
    display: block
    color: rgba(255, 255, 255, 0.8)
    font-size: 14px
    font-weight: 500
    margin-bottom: 8px

.form-input
  .q-field__control
    border-radius: 12px
    background: rgba(255, 255, 255, 0.08)
    border: 1px solid rgba(255, 255, 255, 0.1)

  .q-field__native
    color: white

.next-maintenance-section
  background: rgba(245, 158, 11, 0.1)
  border: 1px solid rgba(245, 158, 11, 0.2)
  border-radius: 16px
  padding: 20px

.section-header
  display: flex
  align-items: center

.action-btn
  border-radius: 12px
  font-weight: 600
</style>