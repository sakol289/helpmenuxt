<template>
  <div class="max-w-6xl mx-auto py-10 px-4 space-y-10">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">หน้าทดสอบระบบประเมิน (โง่ๆแต่ใช้งานได้)</h1>
      <button
        class="px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 text-sm"
        @click="refreshAll"
      >
        รีเฟรชข้อมูลทั้งหมด
      </button>
    </div>

    <!-- Assign form -->
    <section class="bg-white shadow rounded p-6 space-y-4">
      <h2 class="text-xl font-semibold">มอบหมายกรรมการ</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label class="text-sm space-y-1">
          <span>รหัสกรรมการ (evaluator_id)</span>
          <input
            v-model="assignForm.evaluator_id"
            type="number"
            class="w-full border rounded px-3 py-2"
            placeholder="เช่น 2"
          />
        </label>
        <label class="text-sm space-y-1">
          <span>รหัสผู้ถูกประเมิน (evaluatee_id)</span>
          <input
            v-model="assignForm.evaluatee_id"
            type="number"
            class="w-full border rounded px-3 py-2"
            placeholder="เช่น 5"
          />
        </label>
        <label class="text-sm space-y-1">
          <span>บทบาท</span>
          <select v-model="assignForm.role" class="w-full border rounded px-3 py-2">
            <option value="ประธาน">ประธาน</option>
            <option value="กรรมการ">กรรมการ</option>
          </select>
        </label>
      </div>
      <div class="flex gap-3">
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          :disabled="assignLoading"
          @click="submitAssignment"
        >
          {{ assignLoading ? 'กำลังบันทึก...' : 'บันทึกการมอบหมาย' }}
        </button>
        <p v-if="assignError" class="text-red-600 text-sm">{{ assignError }}</p>
        <p v-if="assignResponse" class="text-green-700 text-sm">
          ✔ {{ assignResponse.message }}
        </p>
      </div>
    </section>

    <!-- Result form -->
    <section class="bg-white shadow rounded p-6 space-y-4">
      <h2 class="text-xl font-semibold">บันทึกผลการประเมิน</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label class="text-sm space-y-1">
          <span>รหัสกรรมการ</span>
          <input v-model="resultForm.evaluator_id" type="number" class="w-full border rounded px-3 py-2" />
        </label>
        <label class="text-sm space-y-1">
          <span>รหัสผู้ถูกประเมิน</span>
          <input v-model="resultForm.evaluatee_id" type="number" class="w-full border rounded px-3 py-2" />
        </label>
        <label class="text-sm space-y-1">
          <span>คะแนนรวม</span>
          <input v-model="resultForm.total_score" type="number" class="w-full border rounded px-3 py-2" />
        </label>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="text-sm space-y-1">
          <span>สถานะ</span>
          <select v-model="resultForm.status" class="w-full border rounded px-3 py-2">
            <option value="draft">draft</option>
            <option value="final">final</option>
          </select>
        </label>
        <label class="text-sm space-y-1">
          <span>สรุปผล</span>
          <input v-model="resultForm.summary" type="text" class="w-full border rounded px-3 py-2" />
        </label>
      </div>
      <div class="flex gap-3">
        <button
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
          :disabled="resultLoading"
          @click="submitResult"
        >
          {{ resultLoading ? 'กำลังบันทึก...' : 'บันทึกผล' }}
        </button>
        <p v-if="resultError" class="text-red-600 text-sm">{{ resultError }}</p>
        <p v-if="resultResponse" class="text-green-700 text-sm">
          ✔ {{ resultResponse.message }}
        </p>
      </div>
    </section>

    <!-- Data sections -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white shadow rounded p-4 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">รายการมอบหมาย</h3>
          <button class="text-sm text-blue-600" @click="loadSummary">รีเฟรช</button>
        </div>
        <p v-if="summaryLoading" class="text-gray-500 text-sm">กำลังโหลด...</p>
        <p v-else-if="summaryError" class="text-red-600 text-sm">{{ summaryError }}</p>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="bg-gray-100 text-left">
              <th class="p-2">กรรมการ</th>
              <th class="p-2">ผู้ถูกประเมิน</th>
              <th class="p-2">บทบาท</th>
              <th class="p-2">สถานะผล</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in committeeSummary" :key="row.assignment_id" class="border-b">
              <td class="p-2">
                {{ row.evaluator_firstname }} {{ row.evaluator_lastname }}
              </td>
              <td class="p-2">
                {{ row.evaluatee_firstname }} {{ row.evaluatee_lastname }}
              </td>
              <td class="p-2">{{ row.role }}</td>
              <td class="p-2">{{ row.evaluation_status || '-' }}</td>
            </tr>
            <tr v-if="!committeeSummary.length">
              <td colspan="4" class="p-3 text-center text-gray-500">ยังไม่มีข้อมูล</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bg-white shadow rounded p-4 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">สถานะกรรมการ</h3>
          <button class="text-sm text-blue-600" @click="loadCommitteeStatus">รีเฟรช</button>
        </div>
        <p v-if="committeeStatusLoading" class="text-gray-500 text-sm">กำลังโหลด...</p>
        <p v-else-if="committeeStatusError" class="text-red-600 text-sm">{{ committeeStatusError }}</p>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="bg-gray-100 text-left">
              <th class="p-2">กรรมการ</th>
              <th class="p-2">ได้รับ</th>
              <th class="p-2">เสร็จ</th>
              <th class="p-2">ค้าง</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in committeeStatus" :key="row.evaluator_id" class="border-b">
              <td class="p-2">
                {{ row.evaluator_firstname }} {{ row.evaluator_lastname }}
              </td>
              <td class="p-2">{{ row.assigned_count || 0 }}</td>
              <td class="p-2 text-green-700">{{ row.completed_count || 0 }}</td>
              <td class="p-2 text-yellow-700">{{ row.pending_count || 0 }}</td>
            </tr>
            <tr v-if="!committeeStatus.length">
              <td colspan="4" class="p-3 text-center text-gray-500">ยังไม่มีข้อมูล</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white shadow rounded p-4 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">สถานะผู้ถูกประเมิน</h3>
          <button class="text-sm text-blue-600" @click="loadEvaluateeStatus">รีเฟรช</button>
        </div>
        <p v-if="evaluateeStatusLoading" class="text-gray-500 text-sm">กำลังโหลด...</p>
        <p v-else-if="evaluateeStatusError" class="text-red-600 text-sm">{{ evaluateeStatusError }}</p>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="bg-gray-100 text-left">
              <th class="p-2">ผู้ถูกประเมิน</th>
              <th class="p-2">กรรมการทั้งหมด</th>
              <th class="p-2">ทำเสร็จ</th>
              <th class="p-2">คะแนนเฉลี่ย</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in evaluateeStatus" :key="row.evaluatee_id" class="border-b">
              <td class="p-2">
                {{ row.evaluatee_firstname }} {{ row.evaluatee_lastname }}
              </td>
              <td class="p-2">{{ row.committee_count || 0 }}</td>
              <td class="p-2 text-green-700">{{ row.completed_count || 0 }}</td>
              <td class="p-2">{{ (row.avg_score ?? 0).toFixed(2) }}</td>
            </tr>
            <tr v-if="!evaluateeStatus.length">
              <td colspan="4" class="p-3 text-center text-gray-500">ยังไม่มีข้อมูล</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bg-white shadow rounded p-4 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">รายงานสรุป (ต่อผู้ถูกประเมิน)</h3>
          <button class="text-sm text-blue-600" @click="loadReport">รีเฟรช</button>
        </div>
        <p v-if="reportLoading" class="text-gray-500 text-sm">กำลังโหลด...</p>
        <p v-else-if="reportError" class="text-red-600 text-sm">{{ reportError }}</p>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="bg-gray-100 text-left">
              <th class="p-2">ผู้ถูกประเมิน</th>
              <th class="p-2">คะแนนรวม</th>
              <th class="p-2">เสร็จแล้ว</th>
              <th class="p-2">กรรมการทั้งหมด</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in reportData" :key="row.evaluatee_id" class="border-b">
              <td class="p-2">
                {{ row.evaluatee_firstname }} {{ row.evaluatee_lastname }}
              </td>
              <td class="p-2">{{ row.total_score || 0 }}</td>
              <td class="p-2 text-green-700">{{ row.finalized_count || 0 }}</td>
              <td class="p-2">{{ row.assigned_committee || 0 }}</td>
            </tr>
            <tr v-if="!reportData.length">
              <td colspan="4" class="p-3 text-center text-gray-500">ยังไม่มีข้อมูล</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const assignForm = reactive({
  evaluator_id: '',
  evaluatee_id: '',
  role: 'กรรมการ'
})
const assignLoading = ref(false)
const assignResponse = ref(null)
const assignError = ref('')

const resultForm = reactive({
  evaluator_id: '',
  evaluatee_id: '',
  total_score: '',
  summary: '',
  status: 'draft'
})
const resultLoading = ref(false)
const resultResponse = ref(null)
const resultError = ref('')

const committeeSummary = ref([])
const summaryLoading = ref(false)
const summaryError = ref('')

const committeeStatus = ref([])
const committeeStatusLoading = ref(false)
const committeeStatusError = ref('')

const evaluateeStatus = ref([])
const evaluateeStatusLoading = ref(false)
const evaluateeStatusError = ref('')

const reportData = ref([])
const reportLoading = ref(false)
const reportError = ref('')

const parseNumber = (value) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const submitAssignment = async () => {
  assignLoading.value = true
  assignResponse.value = null
  assignError.value = ''
  try {
    const payload = {
      evaluator_id: parseNumber(assignForm.evaluator_id),
      evaluatee_id: parseNumber(assignForm.evaluatee_id),
      role: assignForm.role
    }
    assignResponse.value = await $fetch('/api/evaluation/assign', {
      method: 'POST',
      body: payload,
      credentials: 'include'
    })
    await loadSummary()
    await loadCommitteeStatus()
  } catch (error) {
    assignError.value = error?.data?.message || error.message || 'บันทึกไม่สำเร็จ'
  } finally {
    assignLoading.value = false
  }
}

const submitResult = async () => {
  resultLoading.value = true
  resultResponse.value = null
  resultError.value = ''
  try {
    const payload = {
      evaluator_id: parseNumber(resultForm.evaluator_id),
      evaluatee_id: parseNumber(resultForm.evaluatee_id),
      total_score: resultForm.total_score === '' ? null : Number(resultForm.total_score),
      summary: resultForm.summary,
      status: resultForm.status
    }
    resultResponse.value = await $fetch('/api/evaluation/result', {
      method: 'POST',
      body: payload,
      credentials: 'include'
    })
    await Promise.all([loadSummary(), loadCommitteeStatus(), loadEvaluateeStatus(), loadReport()])
  } catch (error) {
    resultError.value = error?.data?.message || error.message || 'บันทึกไม่สำเร็จ'
  } finally {
    resultLoading.value = false
  }
}

const loadSummary = async () => {
  summaryLoading.value = true
  summaryError.value = ''
  try {
    const res = await $fetch('/api/evaluation/committee-summary', { credentials: 'include' })
    committeeSummary.value = res?.data || []
  } catch (error) {
    summaryError.value = error?.data?.message || error.message || 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    summaryLoading.value = false
  }
}

const loadCommitteeStatus = async () => {
  committeeStatusLoading.value = true
  committeeStatusError.value = ''
  try {
    const res = await $fetch('/api/evaluation/committee-status', { credentials: 'include' })
    committeeStatus.value = res?.data || []
  } catch (error) {
    committeeStatusError.value = error?.data?.message || error.message || 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    committeeStatusLoading.value = false
  }
}

const loadEvaluateeStatus = async () => {
  evaluateeStatusLoading.value = true
  evaluateeStatusError.value = ''
  try {
    const res = await $fetch('/api/evaluation/evaluatee-status', { credentials: 'include' })
    evaluateeStatus.value = res?.data || []
  } catch (error) {
    evaluateeStatusError.value = error?.data?.message || error.message || 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    evaluateeStatusLoading.value = false
  }
}

const loadReport = async () => {
  reportLoading.value = true
  reportError.value = ''
  try {
    const res = await $fetch('/api/evaluation/report', { credentials: 'include' })
    reportData.value = res?.data || []
  } catch (error) {
    reportError.value = error?.data?.message || error.message || 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    reportLoading.value = false
  }
}

const refreshAll = async () => {
  await Promise.all([loadSummary(), loadCommitteeStatus(), loadEvaluateeStatus(), loadReport()])
}

onMounted(refreshAll)
</script>

