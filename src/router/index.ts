import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import MaintenanceJournal from '../pages/MaintenanceJournal.vue'
import AddMaintenance from '../pages/AddMaintenance.vue'
import Garage from '../pages/Garage.vue'
import AddVehicle from '../pages/AddVehicle.vue'
import Settings from '../pages/Settings.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { 
        path: '', 
        name: 'home',
        component: MaintenanceJournal 
      },
      { 
        path: '/add', 
        name: 'add',
        component: AddMaintenance 
      },
      { 
        path: '/edit/:id', 
        name: 'edit',
        component: AddMaintenance,
        props: true
      },
      { 
        path: '/garage', 
        name: 'garage',
        component: Garage 
      },
      { 
        path: '/garage/add', 
        name: 'garage-add',
        component: AddVehicle 
      },
      { 
        path: '/garage/edit/:id', 
        name: 'garage-edit',
        component: AddVehicle,
        props: true
      },
      { 
        path: '/settings', 
        name: 'settings',
        component: Settings 
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router