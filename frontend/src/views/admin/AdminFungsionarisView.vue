<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const items = ref<any[]>([])
const departments = ref<any[]>([])
const isLoading = ref(true)
const error = ref('')
const selectedFile = ref<File | null>(null)

const isModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const currentId = ref('')

// Searching, Filtering, Sorting
const searchQuery = ref('')
const filterDepartment = ref('')
const sortBy = ref('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

const processedItems = computed(() => {
  let result = items.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(d => 
      d.name?.toLowerCase().includes(q) || 
      d.studentId?.toLowerCase().includes(q) || 
      d.email?.toLowerCase().includes(q)
    )
  }

  if (filterDepartment.value) {
    result = result.filter(d => d.department === filterDepartment.value)
  }

  result = result.sort((a, b) => {
    let valA = a[sortBy.value] || ''
    let valB = b[sortBy.value] || ''
    if (typeof valA === 'string') valA = valA.toLowerCase()
    if (typeof valB === 'string') valB = valB.toLowerCase()
    
    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return result
})

const formData = ref({
  name: '',
  studentId: '',
  position: '',
  department: '',
  period: '2024',
  email: '',
  phoneNumber: '',
  bio: '',
  socialMedia: { instagram: '', linkedin: '', github: '' },
  isActive: true
})

const fetchItems = async () => {
  isLoading.value = true
  try {
    const response = await axios.get('/api/functionaries')
    items.value = response.data.data || response.data
  } catch (err: any) {
    error.value = 'Failed to load data'
  } finally {
    isLoading.value = false
  }
}

const fetchDepartments = async () => {
  try {
    const response = await axios.get('/api/functionaries-departs')
    departments.value = response.data
  } catch (err) {
    console.error('Failed to load departments', err)
  }
}

onMounted(() => {
  fetchItems()
  fetchDepartments()
})

const openAddModal = () => {
  modalMode.value = 'add'
  formData.value = { 
    name: '', studentId: '', position: 'Anggota', department: '', period: '2024', 
    email: '', phoneNumber: '', bio: '', 
    socialMedia: { instagram: '', linkedin: '', github: '' }, isActive: true 
  }
  selectedFile.value = null
  isModalOpen.value = true
}

const openEditModal = (item: any) => {
  modalMode.value = 'edit'
  currentId.value = item._id
  formData.value = { 
    name: item.name, 
    studentId: item.studentId,
    position: item.position,
    department: item.department,
    period: item.period,
    email: item.email,
    phoneNumber: item.phoneNumber || '',
    bio: item.bio || '',
    socialMedia: item.socialMedia || { instagram: '', linkedin: '', github: '' },
    isActive: item.isActive ?? true
  }
  selectedFile.value = null
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedFile.value = null
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length) {
    selectedFile.value = target.files[0]
  }
}

const saveItem = async () => {
  const token = localStorage.getItem('token')
  const headers: any = { Authorization: `Bearer ${token}` }
  
  const submitData = new FormData()
  submitData.append('name', formData.value.name)
  submitData.append('studentId', formData.value.studentId)
  submitData.append('position', formData.value.position)
  submitData.append('department', formData.value.department)
  submitData.append('period', formData.value.period)
  submitData.append('email', formData.value.email)
  submitData.append('phoneNumber', formData.value.phoneNumber)
  submitData.append('bio', formData.value.bio)
  submitData.append('isActive', formData.value.isActive.toString())
  
  submitData.append('socialMedia.instagram', formData.value.socialMedia.instagram)
  submitData.append('socialMedia.linkedin', formData.value.socialMedia.linkedin)
  submitData.append('socialMedia.github', formData.value.socialMedia.github)
  
  if (selectedFile.value) {
    submitData.append('photo', selectedFile.value)
    headers['Content-Type'] = 'multipart/form-data'
  }

  try {
    if (modalMode.value === 'add') {
      await axios.post('/api/functionaries', submitData, { headers })
    } else {
      await axios.put(`/api/functionaries/${currentId.value}`, submitData, { headers })
    }
    closeModal()
    fetchItems()
  } catch (err: any) {
    alert('Failed to save data. ' + (err.response?.data?.message || err.message))
  }
}

const deleteItem = async (id: string) => {
  if (confirm('Are you sure you want to delete this functionary?')) {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/functionaries/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      fetchItems()
    } catch (err: any) {
      alert('Failed to delete data. ' + (err.response?.data?.message || err.message))
    }
  }
}
</script>

<template>
  <div class="admin-fungsionaris-container">
    <div class="header">
      <h1 class="page-title">Manage Fungsionaris</h1>
      <div>
        <button @click="router.push('/admin/dashboard')" class="back-btn mr-2">Back to Dashboard</button>
        <button @click="openAddModal" class="add-btn">+ Add Fungsionaris</button>
      </div>
    </div>

    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else class="content-wrapper">
      <div class="toolbar">
        <input v-model="searchQuery" placeholder="Search by name, NIM..." class="search-input" />
        <select v-model="filterDepartment" class="filter-select">
          <option value="">All Departments</option>
          <option v-for="dept in departments" :key="dept._id" :value="dept.label">{{ dept.label }}</option>
        </select>
        <select v-model="sortBy" class="sort-select">
          <option value="name">Sort by Name</option>
          <option value="studentId">Sort by NIM</option>
          <option value="period">Sort by Period</option>
        </select>
        <button @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'" class="sort-btn">
          {{ sortOrder === 'asc' ? 'Ascending ↑' : 'Descending ↓' }}
        </button>
      </div>
      <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>NIM</th>
            <th>Position</th>
            <th>Department</th>
            <th>Period</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Bio</th>
            <th>Active</th>
            <th>Instagram</th>
            <th>LinkedIn</th>
            <th>Github</th>
            <th class="action-cell">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in processedItems" :key="item._id">
            <td>
              <img v-if="item.photo" :src="item.photo" alt="Foto" class="tbl-photo" />
              <div v-else class="tbl-photo-placeholder"></div>
            </td>
            <td>{{ item.name }}</td>
            <td>{{ item.studentId }}</td>
            <td>{{ item.position }}</td>
            <td>{{ item.department }}</td>
            <td>{{ item.period }}</td>
            <td>{{ item.email }}</td>
            <td>{{ item.phoneNumber }}</td>
            <td>{{ item.bio }}</td>
            <td>{{ item.isActive ? 'Yes' : 'No' }}</td>
            <td>{{ item.socialMedia?.instagram }}</td>
            <td>{{ item.socialMedia?.linkedin }}</td>
            <td>{{ item.socialMedia?.github }}</td>
            <td class="action-cell">
              <button @click="openEditModal(item)" class="edit-btn">Edit</button>
              <button @click="deleteItem(item._id)" class="delete-btn">Delete</button>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td colspan="14" class="text-center">No data found</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ modalMode === 'add' ? 'Add Fungsionaris' : 'Edit Fungsionaris' }}</h2>
        <form @submit.prevent="saveItem">
          <div class="form-group">
            <label>Photo</label>
            <input type="file" @change="handleFileUpload" accept="image/*" />
            <small class="text-gray-500">Max size 5MB (JPG, PNG)</small>
          </div>
          <div class="form-group">
            <label>Name</label>
            <input v-model="formData.name" required />
          </div>
          <div class="form-group">
            <label>NIM (Student ID)</label>
            <input v-model="formData.studentId" required />
          </div>
          <div class="form-group">
            <label>Position</label>
            <select v-model="formData.position" required>
              <option value="Ketua Departemen">Ketua Departemen</option>
              <option value="Anggota">Anggota</option>
              <option value="Ketua Himpunan">Ketua Himpunan</option>
              <option value="Wakil Ketua Himpunan">Wakil Ketua Himpunan</option>
              <option value="Sekretaris 1">Sekretaris 1</option>
              <option value="Sekretaris 2">Sekretaris 2</option>
              <option value="Bendahara 1">Bendahara 1</option>
              <option value="Bendahara 2">Bendahara 2</option>
            </select>
          </div>
          <div class="form-group">
            <label>Department</label>
            <select v-model="formData.department" required>
              <option disabled value="">Please select a department</option>
              <option v-for="dept in departments" :key="dept._id" :value="dept.label">{{ dept.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Period</label>
            <select v-model="formData.period" required>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="formData.email" required />
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input v-model="formData.phoneNumber" />
          </div>
          <div class="form-group">
            <label>Bio</label>
            <textarea v-model="formData.bio"></textarea>
          </div>
          <div class="form-group">
            <label>Instagram URL</label>
            <input v-model="formData.socialMedia.instagram" />
          </div>
          <div class="form-group">
            <label>LinkedIn URL</label>
            <input v-model="formData.socialMedia.linkedin" />
          </div>
          <div class="form-group">
            <label>Github URL</label>
            <input v-model="formData.socialMedia.github" />
          </div>
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="formData.isActive" /> Active Status
            </label>
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
.admin-fungsionaris-container { padding: 2rem; background-color: #f9fafb; min-height: 100vh; width: 100%; box-sizing: border-box; overflow-x: hidden; }
.header { display: flex; justify-content: space-between; margin-bottom: 2rem; }
.page-title { font-size: 1.5rem; font-weight: 700; }
button { cursor: pointer; padding: 0.5rem 1rem; border-radius: 0.25rem; border: none; font-weight: 600; }
.back-btn { background-color: #6b7280; color: white; margin-right: 0.5rem; }
.add-btn { background-color: #10b981; color: white; }
.edit-btn { background-color: #3b82f6; color: white; margin-right: 0.5rem; }
.delete-btn { background-color: #ef4444; color: white; }
.table-wrapper { background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow-x: auto; width: 100%; display: block; }
.data-table { width: 100%; min-width: 1500px; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
.action-cell {
  position: sticky;
  right: 0;
  background-color: #e1e1e1;
  z-index: 2;
  border-left: 2px solid #e2e8f0;
  box-shadow: -4px 0 6px -1px rgba(0, 0, 0, 0.05);
}
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
.checkbox-group label { display: flex; align-items: center; gap: 0.5rem; font-weight: normal; }
.checkbox-group input { width: auto; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.cancel-btn { background-color: #e5e7eb; color: #374151; padding: 0.5rem 1rem; border-radius: 0.25rem; border: none; cursor: pointer; }
.save-btn { background-color: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 0.25rem; border: none; cursor: pointer; }
.tbl-photo { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.tbl-photo-placeholder { width: 40px; height: 40px; border-radius: 50%; background-color: #d1d5db; display: inline-block; }

.toolbar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.search-input, .filter-select, .sort-select, .sort-btn {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
}
.sort-btn {
  background-color: #f3f4f6;
  color: #374151;
}
</style>
