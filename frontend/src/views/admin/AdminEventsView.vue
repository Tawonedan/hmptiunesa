<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const events = ref<any[]>([])
const isLoading = ref(true)
const error = ref('')

const isModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const currentId = ref('')

const formData = ref({
  title: '',
  description: '',
  dateStart: '',
  dateEnd: '',
  time: '',
  location: '',
  category: 'general',
  status: 'upcoming'
})

const fetchEvents = async () => {
  isLoading.value = true
  try {
    const response = await axios.get('/api/events?limit=100')
    events.value = response.data.events || response.data
  } catch (err: any) {
    error.value = 'Failed to load data'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchEvents()
})

const openAddModal = () => {
  modalMode.value = 'add'
  formData.value = { title: '', description: '', dateStart: '', dateEnd: '', time: '', location: '', category: 'general', status: 'upcoming' }
  isModalOpen.value = true
}

const openEditModal = (evt: any) => {
  modalMode.value = 'edit'
  currentId.value = evt._id
  // handle date nested object
  const startObj = evt.date?.start || evt.date
  const startDateStr = typeof startObj === 'string' ? startObj.split('T')[0] : 
                       (startObj && startObj.year) ? `${startObj.year}-${startObj.month === 'Mar' ? '03': '01'}-01` : '' // Simple fallback

  formData.value = { 
    title: evt.title, 
    description: evt.description,
    dateStart: startDateStr,
    dateEnd: '', // Simplification for demo
    time: evt.time,
    location: evt.location,
    category: evt.category || 'general',
    status: evt.status || 'upcoming'
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveEvent = async () => {
  // Construct body that meets backend expectations
  const body = {
    ...formData.value,
    date: {
      start: formData.value.dateStart || new Date().toISOString(),
      end: formData.value.dateEnd || new Date().toISOString()
    }
  }

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  try {
    if (modalMode.value === 'add') {
      await axios.post('/api/events', body, { headers })
    } else {
      await axios.put(`/api/events/${currentId.value}`, body, { headers })
    }
    closeModal()
    fetchEvents()
  } catch (err: any) {
    alert('Failed to save data. ' + (err.response?.data?.message || err.message))
  }
}

const deleteEvent = async (id: string) => {
  if (confirm('Are you sure you want to delete this event?')) {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/events/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      fetchEvents()
    } catch (err: any) {
      alert('Failed to delete data. ' + (err.response?.data?.message || err.message))
    }
  }
}
</script>

<template>
  <div class="admin-event-container">
    <div class="header">
      <h1 class="page-title">Manage Events</h1>
      <div>
        <button @click="router.push('/admin/dashboard')" class="back-btn mr-2">Back to Dashboard</button>
        <button @click="openAddModal" class="add-btn">+ Add Event</button>
      </div>
    </div>

    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Location</th>
            <th>Category</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="evt in events" :key="evt._id">
            <td>{{ evt.title }}</td>
            <td>{{ evt.location }}</td>
            <td>{{ evt.category }}</td>
            <td>{{ evt.status }}</td>
            <td>
              <button @click="openEditModal(evt)" class="edit-btn">Edit</button>
              <button @click="deleteEvent(evt._id)" class="delete-btn">Delete</button>
            </td>
          </tr>
          <tr v-if="events.length === 0">
            <td colspan="5" class="text-center">No data found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ modalMode === 'add' ? 'Add New Event' : 'Edit Event' }}</h2>
        <form @submit.prevent="saveEvent">
          <div class="form-group">
            <label>Title</label>
            <input v-model="formData.title" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="formData.description" required></textarea>
          </div>
          <div class="form-group">
            <label>Location</label>
            <input v-model="formData.location" required />
          </div>
          <div class="form-group">
            <label>Start Date</label>
            <input type="date" v-model="formData.dateStart" required />
          </div>
          <div class="form-group">
            <label>Time</label>
            <input v-model="formData.time" required />
          </div>
          <div class="form-group">
            <label>Category</label>
            <select v-model="formData.category">
              <option value="seminar">Seminar</option>
              <option value="workshop">Workshop</option>
              <option value="general">General</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="formData.status">
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
            <button type="submit" class="save-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-event-container { padding: 2rem; background-color: #f9fafb; min-height: 100vh; }
.header { display: flex; justify-content: space-between; margin-bottom: 2rem; }
.page-title { font-size: 1.5rem; font-weight: 700; }
button { cursor: pointer; padding: 0.5rem 1rem; border-radius: 0.25rem; border: none; font-weight: 600; }
.back-btn { background-color: #6b7280; color: white; margin-right: 0.5rem; }
.add-btn { background-color: #10b981; color: white; }
.edit-btn { background-color: #3b82f6; color: white; margin-right: 0.5rem; }
.delete-btn { background-color: #ef4444; color: white; }
.table-wrapper { background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
.data-table th { background-color: #f3f4f6; font-weight: 600; }
.text-center { text-align: center; }
.mr-2 { margin-right: 0.5rem; }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 50; }
.modal-content { background: white; padding: 2rem; border-radius: 0.5rem; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
.modal-content h2 { margin-bottom: 1.5rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.form-group input, .form-group textarea, .form-group select { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.25rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.cancel-btn { background-color: #e5e7eb; color: #374151; }
.save-btn { background-color: #2563eb; color: white; }
</style>
