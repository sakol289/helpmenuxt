<template>
  <div class="max-w-6xl mx-auto py-10 px-4 space-y-8">
    <header class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <p class="text-sm text-gray-500">หน้าผู้ดูแล</p>
        <h1 class="text-2xl font-semibold">จัดการตัวชี้วัด (CategoryEvaluation)</h1>
      </div>
      <button
        class="px-3 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm"
        @click="loadCategories"
      >
        โหลดรายการล่าสุด
      </button>
    </header>

    <section class="bg-white shadow rounded-lg p-6 space-y-4">
      <h2 class="text-lg font-semibold">เพิ่มตัวชี้วัด</h2>
      <div class="grid md:grid-cols-2 gap-4">
        <label class="text-sm space-y-1">
          <span>รหัส (code)</span>
          <input v-model="form.code" type="text" class="w-full border rounded px-3 py-2" />
        </label>
        <label class="text-sm space-y-1">
          <span>ชื่อหัวข้อ (name)</span>
          <input v-model="form.name" type="text" class="w-full border rounded px-3 py-2" />
        </label>
        <label class="text-sm space-y-1">
          <span>น้ำหนัก (weight)</span>
          <input v-model.number="form.weight" type="number" class="w-full border rounded px-3 py-2" />
        </label>
        <label class="text-sm space-y-1">
          <span>ประเภท</span>
          <select v-model="form.type" class="w-full border rounded px-3 py-2">
            <option value="score">score</option>
            <option value="yes_or_no">yes_or_no</option>
            <option value="file_or_url">file_or_url</option>
          </select>
        </label>
        <label class="text-sm space-y-1">
          <span>สถานะ</span>
          <select v-model="form.status" class="w-full border rounded px-3 py-2">
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </label>
        <label class="text-sm space-y-1">
          <span>Topic Evaluation</span>
          <select v-model.number="form.topic_evaluation_id" class="w-full border rounded px-3 py-2">
            <option value="">-- เลือก --</option>
            <option v-for="topic in topics" :key="topic.id" :value="topic.id">
              {{ topic.code }} - {{ topic.name }}
            </option>
          </select>
        </label>
      </div>
      <label class="text-sm space-y-1 block">
        <span>รายละเอียด</span>
        <textarea
          v-model="form.description"
          rows="3"
          class="w-full border rounded px-3 py-2 resize-none"
        ></textarea>
      </label>
      <div class="flex items-center gap-3">
        <button
          class="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500 disabled:bg-gray-300"
          :disabled="saving"
          @click="submitCategory"
        >
          {{ saving ? 'กำลังบันทึก...' : 'เพิ่มตัวชี้วัด' }}
        </button>
        <p v-if="message.text" :class="messageClass">{{ message.text }}</p>
      </div>
    </section>

    <section class="bg-white shadow rounded-lg p-6 space-y-4">
      <h2 class="text-lg font-semibold">รายการตัวชี้วัดทั้งหมด</h2>
      <p v-if="loading" class="text-sm text-gray-500">กำลังโหลด...</p>
      <p v-else-if="listError" class="text-sm text-red-600">{{ listError }}</p>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-100 text-left">
            <tr>
              <th class="p-2">รหัส</th>
              <th class="p-2">ชื่อ</th>
              <th class="p-2">น้ำหนัก</th>
              <th class="p-2">ประเภท</th>
              <th class="p-2">Topic</th>
              <th class="p-2">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in categories" :key="cat.id" class="border-b">
              <td class="p-2">{{ cat.code }}</td>
              <td class="p-2">{{ cat.name }}</td>
              <td class="p-2">{{ cat.weight }}</td>
              <td class="p-2">{{ typeDescriptions[cat.type] || cat.type }}</td>
              <td class="p-2">{{ findTopicName(cat.topic_evaluation_id) }}</td>
              <td class="p-2">
                <span
                  class="px-2 py-1 rounded text-xs"
                  :class="cat.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                >
                  {{ cat.status }}
                </span>
              </td>
            </tr>
            <tr v-if="!categories.length">
              <td colspan="6" class="text-center p-4 text-gray-500">ยังไม่มีข้อมูล</td>
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

const topics = ref([])
const categories = ref([])
const loading = ref(false)
const listError = ref('')
const saving = ref(false)
const message = reactive({ text: '', isError: false })

const form = reactive({
  code: '',
  name: '',
  weight: 1,
  type: 'score',
  description: '',
  status: 'active',
  topic_evaluation_id: ''
})

const loadTopics = async () => {
  try {
    const res = await $fetch('/api/TopicEvaluation', {
      credentials: 'include'
    })
    topics.value = res?.data?.results || []
  } catch (error) {
    console.error('โหลด TopicEvaluation ไม่สำเร็จ', error)
  }
}

const loadCategories = async () => {
  loading.value = true
  listError.value = ''
  try {
    const res = await $fetch('/api/CategoryEvaluation', {
      credentials: 'include'
    })
    categories.value = res?.data?.results || []
  } catch (error) {
    listError.value = error?.data?.message || 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.code = ''
  form.name = ''
  form.weight = 1
  form.type = 'score'
  form.description = ''
  form.status = 'active'
  form.topic_evaluation_id = ''
}

const submitCategory = async () => {
  saving.value = true
  message.text = ''
  try {
    await $fetch('/api/CategoryEvaluation', {
      method: 'POST',
      credentials: 'include',
      body: {
        ...form,
        weight: Number(form.weight),
        topic_evaluation_id: Number(form.topic_evaluation_id)
      }
    })
    message.text = 'เพิ่มตัวชี้วัดเรียบร้อย'
    message.isError = false
    resetForm()
    await loadCategories()
  } catch (error) {
    message.text = error?.data?.message || 'บันทึกไม่สำเร็จ'
    message.isError = true
  } finally {
    saving.value = false
  }
}

const messageClass = computed(() =>
  message.isError ? 'text-sm text-red-600' : 'text-sm text-green-600'
)

const typeDescriptions = {
  score: 'แบบให้คะแนน',
  yes_or_no: 'แบบใช่ / ไม่ใช่',
  file_or_url: 'แบบแนบลิงก์ / ข้อความ'
}

const findTopicName = (topicId) => {
  const topic = topics.value.find((t) => t.id === topicId)
  return topic ? `${topic.code} - ${topic.name}` : '-'
}

onMounted(async () => {
  await Promise.all([loadTopics(), loadCategories()])
})
</script>

