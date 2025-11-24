<template>
  <div class="max-w-5xl mx-auto py-10 px-4 space-y-10">
    <header class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <p class="text-sm text-gray-500">ตัวอย่างหน้ากรอก Self-Evaluation</p>
        <h1 class="text-2xl font-semibold">บันทึกผลงาน/หลักฐานส่วนบุคคล</h1>
      </div>
      <button
        class="px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-800 text-sm"
        @click="resetForm"
      >
        ล้างฟอร์ม
      </button>
    </header>

    <section class="bg-white shadow rounded-lg p-6 space-y-6">
      <div class="grid md:grid-cols-2 gap-6">
        <label class="text-sm space-y-1">
          <span class="font-medium">รอบการประเมิน (Period)</span>
          <select
            v-model="form.periodId"
            class="w-full border rounded px-3 py-2"
            :disabled="periodLoading"
          >
            <option value="" disabled>เลือกรอบการประเมิน</option>
            <option
              v-for="period in periodOptions"
              :key="period.id"
              :value="period.id"
            >
              {{ period.name }} ({{ period.year }})
            </option>
          </select>
          <p v-if="periodError" class="text-xs text-red-600">{{ periodError }}</p>
        </label>

        <label class="text-sm space-y-1">
          <span class="font-medium">ตัวชี้วัด (Indicator)</span>
          <select
            v-model="form.categoryId"
            class="w-full border rounded px-3 py-2"
            :disabled="categoryLoading || !form.periodId"
          >
            <option value="" disabled>เลือกตัวชี้วัด</option>
            <option
              v-for="category in filteredCategories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.code }} — {{ category.name }}
            </option>
          </select>
          <p v-if="categoryError" class="text-xs text-red-600">{{ categoryError }}</p>
        </label>

        <label class="text-sm space-y-1">
          <span class="font-medium">สถานะ</span>
          <select v-model="form.status" class="w-full border rounded px-3 py-2">
            <option value="draft">บันทึกร่าง</option>
            <option value="submitted">ส่งยืนยัน</option>
          </select>
        </label>
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium block">เลือกไฟล์หลักฐาน</label>
        <input
          ref="fileInputRef"
          type="file"
          @change="handleFileChange"
          class="w-full border rounded px-3 py-2 bg-gray-50"
        />
        <div
          v-if="selectedFile"
          class="text-xs text-gray-600 flex items-center justify-between bg-gray-100 rounded px-3 py-2"
        >
          <span>{{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})</span>
          <button class="text-red-600 text-xs" @click="removeFile">ลบไฟล์</button>
        </div>
        <p v-if="fileError" class="text-xs text-red-600">{{ fileError }}</p>
        <div class="text-sm bg-blue-50 border border-blue-200 rounded px-4 py-3">
          <p><strong>ชนิดไฟล์ที่อนุญาต:</strong> PDF, PNG, JPEG, WEBP</p>
          <p><strong>ขนาดสูงสุด:</strong> 10 MB</p>
        </div>
      </div>

      <div class="flex items-center gap-3 pt-4">
        <button
          class="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-300 disabled:text-gray-600"
          :disabled="submitDisabled"
          @click="submitForm"
        >
          {{ submitting ? 'กำลังอัปโหลด...' : 'Upload' }}
        </button>
        <p v-if="submitMessage" :class="submitMessageClass">
          {{ submitMessage }}
        </p>
      </div>
    </section>

    <section class="bg-white shadow rounded-lg p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">บันทึกของฉัน</h2>
        <button class="text-sm text-blue-600" @click="fetchSubmissions">
          รีเฟรชรายการ
        </button>
      </div>
      <p v-if="submissionsLoading" class="text-gray-500 text-sm">กำลังโหลด...</p>
      <p v-else-if="submissionsError" class="text-red-600 text-sm">{{ submissionsError }}</p>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-100 text-left">
            <tr>
              <th class="p-2">รอบการประเมิน</th>
              <th class="p-2">ตัวชี้วัด</th>
              <th class="p-2">สถานะ</th>
              <th class="p-2">ไฟล์</th>
              <th class="p-2">วันที่</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in submissions" :key="item.id" class="border-b">
              <td class="p-2">
                <div class="font-medium">{{ item.topic_name || '-' }}</div>
                <div class="text-xs text-gray-500">{{ item.topic_year || '' }}</div>
              </td>
              <td class="p-2">
                <div class="font-medium">{{ item.category_code || '-' }}</div>
                <div class="text-xs text-gray-500">{{ item.category_name || '' }}</div>
              </td>
              <td class="p-2">
                <span
                  class="px-2 py-1 rounded text-xs"
                  :class="item.status === 'submitted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                >
                  {{ item.status }}
                </span>
              </td>
              <td class="p-2">
                <span class="text-xs text-gray-600">
                  {{ item.file_original_name || '-' }}<br />
                  ({{ formatFileSize(item.file_size) }})
                </span>
              </td>
              <td class="p-2 text-xs text-gray-500">
                {{ formatDate(item.created_at) }}
              </td>
            </tr>
            <tr v-if="!submissions.length">
              <td colspan="6" class="text-center text-gray-500 p-4">
                ยังไม่มีการบันทึก
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const form = reactive({
  periodId: '',
  categoryId: '',
  status: 'draft'
})

const selectedFile = ref(null)
const fileInputRef = ref(null)

const periodOptions = ref([])
const categoryOptions = ref([])

const periodLoading = ref(false)
const categoryLoading = ref(false)
const periodError = ref('')
const categoryError = ref('')

const fileError = ref('')

const submitting = ref(false)
const submitMessage = ref('')
const submitSuccess = ref(false)
const submissions = ref([])
const submissionsLoading = ref(false)
const submissionsError = ref('')

const fetchPeriods = async () => {
  periodLoading.value = true
  periodError.value = ''
  try {
    const response = await $fetch('/api/TopicEvaluation', {
      credentials: 'include'
    })
    periodOptions.value = response?.data?.results || []
  } catch (error) {
    periodError.value = error?.data?.message || 'โหลดข้อมูลรอบการประเมินไม่สำเร็จ'
  } finally {
    periodLoading.value = false
  }
}

const fetchCategories = async () => {
  categoryLoading.value = true
  categoryError.value = ''
  try {
    const response = await $fetch('/api/CategoryEvaluation', {
      credentials: 'include'
    })
    categoryOptions.value = response?.data?.results || []
  } catch (error) {
    categoryError.value = error?.data?.message || 'โหลดข้อมูลตัวชี้วัดไม่สำเร็จ'
  } finally {
    categoryLoading.value = false
  }
}

const filteredCategories = computed(() => {
  if (!form.periodId) return []
  return categoryOptions.value.filter(
    (cat) => Number(cat.topic_evaluation_id) === Number(form.periodId)
  )
})

const handleFileChange = (event) => {
  const file = event.target.files?.[0]
  fileError.value = ''
  selectedFile.value = file || null
}

const removeFile = () => {
  selectedFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const getCurrentFile = () =>
  selectedFile.value || fileInputRef.value?.files?.[0] || null

const validateForm = () => {
  fileError.value = ''

  if (!form.periodId) {
    periodError.value = 'กรุณาเลือกรอบการประเมิน'
    return false
  }

  if (!form.categoryId) {
    categoryError.value = 'กรุณาเลือกตัวชี้วัด'
    return false
  }

  const file = getCurrentFile()

  if (!file) {
    fileError.value = 'กรุณาเลือกไฟล์หลักฐาน'
    return false
  }

  selectedFile.value = file
  return true
}

const submitDisabled = computed(() => submitting.value)

const submitForm = async () => {
  if (!validateForm()) return

  submitting.value = true
  submitMessage.value = ''
  submitSuccess.value = false

  try {
    const file = getCurrentFile()
    if (!file) {
      fileError.value = 'กรุณาเลือกไฟล์หลักฐาน'
      submitting.value = false
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('period_id', String(form.periodId))
    formData.append('category_id', String(form.categoryId))
    formData.append('status', form.status)

    await $fetch('/api/self-evaluation', {
      method: 'POST',
      credentials: 'include',
      body: formData
    })

    submitMessage.value = 'อัปโหลดสำเร็จ'
    submitSuccess.value = true
    await fetchSubmissions()
    resetForm()
  } catch (error) {
    submitMessage.value = error?.data?.message || 'อัปโหลดไม่สำเร็จ'
    submitSuccess.value = false
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  form.periodId = ''
  form.categoryId = ''
  form.status = 'draft'
  selectedFile.value = null
  submitMessage.value = ''
  submitSuccess.value = false
  categoryError.value = ''
  periodError.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const formatFileSize = (size) => {
  if (!size) return '0 B'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('th-TH')
}

const fetchSubmissions = async () => {
  submissionsLoading.value = true
  submissionsError.value = ''
  try {
    const res = await $fetch('/api/self-evaluation', {
      credentials: 'include'
    })
    submissions.value = res?.data || []
  } catch (error) {
    submissionsError.value = error?.data?.message || 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    submissionsLoading.value = false
  }
}

const submitMessageClass = computed(() =>
  submitSuccess.value ? 'text-sm text-green-600' : 'text-sm text-red-600'
)

onMounted(async () => {
  await Promise.all([fetchPeriods(), fetchCategories(), fetchSubmissions()])
})
</script>

