<template>
  <div class="max-w-5xl mx-auto py-10 px-4 space-y-8">
    <header class="space-y-1">
      <p class="text-sm text-gray-500">หน้าผู้ถูกประเมิน</p>
      <h1 class="text-2xl font-semibold">คะแนนที่ได้รับ</h1>
    </header>

    <section class="bg-white shadow rounded-lg">
      <div v-if="loading" class="p-6 text-gray-500 text-sm">กำลังโหลด...</div>
      <div v-else-if="error" class="p-6 text-red-600 text-sm">{{ error }}</div>
      <template v-else>
        <div class="border-b last:border-b-0 p-6 space-y-2" v-if="overallPercent !== null">
          <p class="text-sm text-gray-500">คะแนนเฉลี่ยรวมทุกกรรมการ</p>
          <p class="text-3xl font-semibold text-indigo-600">
            {{ overallPercent.toFixed(2) }}%
          </p>
        </div>
        <div
          v-for="eva in evaluators"
          :key="eva.evaluator_id"
          class="border-b last:border-b-0 p-6 space-y-4"
        >
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p class="text-sm text-gray-500">กรรมการผู้ประเมิน</p>
              <p class="text-lg font-semibold">
                {{ eva.firstname }} {{ eva.lastname }}
              </p>
            </div>
            <div class="text-sm text-gray-500 text-right">
              คะแนนรวม (ถ่วงน้ำหนัก):
              <span class="text-lg font-semibold text-indigo-600">
                {{ eva.weighted_points.toFixed(2) }} / {{ totalWeight }}
                ({{ formatPercent(eva.weighted_percent) }})
              </span>
            </div>
          </div>

          <div class="grid md:grid-cols-3 gap-3 text-sm text-gray-600">
            <div>
              <span class="text-gray-500">คะแนนที่กรอก:</span>
              <span class="font-medium">{{ eva.total_score ?? '-' }}</span>
            </div>
            <div>
              <span class="text-gray-500">สถานะ:</span>
              <span class="px-2 py-1 rounded text-xs" :style="badgeStyle(eva.status)">
                {{ eva.status || '-' }}
              </span>
            </div>
            <div v-if="eva.summary">
              <span class="text-gray-500">สรุปผล:</span>
              <span class="font-medium">{{ eva.summary }}</span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-xs md:text-sm">
              <thead class="bg-gray-100 text-left">
                <tr>
                  <th class="p-2">รหัส</th>
                  <th class="p-2">หัวข้อ</th>
                  <th class="p-2">น้ำหนัก</th>
                  <th class="p-2">ค่า</th>
                  <th class="p-2">คะแนนที่ได้</th>
                  <th class="p-2">% หัวข้อนี้</th>
                  <th class="p-2">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cat in eva.categories" :key="cat.id" class="border-b last:border-0">
                  <td class="p-2">{{ cat.code }}</td>
                  <td class="p-2">{{ cat.name }}</td>
                  <td class="p-2">{{ cat.weight }}</td>
                  <td class="p-2">{{ cat.value ?? '-' }}</td>
                  <td class="p-2">
                    {{ cat.weighted_points != null ? cat.weighted_points.toFixed(2) : '-' }}
                  </td>
                  <td class="p-2">{{ formatPercent(cat.percent) }}</td>
                  <td class="p-2">
                    <span
                      class="px-2 py-0.5 rounded text-[11px]"
                      :style="badgeStyle(cat.status)"
                    >
                      {{ cat.status || '-' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p v-if="!evaluators.length" class="p-6 text-center text-gray-500">
          ยังไม่มีคะแนน
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

const evaluators = ref([])
const totalWeight = ref(100)
const loading = ref(false)
const error = ref('')
const overallPercent = ref(null)

const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await $fetch('/api/evaluation/my-score', {
      credentials: 'include'
    })
    evaluators.value = res?.data?.evaluators || []
    totalWeight.value = res?.data?.total_weight || 100
    const percentList = evaluators.value
      .map((eva) => eva.weighted_percent)
      .filter((val) => val !== null && val !== undefined)
    overallPercent.value =
      percentList.length > 0
        ? percentList.reduce((sum, val) => sum + val, 0) / percentList.length
        : null
  } catch (err) {
    error.value = err?.data?.message || 'โหลดคะแนนไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

const formatPercent = (value) => {
  if (value === null || value === undefined) return '-'
  return `${value.toFixed(2)}%`
}

const badgeStyle = (status) => {
  if (status === 'final') {
    return { background: '#DCFCE7', color: '#166534' }
  }
  if (status === 'draft') {
    return { background: '#FEF9C3', color: '#92400E' }
  }
  return { background: '#E5E7EB', color: '#4B5563' }
}

onMounted(loadData)
</script>

