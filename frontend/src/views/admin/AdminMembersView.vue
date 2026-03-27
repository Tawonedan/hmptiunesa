<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const items = ref<any[]>([])
const isLoading = ref(true)
const error = ref('')

const isModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const currentId = ref('')
const selectedFile = ref<File | null>(null)

// Searching, Filtering, Sorting
const searchQuery = ref('')
const filterBatch = ref('')
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

  if (filterBatch.value) {
    result = result.filter(d => d.batch === filterBatch.value)
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

// Extract unique batches for filtering
const availableBatches = computed(() => {
  const batches = new Set(items.value.map(item => item.batch).filter(Boolean))
  return Array.from(batches).sort()
})

const formData = ref({
  name: '',
  studentId: '',
  email: '',
  yearJoined: new Date().getFullYear(),
  batch: '',
  phoneNumber: '',
  address: '',
  socialMedia: { instagram: '', linkedin: '', github: '' },
  interests: '',
  skills: '',
  membership: { isActive: true, membershipType: 'regular' }
})

const fetchItems = async () => {
  isLoading.value = true
  try {
    const response = await axios.get('/api/members?limit=100')
    items.value = response.data.data || response.data
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
  formData.value = { 
    name: '', studentId: '', email: '', yearJoined: new Date().getFullYear(), batch: '',
    phoneNumber: '', address: '', socialMedia: { instagram: '', linkedin: '', github: '' },
    interests: '', skills: '', membership: { isActive: true, membershipType: 'regular' } 
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
    email: item.email,
    yearJoined: item.yearJoined,
    batch: item.batch,
    phoneNumber: item.phoneNumber || '',
    address: item.address || '',
    socialMedia: item.socialMedia || { instagram: '', linkedin: '', github: '' },
    interests: item.interests ? item.interests.join(', ') : '',
    skills: item.skills ? item.skills.join(', ') : '',
    membership: { 
      isActive: item.membership?.isActive ?? true, 
      membershipType: item.membership?.membershipType || 'regular' 
    }
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
  submitData.append('email', formData.value.email)
  submitData.append('yearJoined', formData.value.yearJoined.toString())
  submitData.append('batch', formData.value.batch)
  submitData.append('phoneNumber', formData.value.phoneNumber)
  submitData.append('address', formData.value.address)

  // Object and arrays
  if (formData.value.interests) {
    formData.value.interests.split(',').filter(Boolean).forEach((interest) => {
      submitData.append('interests', interest.trim())
    })
  }
  if (formData.value.skills) {
    formData.value.skills.split(',').filter(Boolean).forEach((skill) => {
      submitData.append('skills', skill.trim())
    })
  }
  
  submitData.append('socialMedia.instagram', formData.value.socialMedia.instagram)
  submitData.append('socialMedia.linkedin', formData.value.socialMedia.linkedin)
  submitData.append('socialMedia.github', formData.value.socialMedia.github)

  submitData.append('membership.isActive', formData.value.membership.isActive.toString())
  submitData.append('membership.membershipType', formData.value.membership.membershipType)
  
  if (selectedFile.value) {
    submitData.append('photo', selectedFile.value)
    headers['Content-Type'] = 'multipart/form-data'
  }

  try {
    if (modalMode.value === 'add') {
      await axios.post('/api/members', submitData, { headers })
    } else {
      await axios.put(`/api/members/${currentId.value}`, submitData, { headers })
    }
    closeModal()
    fetchItems()
  } catch (err: any) {
    alert('Failed to save data. ' + (err.response?.data?.message || err.message))
  }
}

const deleteItem = async (id: string) => {
  if (confirm('Are you sure you want to delete this member?')) {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/members/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      fetchItems()
    } catch (err: any) {
      alert('Failed to delete data. ' + (err.response?.data?.message || err.message))
    }
  }
}
</script>

<template>
  <div class="admin-members-container">
    <div class="header">
      <h1 class="page-title">Manage Members</h1>
      <div>
        <button @click="router.push('/admin/dashboard')" class="back-btn mr-2">Back to Dashboard</button>
        <button @click="openAddModal" class="add-btn">+ Add Member</button>
      </div>
    </div>

    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else class="content-wrapper">
      <div class="toolbar">
        <input v-model="searchQuery" placeholder="Search by name, NIM..." class="search-input" />
        <select v-model="filterBatch" class="filter-select">
          <option value="">All Batches</option>
          <option v-for="b in availableBatches" :key="b" :value="b">{{ b }}</option>
        </select>
        <select v-model="sortBy" class="sort-select">
          <option value="name">Sort by Name</option>
          <option value="studentId">Sort by NIM</option>
          <option value="yearJoined">Sort by Year Joined</option>
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
            <th>Email</th>
            <th>Year Joined</th>
            <th>Batch</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Type</th>
            <th>Active</th>
            <th>Interests</th>
            <th>Skills</th>
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
            <td>{{ item.email }}</td>
            <td>{{ item.yearJoined }}</td>
            <td>{{ item.batch }}</td>
            <td>{{ item.phoneNumber }}</td>
            <td>{{ item.address }}</td>
            <td>{{ item.membership?.membershipType }}</td>
            <td>{{ item.membership?.isActive ? 'Yes' : 'No' }}</td>
            <td>{{ item.interests?.join(', ') }}</td>
            <td>{{ item.skills?.join(', ') }}</td>
            <td>{{ item.socialMedia?.instagram }}</td>
            <td>{{ item.socialMedia?.linkedin }}</td>
            <td>{{ item.socialMedia?.github }}</td>
            <td class="action-cell">
              <button @click="openEditModal(item)" class="edit-btn">Edit</button>
              <button @click="deleteItem(item._id)" class="delete-btn">Delete</button>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td colspan="16" class="text-center">No data found</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ modalMode === 'add' ? 'Add Member' : 'Edit Member' }}</h2>
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
            <label>Email</label>
            <input type="email" v-model="formData.email" required />
          </div>
          <div class="form-group">
            <label>Year Joined</label>
            <input type="number" v-model="formData.yearJoined" required />
          </div>
          <div class="form-group">
            <label>Batch</label>
            <input v-model="formData.batch" required />
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input v-model="formData.phoneNumber" />
          </div>
          <div class="form-group">
            <label>Address</label>
            <input v-model="formData.address" />
          </div>
          <div class="form-group">
            <label>Membership Type</label>
            <select v-model="formData.membership.membershipType">
              <option value="regular">Regular</option>
              <option value="honorary">Honorary</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="formData.membership.isActive" /> Active Status
            </label>
          </div>
          <div class="form-group">
            <label>Interests (comma separated)</label>
            <input v-model="formData.interests" />
          </div>
          <div class="form-group">
            <label>Skills (comma separated)</label>
            <input v-model="formData.skills" />
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
.admin-members-container { padding: 2rem; background-color: #f9fafb; min-height: 100vh; width: 100%; box-sizing: border-box; overflow-x: hidden; }
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
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.cancel-btn { background-color: #e5e7eb; color: #374151; padding: 0.5rem 1rem; border-radius: 0.25rem; border: none; cursor: pointer; }
.save-btn { background-color: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 0.25rem; border: none; cursor: pointer; }
.tbl-photo { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.tbl-photo-placeholder { width: 40px; height: 40px; border-radius: 50%; background-color: #d1d5db; display: inline-block; }
.checkbox-group label { display: flex; align-items: center; gap: 0.5rem; font-weight: normal; }
.checkbox-group input { width: auto; }

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
