import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LocalStorage, Notify } from 'quasar'

export interface MaintenanceRecord {
  id: string
  vehicleId: string
  date: string
  description: string
  technician: string
  cost: number
  mileage: number
  notes: string
  nextMaintenance?: string
  nextMaintenanceMileage?: number
  createdAt: string
  updatedAt: string
}

export const useMaintenanceStore = defineStore('maintenance', () => {
  const records = ref<MaintenanceRecord[]>([])
  const searchQuery = ref('')
  
  // Load data from localStorage on store initialization
  const loadFromStorage = () => {
    const stored = LocalStorage.getItem('makkina-maintenance-records')
    if (stored && Array.isArray(stored)) {
      records.value = stored
    }
  }
  
  // Save data to localStorage
  const saveToStorage = () => {
    LocalStorage.set('makkina-maintenance-records', records.value)
  }
  
  // Computed properties
  const sortedRecords = computed(() => {
    return [...records.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })
  
  const filteredRecords = computed(() => {
    if (!searchQuery.value) return sortedRecords.value
    
    const query = searchQuery.value.toLowerCase()
    return sortedRecords.value.filter(record => 
      record.description.toLowerCase().includes(query) ||
      record.technician.toLowerCase().includes(query) ||
      record.notes.toLowerCase().includes(query)
    )
  })
  
  // Get records for a specific vehicle
  const getRecordsForVehicle = (vehicleId: string) => {
    return records.value.filter(record => record.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
  
  // Get filtered records for a specific vehicle
  const getFilteredRecordsForVehicle = (vehicleId: string) => {
    const vehicleRecords = getRecordsForVehicle(vehicleId)
    
    if (!searchQuery.value) return vehicleRecords
    
    const query = searchQuery.value.toLowerCase()
    return vehicleRecords.filter(record => 
      record.description.toLowerCase().includes(query) ||
      record.technician.toLowerCase().includes(query) ||
      record.notes.toLowerCase().includes(query)
    )
  }
  
  const upcomingMaintenance = computed(() => {
    const now = new Date()
    return records.value.filter(record => {
      if (!record.nextMaintenance) return false
      const nextDate = new Date(record.nextMaintenance)
      const diffDays = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays <= 30 && diffDays >= 0
    }).sort((a, b) => new Date(a.nextMaintenance!).getTime() - new Date(b.nextMaintenance!).getTime())
  })
  
  // Get upcoming maintenance for a specific vehicle
  const getUpcomingMaintenanceForVehicle = (vehicleId: string) => {
    const now = new Date()
    return records.value.filter(record => {
      if (record.vehicleId !== vehicleId || !record.nextMaintenance) return false
      const nextDate = new Date(record.nextMaintenance)
      const diffDays = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays <= 30 && diffDays >= 0
    }).sort((a, b) => new Date(a.nextMaintenance!).getTime() - new Date(b.nextMaintenance!).getTime())
  }
  
  const totalCost = computed(() => {
    return records.value.reduce((sum, record) => sum + record.cost, 0)
  })
  
  // Get total cost for a specific vehicle
  const getTotalCostForVehicle = (vehicleId: string) => {
    return records.value
      .filter(record => record.vehicleId === vehicleId)
      .reduce((sum, record) => sum + record.cost, 0)
  }
  
  // Actions
  const addRecord = (record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord: MaintenanceRecord = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    records.value.push(newRecord)
    saveToStorage()
    
    Notify.create({
      type: 'positive',
      message: 'Maintenance record added successfully',
      position: 'top'
    })
  }
  
  const updateRecord = (id: string, updates: Partial<MaintenanceRecord>) => {
    const index = records.value.findIndex(r => r.id === id)
    if (index !== -1) {
      records.value[index] = {
        ...records.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      saveToStorage()
      
      Notify.create({
        type: 'positive',
        message: 'Maintenance record updated successfully',
        position: 'top'
      })
    }
  }
  
  const deleteRecord = (id: string) => {
    const index = records.value.findIndex(r => r.id === id)
    if (index !== -1) {
      records.value.splice(index, 1)
      saveToStorage()
      
      Notify.create({
        type: 'positive',
        message: 'Maintenance record deleted successfully',
        position: 'top'
      })
    }
  }
  
  const getRecord = (id: string) => {
    return records.value.find(r => r.id === id)
  }
  
  const exportData = () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      records: records.value
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `makkina-maintenance-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    Notify.create({
      type: 'positive',
      message: 'Data exported successfully',
      position: 'top'
    })
  }
  
  const importData = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (data.records && Array.isArray(data.records)) {
            records.value = data.records
            saveToStorage()
            
            Notify.create({
              type: 'positive',
              message: `Imported ${data.records.length} maintenance records`,
              position: 'top'
            })
            resolve(data.records.length)
          } else {
            throw new Error('Invalid file format')
          }
        } catch (error) {
          Notify.create({
            type: 'negative',
            message: 'Failed to import data. Please check the file format.',
            position: 'top'
          })
          reject(error)
        }
      }
      reader.readAsText(file)
    })
  }
  
  // Initialize store
  loadFromStorage()
  
  return {
    records,
    searchQuery,
    sortedRecords,
    filteredRecords,
    upcomingMaintenance,
    totalCost,
    getRecordsForVehicle,
    getFilteredRecordsForVehicle,
    getUpcomingMaintenanceForVehicle,
    getTotalCostForVehicle,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecord,
    exportData,
    importData
  }
})