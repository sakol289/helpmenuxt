<template>
  <div class="max-w-6xl mx-auto py-10 px-4 space-y-8">
    <header class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <p class="text-sm text-gray-500">หน้าผู้ประเมิน</p>
        <h1 class="text-2xl font-semibold">รายการที่ต้องประเมิน</h1>
      </div>
      <button
        class="px-3 py-2 rounded bg-gray-900 text-white hover:bg-gray-800 text-sm"
        @click="loadAssignments"
      >
        โหลดรายการล่าสุด
      </button>
    </header>

    <section class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1 space-y-3">
        <div
          v-for="assignment in assignments"
          :key="assignment.id"
          class="border rounded-lg p-4 cursor-pointer transition hover:border-indigo-500"
          :class="{
            'border-indigo-500 bg-indigo-50': selectedAssignment?.id === assignment.id
          }"
          @click="selectAssignment(assignment)"
        >
          <p class="text-sm text-gray-500">ผู้ถูกประเมิน</p>
          <p class="font-semibold">
            {{ assignment.evaluatee_firstname }} {{ assignment.evaluatee_lastname }}
          </p>
          <p class="text-sm text-gray-500">
            แผนก: {{ assignment.department }} | บทบาทของคุณ: {{ assignment.role }}
          </p>
          <div class="mt-2">
            <span
              class="text-xs px-2 py-1 rounded"
              :class="
                assignment.result_status === 'final'
                  ? 'bg-green-100 text-green-700'
                  : assignment.result_status === 'draft'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
              "
            >
              สถานะ:
              {{ assignment.result_status ? assignment.result_status : 'ยังไม่เริ่ม' }}
            </span>
          </div>
          <p v-if="assignment.total_score !== null" class="text-sm mt-1 text-gray-700">
            คะแนนล่าสุด: {{ assignment.total_score }}
          </p>
        </div>
        <p v-if="!assignments.length" class="text-sm text-gray-500">
          ยังไม่มีการมอบหมายให้คุณ
        </p>
      </div>

      <div class="lg:col-span-2">
        <div v-if="!selectedAssignment" class="border border-dashed rounded-lg p-6 text-center">
          <p class="text-gray-500">เลือกผู้ถูกประเมินจากด้านซ้ายเพื่อกรอกผล</p>
        </div>
        <div v-else class="space-y-6">
          <div class="bg-white shadow rounded-lg p-6 space-y-4">
            <div class="space-y-1">
              <p class="text-sm text-gray-500">กำลังประเมิน</p>
              <p class="text-xl font-semibold">
                {{ selectedAssignment.evaluatee_firstname }}
                {{ selectedAssignment.evaluatee_lastname }}
              </p>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <label class="text-sm space-y-1">
                <span>คะแนนรวม (ผู้ประเมินกรอก)</span>
                <input
                  v-model="form.total_score"
                  type="number"
                  class="w-full border rounded px-3 py-2"
                  placeholder="เช่น 90"
                />
              </label>
              <label class="text-sm space-y-1">
                <span>สถานะผล</span>
                <select v-model="form.status" class="w-full border rounded px-3 py-2">
                  <option value="draft">บันทึกร่าง</option>
                  <option value="final">ส่งยืนยัน</option>
                </select>
              </label>
            </div>

            <label class="text-sm space-y-1">
              <span>สรุปผล/หมายเหตุ</span>
              <textarea
                v-model="form.summary"
                rows="4"
                class="w-full border rounded px-3 py-2 resize-none"
                placeholder="บันทึกข้อสังเกตหรือผลการประเมิน"
              ></textarea>
            </label>

            <div class="flex items-center gap-3">
              <button
                class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-300"
                :disabled="saving"
                @click="submitEvaluation"
              >
                {{ saving ? 'กำลังบันทึก...' : 'บันทึกผล' }}
              </button>
              <p v-if="message.text" :class="messageClass">{{ message.text }}</p>
            </div>
          </div>

          <div class="bg-white shadow rounded-lg p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">หัวข้อจาก CategoryEvaluation</h2>
              <p v-if="categoryLoading" class="text-sm text-gray-500">
                กำลังโหลดหัวข้อ...
              </p>
            </div>
            <p v-if="categoryMessage.text" :class="categoryMessageClass">
              {{ categoryMessage.text }}
            </p>
            <div class="space-y-4" v-if="categoryList.length">
              <div
                v-for="category in categoryList"
                :key="category.id"
                class="border rounded-lg p-4 space-y-3"
              >
                <div class="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <p class="text-sm text-gray-500">
                        {{ category.code }}
                      </p>
                      <span class="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                        {{ typeDescriptions[category.type] || category.type }}
                      </span>
                    </div>
                    <p class="font-semibold">{{ category.name }}</p>
                  </div>
                  <select
                    v-model="category.localStatus"
                    class="border rounded px-2 py-1 text-sm"
                  >
                    <option value="draft">draft</option>
                    <option value="final">final</option>
                  </select>
                </div>

                <div v-if="category.type === 'score'" class="grid md:grid-cols-3 gap-3">
                  <label class="text-sm space-y-1 md:col-span-2">
                    <span>คะแนน (ช่วง {{ SCORE_RANGE.min }} - {{ SCORE_RANGE.max }})</span>
                    <input
                      type="number"
                      class="w-full border rounded px-3 py-2"
                      v-model.number="category.localValue"
                      :min="SCORE_RANGE.min"
                      :max="SCORE_RANGE.max"
                    />
                  </label>
                </div>

                <div v-else-if="category.type === 'yes_or_no'" class="space-y-1">
                  <span class="text-sm">เลือกคำตอบ (ใช่ / ไม่ใช่)</span>
                  <select v-model="category.localValue" class="border rounded px-3 py-2">
                    <option value="">-- เลือก --</option>
                    <option value="true">ใช่</option>
                    <option value="false">ไม่ใช่</option>
                  </select>
                </div>

                <div v-else class="space-y-1">
                  <span class="text-sm">แนบลิงก์หรืออธิบายหลักฐาน</span>
                  <input
                    type="text"
                    v-model="category.localValue"
                    class="w-full border rounded px-3 py-2"
                    placeholder="เช่น URL หรือคำอธิบาย"
                  />
                </div>

                <div class="flex items-center gap-3">
                  <button
                    class="px-3 py-1.5 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-500 disabled:bg-gray-300"
                    :disabled="category.saving"
                    @click="saveCategory(category)"
                  >
                    {{ category.saving ? 'กำลังบันทึก...' : 'บันทึกหัวข้อนี้' }}
                  </button>
                  <p v-if="category.message" :class="category.messageClass">
                    {{ category.message }}
                  </p>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500">ไม่พบหัวข้อให้ประเมิน</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const assignments = ref([])
const selectedAssignment = ref(null)
const loading = ref(false)
const saving = ref(false)
const message = reactive({ text: '', isError: false })

const categoryList = ref([])
const categoryLoading = ref(false)
const categoryMessage = reactive({ text: '', isError: false })

const form = reactive({
  total_score: '',
  summary: '',
  status: 'draft'
})

const loadAssignments = async () => {
  loading.value = true
  message.text = ''
  try {
    const res = await $fetch('/api/evaluation/my-assignments', {
      credentials: 'include'
    })
    assignments.value = res?.data || []
    if (selectedAssignment.value) {
      const updated = assignments.value.find(
        (item) => item.id === selectedAssignment.value.id
      )
      if (updated) {
        await selectAssignment(updated)
      } else if (assignments.value.length) {
        await selectAssignment(assignments.value[0])
      } else {
        selectedAssignment.value = null
        categoryList.value = []
      }
    } else if (assignments.value.length) {
      await selectAssignment(assignments.value[0])
    }
  } catch (error) {
    message.text = error?.data?.message || 'โหลดรายการไม่สำเร็จ'
    message.isError = true
  } finally {
    loading.value = false
  }
}

const selectAssignment = async (assignment) => {
  selectedAssignment.value = assignment
  form.total_score =
    assignment.total_score === null || assignment.total_score === undefined
      ? ''
      : assignment.total_score
  form.summary = assignment.summary || ''
  form.status = assignment.result_status || 'draft'
  message.text = ''
  await loadCategoryDetail(assignment.evaluatee_id)
}

const submitEvaluation = async () => {
  if (!selectedAssignment.value) {
    message.text = 'กรุณาเลือกรายการก่อน'
    message.isError = true
    return
  }

  saving.value = true
  message.text = ''
  try {
    await $fetch('/api/evaluation/result', {
      method: 'POST',
      credentials: 'include',
      body: {
        evaluatee_id: selectedAssignment.value.evaluatee_id,
        total_score: form.total_score === '' ? null : Number(form.total_score),
        summary: form.summary,
        status: form.status
      }
    })
    message.text = 'บันทึกผลสำเร็จ'
    message.isError = false
    await loadAssignments()
  } catch (error) {
    message.text = error?.data?.message || 'บันทึกผลไม่สำเร็จ'
    message.isError = true
  } finally {
    saving.value = false
  }
}

const messageClass = computed(() =>
  message.isError ? 'text-sm text-red-600' : 'text-sm text-green-600'
)

const categoryMessageClass = computed(() =>
  categoryMessage.isError ? 'text-sm text-red-600' : 'text-sm text-green-600'
)

const typeDescriptions = {
  score: 'แบบให้คะแนน',
  yes_or_no: 'แบบใช่ / ไม่ใช่',
  file_or_url: 'แบบแนบลิงก์ / ข้อความ'
}

const SCORE_RANGE = {
  min: 1,
  max: 4
}

const loadCategoryDetail = async (evaluateeId) => {
  if (!evaluateeId) return
  categoryLoading.value = true
  categoryMessage.text = ''
  try {
    const res = await $fetch('/api/evaluation/assignment-detail', {
      credentials: 'include',
      query: { evaluatee_id: evaluateeId }
    })
    const categories = res?.data?.categories || []
    categoryList.value = categories.map((cat) => ({
      ...cat,
      localValue: deriveLocalValue(cat),
      localStatus: cat.result_status || 'draft',
      saving: false,
      message: '',
      messageClass: ''
    }))
  } catch (error) {
    categoryMessage.text = error?.data?.message || 'โหลดหัวข้อไม่สำเร็จ'
    categoryMessage.isError = true
    categoryList.value = []
  } finally {
    categoryLoading.value = false
  }
}

const deriveLocalValue = (category) => {
  if (category.type === 'score') {
    return category.value_number ?? ''
  }
  if (category.type === 'yes_or_no') {
    if (category.value_boolean === null || category.value_boolean === undefined) {
      return ''
    }
    return category.value_boolean ? 'true' : 'false'
  }
  return category.value_text || ''
}

const saveCategory = async (category) => {
  if (!selectedAssignment.value) return
  category.saving = true
  category.message = ''
  try {
    await $fetch('/api/evaluation/category-result', {
      method: 'POST',
      credentials: 'include',
      body: {
        category_id: category.id,
        evaluatee_id: selectedAssignment.value.evaluatee_id,
        status: category.localStatus,
        value:
          category.type === 'score'
            ? category.localValue === '' || category.localValue === null
              ? null
              : Number(category.localValue)
            : category.localValue
      }
    })
    category.message = 'บันทึกแล้ว'
    category.messageClass = 'text-xs text-green-600'
  } catch (error) {
    category.message = error?.data?.message || 'บันทึกไม่สำเร็จ'
    category.messageClass = 'text-xs text-red-600'
  } finally {
    category.saving = false
  }
}

onMounted(loadAssignments)
</script>

