<template>
  <q-page class="bg-dark-page">
    <div class="add-vehicle-container q-pa-md">
      <!-- Header -->
      <div class="page-header q-mb-lg">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="white"
          @click="router.back()"
          class="q-mr-md"
        />
        <div class="text-h5 text-white text-weight-medium">
          {{ isEdit ? 'Edit Vehicle' : 'Add Vehicle' }}
        </div>
      </div>

      <!-- Form -->
      <q-form @submit="saveVehicle" class="vehicle-form">
        <q-card class="form-card">
          <q-card-section class="q-pa-lg">
            <!-- Vehicle Name -->
            <div class="form-group q-mb-lg">
              <label class="form-label">Vehicle Name</label>
              <q-input
                v-model="form.name"
                placeholder="e.g., My Honda Civic, Work Truck..."
                filled
                dark
                :rules="[val => !!val || 'Vehicle name is required']"
                class="form-input"
              />
            </div>

            <!-- Make and Model Row -->
            <div class="row q-gutter-md q-mb-lg">
              <div class="col">
                <div class="form-group">
                  <label class="form-label">Make</label>
                  <q-input
                    v-model="form.make"
                    placeholder="Honda, Toyota, Ford..."
                    filled
                    dark
                    :rules="[val => !!val || 'Make is required']"
                    class="form-input"
                  />
                </div>
              </div>
              <div class="col">
                <div class="form-group">
                  <label class="form-label">Model</label>
                  <q-input
                    v-model="form.model"
                    placeholder="Civic, Camry, F-150..."
                    filled
                    dark
                    :rules="[val => !!val || 'Model is required']"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <!-- Year and Color Row -->
            <div class="row q-gutter-md q-mb-lg">
              <div class="col">
                <div class="form-group">
                  <label class="form-label">Year</label>
                  <q-input
                    v-model.number="form.year"
                    type="number"
                    :min="1900"
                    :max="new Date().getFullYear() + 1"
                    placeholder="2020"
                    filled
                    dark
                    :rules="[
                      val => !!val || 'Year is required',
                      val => val >= 1900 || 'Year must be 1900 or later',
                      val => val <= new Date().getFullYear() + 1 || 'Year cannot be in the future'
                    ]"
                    class="form-input"
                  />
                </div>
              </div>
              <div class="col">
                <div class="form-group">
                  <label class="form-label">Color</label>
                  <q-select
                    v-model="form.color"
                    :options="colorOptions"
                    filled
                    dark
                    :rules="[val => !!val || 'Color is required']"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <!-- License Plate -->
            <div class="form-group q-mb-lg">
              <label class="form-label">License Plate</label>
              <q-input
                v-model="form.licensePlate"
                placeholder="ABC-1234"
                filled
                dark
                :rules="[val => !!val || 'License plate is required']"
                class="form-input"
              />
            </div>

            <!-- Fuel Type -->
            <div class="form-group q-mb-lg">
              <label class="form-label">Fuel Type</label>
              <q-select
                v-model="form.fuelType"
                :options="fuelTypeOptions"
                emit-value
                map-options
                filled
                dark
                :rules="[val => !!val || 'Fuel type is required']"
                class="form-input"
              />
            </div>

            <!-- Current Mileage -->
            <div class="form-group q-mb-lg">
              <label class="form-label">Current Mileage (km)</label>
              <q-input
                v-model.number="form.currentMileage"
                type="number"
                min="0"
                placeholder="50000"
                filled
                dark
                :rules="[
                  val => val !== null && val !== undefined || 'Current mileage is required',
                  val => val >= 0 || 'Mileage must be positive'
                ]"
                class="form-input"
              />
            </div>

            <!-- VIN (Optional) -->
            <div class="form-group q-mb-lg">
              <label class="form-label">VIN (Optional)</label>
              <q-input
                v-model="form.vin"
                placeholder="17-character Vehicle Identification Number"
                filled
                dark
                maxlength="17"
                class="form-input"
              />
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
                  @click="router.back()"
                  class="full-width action-btn"
                  size="lg"
                />
              </div>
              <div class="col">
                <q-btn
                  type="submit"
                  color="primary"
                  :label="isEdit ? 'Update Vehicle' : 'Add Vehicle'"
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
import { useVehiclesStore } from '../stores/vehicles'

const route = useRoute()
const router = useRouter()
const vehiclesStore = useVehiclesStore()

const saving = ref(false)
const isEdit = computed(() => !!route.params.id)

const colorOptions = [
  'Black', 'White', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Yellow', 
  'Orange', 'Brown', 'Purple', 'Pink', 'Gold', 'Beige', 'Maroon'
]

const fuelTypeOptions = [
  { label: 'Gasoline', value: 'gasoline' },
  { label: 'Diesel', value: 'diesel' },
  { label: 'Electric', value: 'electric' },
  { label: 'Hybrid', value: 'hybrid' }
]

const form = reactive({
  name: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  color: '',
  licensePlate: '',
  vin: '',
  currentMileage: 0,
  fuelType: 'gasoline' as 'gasoline' | 'diesel' | 'electric' | 'hybrid'
})

onMounted(() => {
  if (isEdit.value) {
    const vehicle = vehiclesStore.getVehicle(route.params.id as string)
    if (vehicle) {
      Object.assign(form, {
        name: vehicle.name,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        licensePlate: vehicle.licensePlate,
        vin: vehicle.vin || '',
        currentMileage: vehicle.currentMileage,
        fuelType: vehicle.fuelType
      })
    } else {
      router.push('/garage')
    }
  }
})

const saveVehicle = async () => {
  saving.value = true
  
  try {
    const vehicleData = {
      name: form.name,
      make: form.make,
      model: form.model,
      year: form.year,
      color: form.color,
      licensePlate: form.licensePlate,
      vin: form.vin || undefined,
      currentMileage: form.currentMileage,
      fuelType: form.fuelType
    }

    if (isEdit.value) {
      vehiclesStore.updateVehicle(route.params.id as string, vehicleData)
    } else {
      vehiclesStore.addVehicle(vehicleData)
    }

    router.push('/garage')
  } catch (error) {
    console.error('Error saving vehicle:', error)
  } finally {
    saving.value = false
  }
}
</script>

<style lang="sass" scoped>
.add-vehicle-container
  max-width: 600px
  margin: 0 auto

.page-header
  display: flex
  align-items: center

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

.action-btn
  border-radius: 12px
  font-weight: 600
</style>