<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const dosens = ref<any[]>([])
const isLoading = ref(true)
const error = ref('')

const isModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const currentId = ref('')

const formData = ref({
  name: '',
  nip: '',
  position: '',
  specialization: '',
  email: '',
  education: '',
  biography: ''
})

const fetchDosens = async () => {
  isLoading.value = true
  try {
    const response = await axios.get('/api/lecturers')
    dosens.value = response.data.data || response.data
  } catch (err: any) {
    error.value = 'Failed to load data'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDosens()
})

const openAddModal = () => {
  modalMode.value = 'add'
  formData.value = { name: '', nip: '', position: '', specialization: '', email: '', education: '', biography: '' }
  isModalOpen.value = true
}

const openEditModal = (dosen: any) => {
  modalMode.value = 'edit'
  currentId.value = dosen._id
  formData.value = { 
    name: dosen.name, 
    nip: dosen.nip, 
    position: dosen.position, 
    specialization: dosen.specialization, 
    email: dosen.email, 
    education: dosen.education || '', 
    biography: dosen.biography || '' 
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveDosen = async () => {
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }
  try {
    if (modalMode.value === 'add') {
      await axios.post('/api/lecturers', formData.value, { headers })
    } else {
      await axios.put(`/api/lecturers/${currentId.value}`, formData.value, { headers })
    }
    closeModal()
    fetchDosens()
  } catch (err: any) {
    alert('Failed to save data. ' + (err.response?.data?.message || err.message))
  }
}

const deleteDosen = async (id: string) => {
  if (confirm('Are you sure you want to delete this specific lecturer?')) {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/lecturers/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      fetchDosens()
    } catch (err: any) {
      alert('Failed to delete data. ' + (err.response?.data?.message || err.message))
    }
  }
}
</script>

<template>
  <div class="admin-dosen-container">
    <div class="header">
      <h1 class="page-title">Manage Dosen</h1>
      <div>
        <button @click="router.push('/admin/dashboard')" class="back-btn mr-2">Back to Dashboard</button>
        <button @click="openAddModal" class="add-btn">+ Add Dosen</button>
      </div>
    </div>

    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>NIP</th>
            <th>Position</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="dosen in dosens" :key="dosen._id">
            <td>{{ dosen.name }}</td>
            <td>{{ dosen.nip }}</td>
            <td>{{ dosen.position }}</td>
            <td>{{ dosen.email }}</td>
            <td>
              <button @click="openEditModal(dosen)" class="edit-btn">Edit</button>
              <button @click="deleteDosen(dosen._id)" class="delete-btn">Delete</button>
            </td>
          </tr>
          <tr v-if="dosens.length === 0">
            <td colspan="5" class="text-center">No data found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ modalMode === 'add' ? 'Add New Dosen' : 'Edit Dosen' }}</h2>
        <form @submit.prevent="saveDosen">
          <div class="form-group">
            <label>Name</label>
            <input v-model="formData.name" required />
          </div>
          <div class="form-group">
            <label>NIP</label>
            <input v-model="formData.nip" required />
          </div>
          <div class="form-group">
            <label>Position</label>
            <input v-model="formData.position" required />
          </div>
          <div class="form-group">
            <label>Specialization</label>
            <input v-model="formData.specialization" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="formData.email" required />
          </div>
          <div class="form-group">
            <label>Education</label>
            <input v-model="formData.education" required />
          </div>
          <div class="form-group">
            <label>Biography</label>
            <textarea v-model="formData.biography" required></textarea>
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
.admin-dosen-container {
  padding: 2rem;
  background-color: #f9fafb;
  min-height: 100vh;
}
.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
}
button {
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  font-weight: 600;
}
.back-btn {
  background-color: #6b7280;
  color: white;
  margin-right: 0.5rem;
}
.add-btn {
  background-color: #10b981;
  color: white;
}
.edit-btn {
  background-color: #3b82f6;
  color: white;
  margin-right: 0.5rem;
}
.delete-btn {
  background-color: #ef4444;
  color: white;
}
.table-wrapper {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th, .data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}
.data-table th {
  background-color: #f3f4f6;
  font-weight: 600;
}
.text-center { text-align: center; }
.mr-2 { margin-right: 0.5rem; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-content h2 { margin-bottom: 1.5rem; }
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.form-group input, .form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
.cancel-btn {
  background-color: #e5e7eb;
  color: #374151;
}
.save-btn {
  background-color: #2563eb;
  color: white;
}
</style>
