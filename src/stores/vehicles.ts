import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LocalStorage, Notify } from 'quasar'

export interface Vehicle {
  id: string
  name: string
  make: string
  model: string
  year: number
  color: string
  licensePlate: string
  vin?: string
  currentMileage: number
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid'
  createdAt: string
  updatedAt: string
}

export const useVehiclesStore = defineStore('vehicles', () => {
  const vehicles = ref<Vehicle[]>([])
  const activeVehicleId = ref<string | null>(null)

  // Load data from localStorage on store initialization
  const loadFromStorage = () => {
    const storedVehicles = LocalStorage.getItem('makkina-vehicles')
    const storedActiveId = LocalStorage.getItem('makkina-active-vehicle')?.valueOf()

    if (storedVehicles && Array.isArray(storedVehicles)) {
      vehicles.value = storedVehicles
    }
    if (typeof storedActiveId === 'string' || storedActiveId === null) {
      activeVehicleId.value = storedActiveId
    } else if (typeof storedActiveId === 'number') {
      activeVehicleId.value = storedActiveId.toString()
    } else {
      activeVehicleId.value = null
    }
  }

  // Save data to localStorage
  const saveToStorage = () => {
    LocalStorage.set('makkina-vehicles', vehicles.value)
    LocalStorage.set('makkina-active-vehicle', activeVehicleId.value)
  }

  // Computed properties
  const activeVehicle = computed(() => {
    return vehicles.value.find(v => v.id === activeVehicleId.value) || null
  })

  const sortedVehicles = computed(() => {
    return [...vehicles.value].sort((a, b) => a.name.localeCompare(b.name))
  })

  // Actions
  const addVehicle = (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    vehicles.value.push(newVehicle)

    // Set as active if it's the first vehicle
    if (vehicles.value.length === 1) {
      activeVehicleId.value = newVehicle.id
    }

    saveToStorage()

    Notify.create({
      type: 'positive',
      message: 'Vehicle added successfully',
      position: 'top'
    })

    return newVehicle.id
  }

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    const index = vehicles.value.findIndex(v => v.id === id)
    if (index !== -1) {
      vehicles.value[index] = {
        ...vehicles.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      saveToStorage()

      Notify.create({
        type: 'positive',
        message: 'Vehicle updated successfully',
        position: 'top'
      })
    }
  }

  const deleteVehicle = (id: string) => {
    const index = vehicles.value.findIndex(v => v.id === id)
    if (index !== -1) {
      vehicles.value.splice(index, 1)

      // If deleted vehicle was active, set new active vehicle
      if (activeVehicleId.value === id) {
        activeVehicleId.value = vehicles.value.length > 0 ? vehicles.value[0].id : null
      }

      saveToStorage()

      Notify.create({
        type: 'positive',
        message: 'Vehicle deleted successfully',
        position: 'top'
      })
    }
  }

  const setActiveVehicle = (id: string | null) => {
    activeVehicleId.value = id
    saveToStorage()
  }

  const getVehicle = (id: string) => {
    return vehicles.value.find(v => v.id === id)
  }

  // Initialize store
  loadFromStorage()

  return {
    vehicles,
    activeVehicleId,
    activeVehicle,
    sortedVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    setActiveVehicle,
    getVehicle
  }
})