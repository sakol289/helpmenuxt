<template>
  <div class="max-w-5xl mx-auto py-10 px-4 space-y-8">
    <header class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <p class="text-sm text-gray-500">หน้าผู้ดูแล</p>
        <h1 class="text-2xl font-semibold">จัดการรอบการประเมิน (TopicEvaluation)</h1>
      </div>
      <button
        class="px-3 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm"
        @click="loadTopics"
      >
        โหลดรายการล่าสุด
      </button>
    </header>

    <section class="bg-white shadow rounded-lg p-6 space-y-4">
      <h2 class="text-lg font-semibold">เพิ่มรอบการประเมิน</h2>
      <div class="grid md:grid-cols-2 gap-4">
        <label class="text-sm space-y-1">
          <span>รหัส (code)</span>
          <input v-model="form.code" type="text" class="w-full border rounded px-3 py-2" />
        </label>
        <label class="text-sm space-y-1">
          <span>ชื่อรอบ (name)</span>
          <input v-model="form.name" type="text" class="w-full border rounded px-3 py-2" />
        </label>
        <label class="text-sm space-y-1">
          <span>ปี (year)</span>
          <input v-model="form.year" type="text" class="w-full border rounded px-3 py-2" />
        </label>
        <label class="text-sm space-y-1">
          <span>สถานะ</span>
          <select v-model="form.status" class="w-full border rounded px-3 py-2">
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </label>
        <label class="text-sm space-y-1">
          <span>วันเริ่ม (start_date)</span>
          <input v-model="form.start_date" type="date" class="w-full border rounded px-3 py-2" />
        </label>
        <label class="text-sm space-y-1">
          <span>วันสิ้นสุด (end_date)</span>
          <input v-model="form.end_date" type="date" class="w-full border rounded px-3 py-2" />
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
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:bg-gray-300"
          :disabled="saving"
          @click="submitTopic"
        >
          {{ saving ? 'กำลังบันทึก...' : 'เพิ่มรอบการประเมิน' }}
        </button>
        <p v-if="message.text" :class="messageClass">{{ message.text }}</p>
      </div>
    </section>

    <section class="bg-white shadow rounded-lg p-6 space-y-4">
      <h2 class="text-lg font-semibold">รายการรอบทั้งหมด</h2>
      <p v-if="loading" class="text-sm text-gray-500">กำลังโหลด...</p>
      <p v-else-if="listError" class="text-sm text-red-600">{{ listError }}</p>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-100 text-left">
            <tr>
              <th class="p-2">รหัส</th>
              <th class="p-2">ชื่อ</th>
              <th class="p-2">ปี</th>
              <th class="p-2">ช่วงเวลา</th>
              <th class="p-2">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="topic in topics" :key="topic.id" class="border-b">
              <td class="p-2">{{ topic.code }}</td>
              <td class="p-2">{{ topic.name }}</td>
              <td class="p-2">{{ topic.year }}</td>
              <td class="p-2">
                {{ formatDate(topic.start_date) }} - {{ formatDate(topic.end_date) }}
              </td>
              <td class="p-2">
                <span
                  class="px-2 py-1 rounded text-xs"
                  :class="topic.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                >
                  {{ topic.status }}
                </span>
              </td>
            </tr>
            <tr v-if="!topics.length">
              <td colspan="5" class="text-center p-4 text-gray-500">ยังไม่มีข้อมูล</td>
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
const loading = ref(false)
const listError = ref('')
const saving = ref(false)
const message = reactive({ text: '', isError: false })

const form = reactive({
  code: '',
  name: '',
  year: new Date().getFullYear().toString(),
  start_date: '',
  end_date: '',
  description: '',
  status: 'active'
})

const loadTopics = async () => {
  loading.value = true
  listError.value = ''
  try {
    const res = await $fetch('/api/TopicEvaluation', {
      credentials: 'include'
    })
    topics.value = res?.data?.results || []
  } catch (error) {
    listError.value = error?.data?.message || 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.code = ''
  form.name = ''
  form.year = new Date().getFullYear().toString()
  form.start_date = ''
  form.end_date = ''
  form.description = ''
  form.status = 'active'
}

const submitTopic = async () => {
  saving.value = true
  message.text = ''
  try {
    await $fetch('/api/TopicEvaluation', {
      method: 'POST',
      credentials: 'include',
      body: { ...form }
    })
    message.text = 'เพิ่มรอบเรียบร้อย'
    message.isError = false
    resetForm()
    await loadTopics()
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

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('th-TH')
}

onMounted(loadTopics)
</script>

