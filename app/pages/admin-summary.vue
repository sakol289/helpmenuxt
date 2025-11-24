<template>
  <div class="max-w-6xl mx-auto py-10 px-4 space-y-8">
    <header class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <p class="text-sm text-gray-500">หน้าผู้ดูแล</p>
        <h1 class="text-2xl font-semibold">สรุปผลการประเมิน</h1>
      </div>
      <button
        class="px-3 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm"
        @click="loadSummary"
      >
        โหลดข้อมูลล่าสุด
      </button>
    </header>

    <section class="bg-white shadow rounded-lg divide-y">
      <div v-if="loading" class="p-6 text-gray-500 text-sm">กำลังโหลด...</div>
      <div v-else-if="error" class="p-6 text-red-600 text-sm">{{ error }}</div>
      <template v-else>
        <div
          v-for="item in summary"
          :key="item.evaluatee_id"
          class="p-6 space-y-4"
        >
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p class="text-sm text-gray-500">ผู้ถูกประเมิน</p>
              <p class="text-lg font-semibold">
                {{ item.firstname }} {{ item.lastname }}
              </p>
              <p class="text-sm text-gray-500">แผนก: {{ item.department }}</p>
            </div>
            <div class="text-sm text-gray-500 text-right">
              รวมคะแนนถ่วงน้ำหนักเฉลี่ย:
              <span class="text-lg font-semibold text-indigo-600">
                {{ formatPercent(item.average_percent) }}
              </span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-100 text-left">
                <tr>
                  <th class="p-2">กรรมการ</th>
                  <th class="p-2">คะแนนที่กรอก</th>
                  <th class="p-2">คะแนนถ่วงน้ำหนัก</th>
                  <th class="p-2">% จาก 100</th>
                  <th class="p-2">สถานะ</th>
                  <th class="p-2">สรุปผล</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="eva in item.evaluators" :key="eva.evaluator_id">
                  <tr class="border-b">
                    <td class="p-2">
                      {{ eva.firstname }} {{ eva.lastname }}
                    </td>
                    <td class="p-2">{{ eva.total_score ?? '-' }}</td>
                    <td class="p-2">
                      {{ eva.weighted_points != null ? eva.weighted_points.toFixed(2) : '-' }}
                    </td>
                    <td class="p-2">
                      {{ formatPercent(eva.weighted_percent) }}
                    </td>
                    <td class="p-2">
                      <span
                        class="px-2 py-1 rounded text-xs"
                        :class="
                          eva.status === 'final'
                            ? 'bg-green-100 text-green-700'
                            : eva.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-600'
                        "
                      >
                        {{ eva.status || '-' }}
                      </span>
                    </td>
                    <td class="p-2">{{ eva.summary || '-' }}</td>
                  </tr>
                  <tr class="bg-gray-50 border-b">
                    <td colspan="6" class="p-3">
                      <div class="overflow-x-auto">
                        <table class="w-full text-xs">
                          <thead>
                            <tr>
                              <th class="p-2">รหัส</th>
                              <th class="p-2">หัวข้อ</th>
                              <th class="p-2">น้ำหนัก</th>
                              <th class="p-2">ค่า</th>
                              <th class="p-2">คะแนนที่ได้</th>
                              <th class="p-2">% ในหัวข้อนี้</th>
                              <th class="p-2">สถานะ</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="cat in eva.categories"
                              :key="cat.id"
                              class="border-b last:border-0"
                            >
                              <td class="p-2">{{ cat.code }}</td>
                              <td class="p-2">{{ cat.name }}</td>
                              <td class="p-2">{{ cat.weight }}</td>
                              <td class="p-2">{{ cat.value ?? '-' }}</td>
                              <td class="p-2">
                                {{ cat.weighted_points != null ? cat.weighted_points.toFixed(2) : '-' }}
                              </td>
                              <td class="p-2">
                                {{ formatPercent(cat.percent) }}
                              </td>
                              <td class="p-2">
                                <span
                                  class="px-2 py-0.5 rounded text-[11px]"
                                  :class="
                                    cat.status === 'final'
                                      ? 'bg-green-100 text-green-700'
                                      : cat.status === 'draft'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-gray-100 text-gray-600'
                                  "
                                >
                                  {{ cat.status || '-' }}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                </template>
                <tr v-if="!item.evaluators.length">
                  <td colspan="6" class="text-center p-3 text-gray-500">
                    ยังไม่เคยถูกประเมิน
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p v-if="!summary.length" class="p-6 text-center text-gray-500">
          ยังไม่มีผลการประเมิน
        </p>
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const summary = ref([])
const loading = ref(false)
const error = ref('')

const loadSummary = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await $fetch('/api/evaluation/admin-summary', {
      credentials: 'include'
    })
    summary.value = res?.data || []
  } catch (err) {
    error.value = err?.data?.message || 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

const formatPercent = (value) => {
  if (value === null || value === undefined) return '-'
  return `${value.toFixed(2)}%`
}

onMounted(loadSummary)
</script>

