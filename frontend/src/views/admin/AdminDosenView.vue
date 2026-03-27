<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const dosens = ref<any[]>([])
const expertises = ref<any[]>([])
const isLoading = ref(true)
const error = ref('')

const isModalOpen = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const currentId = ref('')
const selectedFile = ref<File | null>(null)

// Searching, Filtering, Sorting
const searchQuery = ref('')
const filterPosition = ref('')
const sortBy = ref('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

const processedDosens = computed(() => {
  let result = dosens.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(d => 
      d.name?.toLowerCase().includes(q) || 
      d.nip?.toLowerCase().includes(q) || 
      d.email?.toLowerCase().includes(q)
    )
  }

  if (filterPosition.value) {
    result = result.filter(d => d.position === filterPosition.value)
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
  nip: '',
  position: 'Dosen',
  specialization: '',
  expertise: 'other',
  email: '',
  education: '',
  biography: '',
  socialMedia: { website: '', linkedin: '', googleScholar: '' },
  research: [] as { title: string, year: number | null, description: string }[]
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

const fetchExpertises = async () => {
  try {
    const response = await axios.get('/api/lecturers-expertise')
    expertises.value = response.data
  } catch (err: any) {
    console.error('Failed to load expertises', err)
  }
}

onMounted(() => {
  fetchDosens()
  fetchExpertises()
})

const openAddModal = () => {
  modalMode.value = 'add'
  formData.value = { 
    name: '', nip: '', position: 'Dosen', specialization: '', expertise: 'other', 
    email: '', education: '', biography: '', socialMedia: { website: '', linkedin: '', googleScholar: '' },
    research: []
  }
  selectedFile.value = null
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
    expertise: dosen.expertise || 'other',
    email: dosen.email, 
    education: dosen.education || '', 
    biography: dosen.biography || '',
    socialMedia: dosen.socialMedia || { website: '', linkedin: '', googleScholar: '' },
    research: dosen.research ? [...dosen.research] : []
  }
  selectedFile.value = null
  isModalOpen.value = true
}

const addResearch = () => {
  formData.value.research.push({ title: '', year: new Date().getFullYear(), description: '' })
}

const removeResearch = (index: number) => {
  formData.value.research.splice(index, 1)
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

const saveDosen = async () => {
  const token = localStorage.getItem('token')
  const headers: any = { Authorization: `Bearer ${token}` }
  
  const submitData = new FormData()
  submitData.append('name', formData.value.name)
  submitData.append('nip', formData.value.nip)
  submitData.append('position', formData.value.position)
  submitData.append('specialization', formData.value.specialization)
  submitData.append('expertise', formData.value.expertise)
  submitData.append('email', formData.value.email)
  submitData.append('education', formData.value.education)
  submitData.append('biography', formData.value.biography)
  
  // Handling Object mapping for form data
  submitData.append('socialMedia.website', formData.value.socialMedia.website || '')
  submitData.append('socialMedia.linkedin', formData.value.socialMedia.linkedin || '')
  submitData.append('socialMedia.googleScholar', formData.value.socialMedia.googleScholar || '')
  
  formData.value.research.forEach((res, index) => {
    submitData.append(`research[${index}].title`, res.title)
    submitData.append(`research[${index}].year`, res.year?.toString() || '')
    submitData.append(`research[${index}].description`, res.description || '')
  })
  
  if (selectedFile.value) {
    submitData.append('photo', selectedFile.value)
    headers['Content-Type'] = 'multipart/form-data'
  }

  try {
    if (modalMode.value === 'add') {
      await axios.post('/api/lecturers', submitData, { headers })
    } else {
      await axios.put(`/api/lecturers/${currentId.value}`, submitData, { headers })
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
    <div v-else class="content-wrapper">
      <div class="toolbar">
        <input v-model="searchQuery" placeholder="Search by name, NIP..." class="search-input" />
        <select v-model="filterPosition" class="filter-select">
          <option value="">All Positions</option>
          <option value="Dosen">Dosen</option>
          <option value="Dosen Praktisi">Dosen Praktisi</option>
          <option value="Ketua Program Studi">Ketua Program Studi</option>
          <option value="Sekretaris Program Studi">Sekretaris Program Studi</option>
          <option value="Kepala Laboratorium">Kepala Laboratorium</option>
        </select>
        <select v-model="sortBy" class="sort-select">
          <option value="name">Sort by Name</option>
          <option value="nip">Sort by NIP</option>
          <option value="position">Sort by Position</option>
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
            <th>NIP</th>
            <th>Position</th>
            <th>Specialization</th>
            <th>Expertise</th>
            <th>Email</th>
            <th>Education</th>
            <th>Biography</th>
            <th>Research</th>
            <th>Website</th>
            <th>LinkedIn</th>
            <th>G. Scholar</th>
            <th class="action-cell">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="dosen in processedDosens" :key="dosen._id">
            <td>
              <img v-if="dosen.photo" :src="dosen.photo" alt="Foto" class="tbl-photo" />
              <div v-else class="tbl-photo-placeholder"></div>
            </td>
            <td>{{ dosen.name }}</td>
            <td>{{ dosen.nip }}</td>
            <td>{{ dosen.position }}</td>
            <td>{{ dosen.specialization }}</td>
            <td>{{ dosen.expertise }}</td>
            <td>{{ dosen.email }}</td>
            <td>{{ dosen.education }}</td>
            <td>{{ dosen.biography }}</td>
            <td>{{ dosen.research ? dosen.research.length + ' research(s)' : '0 research(s)' }}</td>
            <td>{{ dosen.socialMedia?.website }}</td>
            <td>{{ dosen.socialMedia?.linkedin }}</td>
            <td>{{ dosen.socialMedia?.googleScholar }}</td>
            <td class="action-cell">
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
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ modalMode === 'add' ? 'Add New Dosen' : 'Edit Dosen' }}</h2>
        <form @submit.prevent="saveDosen">
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
            <label>NIP</label>
            <input v-model="formData.nip" required />
          </div>
          <div class="form-group">
            <label>Position</label>
            <select v-model="formData.position" required>
              <option value="Dosen">Dosen</option>
              <option value="Ketua Program Studi">Ketua Program Studi</option>
              <option value="Kepala Laboratorium">Kepala Laboratorium</option>
            </select>
          </div>
          <div class="form-group">
            <label>Specialization</label>
            <select v-model="formData.specialization" required>
              <option disabled value="">Please select a specialization</option>
              <option v-for="exp in expertises" :key="exp._id" :value="exp.label || exp.name || exp.id">{{ exp.label || exp.name || exp.id }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Expertise</label>
            <input v-model="formData.expertise" required />
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
          <div class="form-group">
            <label>Website URL</label>
            <input v-model="formData.socialMedia.website" />
          </div>
          <div class="form-group">
            <label>LinkedIn URL</label>
            <input v-model="formData.socialMedia.linkedin" />
          </div>
          <div class="form-group">
            <label>Google Scholar URL</label>
            <input v-model="formData.socialMedia.googleScholar" />
          </div>
          
          <div class="form-group">
            <label style="display:flex; justify-content:space-between;">
              <span>Research History</span>
              <button type="button" @click="addResearch" class="add-btn" style="padding:0.25rem 0.5rem; font-size:0.8rem;">+ Add Research</button>
            </label>
            <div v-for="(res, index) in formData.research" :key="index" style="border:1px solid #e5e7eb; padding:1rem; border-radius:4px; margin-bottom:1rem; position:relative;">
              <button type="button" @click="removeResearch(index)" style="position:absolute; top:5px; right:5px; background:red; color:white; border:none; border-radius:4px; cursor:pointer;">X</button>
              <div class="form-group">
                <label>Title</label>
                <input v-model="res.title" required />
              </div>
              <div class="form-group">
                <label>Year</label>
                <input type="number" v-model="res.year" required />
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea v-model="res.description"></textarea>
              </div>
            </div>
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
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
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
  overflow-x: auto;
  width: 100%;
  display: block;
}
.data-table {
  width: 100%;
  min-width: 1500px;
  border-collapse: collapse;
}
.data-table th, .data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}
.action-cell {
  position: sticky;
  right: 0;
  background-color: #e1e1e1;
  z-index: 2;
  border-left: 2px solid #e2e8f0;
  box-shadow: -4px 0 6px -1px rgba(0, 0, 0, 0.05);
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
