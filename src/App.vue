<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useMaintenanceStore } from './stores/maintenance'
import { useVehiclesStore } from './stores/vehicles'

const vehiclesStore = useVehiclesStore()

onMounted(() => {
  // Check for upcoming maintenance notifications
  if ('Notification' in window && Notification.permission === 'granted') {
    checkUpcomingMaintenance()
  }
})

const checkUpcomingMaintenance = () => {
  const upcoming = useMaintenanceStore().upcomingMaintenance
  const now = new Date()
  
  upcoming.forEach(record => {
    if (record.nextMaintenance) {
      const nextDate = new Date(record.nextMaintenance)
      const diffDays = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      // Show notification for maintenance due in 7 days or less
      if (diffDays <= 7 && diffDays > 0) {
        const vehicle = vehiclesStore.getVehicle(record.vehicleId)
        const vehicleName = vehicle ? vehicle.name : 'Vehicle'
        
        new Notification('Makkina - Maintenance Reminder', {
          body: `${record.description} for ${vehicleName} is due in ${diffDays} day${diffDays > 1 ? 's' : ''}`,
          icon: '/vite.svg'
        })
      }
    }
  })
}
</script>

<style lang="sass">
body
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
  background: #0F0F16
  color: white

#q-app
  min-height: 100vh
</style>