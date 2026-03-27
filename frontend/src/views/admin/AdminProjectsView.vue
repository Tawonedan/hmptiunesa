<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const items = ref<any[]>([])
const isLoading = ref(true)
const error = ref('')

const isModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const currentId = ref('')

const formData = ref({
  title: '',
  description: '',
  category: '',
  status: 'ongoing',
  startDate: ''
})

const fetchItems = async () => {
  isLoading.value = true
  try {
    const response = await axios.get('/api/projects?limit=100')
    items.value = response.data.projects || response.data
  } catch (err: any) {
    error.value = 'Failed to load data'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchItems()
})

const openAddModal = () => {
  modalMode.value = 'add'
  formData.value = { title: '', description: '', category: '', status: 'ongoing', startDate: '' }
  isModalOpen.value = true
}

const openEditModal = (item: any) => {
  modalMode.value = 'edit'
  currentId.value = item._id
  formData.value = { 
    title: item.title, 
    description: item.description,
    category: item.category,
    status: item.status || 'ongoing',
    startDate: item.startDate ? item.startDate.split('T')[0] : ''
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveItem = async () => {
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }
  try {
    if (modalMode.value === 'add') {
      await axios.post('/api/projects', formData.value, { headers })
    } else {
      await axios.put(`/api/projects/${currentId.value}`, formData.value, { headers })
    }
    closeModal()
    fetchItems()
  } catch (err: any) {
    alert('Failed to save data. ' + (err.response?.data?.message || err.message))
  }
}

const deleteItem = async (id: string) => {
  if (confirm('Are you sure you want to delete this project?')) {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      fetchItems()
    } catch (err: any) {
      alert('Failed to delete data. ' + (err.response?.data?.message || err.message))
    }
  }
}
</script>

<template>
  <div class="admin-projects-container">
    <div class="header">
      <h1 class="page-title">Manage Projects</h1>
      <div>
        <button @click="router.push('/admin/dashboard')" class="back-btn mr-2">Back to Dashboard</button>
        <button @click="openAddModal" class="add-btn">+ Add Project</button>
      </div>
    </div>

    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Start Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item._id">
            <td>{{ item.title }}</td>
            <td>{{ item.category }}</td>
            <td>{{ item.status }}</td>
            <td>{{ item.startDate ? new Date(item.startDate).toLocaleDateString() : '' }}</td>
            <td>
              <button @click="openEditModal(item)" class="edit-btn">Edit</button>
              <button @click="deleteItem(item._id)" class="delete-btn">Delete</button>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td colspan="5" class="text-center">No data found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ modalMode === 'add' ? 'Add Project' : 'Edit Project' }}</h2>
        <form @submit.prevent="saveItem">
          <div class="form-group">
            <label>Title</label>
            <input v-model="formData.title" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="formData.description" required></textarea>
          </div>
          <div class="form-group">
            <label>Category</label>
            <input v-model="formData.category" required />
          </div>
          <div class="form-group">
            <label>Start Date</label>
            <input type="date" v-model="formData.startDate" required />
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="formData.status" required>
              <option value="planned">Planned</option>
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
.admin-projects-container { padding: 2rem; background-color: #f9fafb; min-height: 100vh; }
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
