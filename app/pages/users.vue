<template>
  <div class="max-w-4xl mx-auto py-10 px-4 space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">เพิ่มผู้ใช้งาน</h1>
      <button
        class="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 text-sm"
        @click="resetForm"
      >
        ล้างฟอร์ม
      </button>
    </div>

    <section class="bg-white shadow rounded p-6 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="text-sm space-y-1">
          <span>ชื่อ</span>
          <input v-model="form.firstname" type="text" class="w-full border rounded px-3 py-2" />
        </label>
        <label class="text-sm space-y-1">
          <span>นามสกุล</span>
          <input v-model="form.lastname" type="text" class="w-full border rounded px-3 py-2" />
        </label>
        <label class="text-sm space-y-1">
          <span>อีเมล</span>
          <input v-model="form.email" type="email" class="w-full border rounded px-3 py-2" />
        </label>
        <label class="text-sm space-y-1">
          <span>รหัสผ่าน</span>
          <input v-model="form.password" type="text" class="w-full border rounded px-3 py-2" />
        </label>
        <label class="text-sm space-y-1">
          <span>แผนก</span>
          <select v-model="form.department" class="w-full border rounded px-3 py-2">
            <option disabled value="">เลือกแผนก</option>
            <option v-for="dep in departments" :key="dep" :value="dep">
              {{ dep }}
            </option>
          </select>
        </label>
        <label class="text-sm space-y-1">
          <span>บทบาท</span>
          <select v-model="form.role" class="w-full border rounded px-3 py-2">
            <option disabled value="">เลือกบทบาท</option>
            <option v-for="role in roles" :key="role" :value="role">
              {{ role }}
            </option>
          </select>
        </label>
        <label class="text-sm space-y-1">
          <span>สถานะ</span>
          <select v-model="form.status" class="w-full border rounded px-3 py-2">
            <option disabled value="">เลือกสถานะ</option>
            <option v-for="status in statuses" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
        </label>
      </div>

      <div class="flex gap-3 items-center">
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          :disabled="loading"
          @click="submit"
        >
          {{ loading ? 'กำลังบันทึก...' : 'เพิ่มผู้ใช้' }}
        </button>
        <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
        <p v-if="successMsg" class="text-sm text-green-600">{{ successMsg }}</p>
      </div>
    </section>

    <section class="bg-white shadow rounded p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">ผลลัพธ์ล่าสุด</h2>
        <button class="text-sm text-blue-600" @click="fetchUsers">โหลดรายการผู้ใช้</button>
      </div>

      <p v-if="listLoading" class="text-sm text-gray-500">กำลังโหลด...</p>
      <p v-else-if="listError" class="text-sm text-red-600">{{ listError }}</p>

      <table v-else class="w-full text-sm">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="p-2">ชื่อ</th>
            <th class="p-2">อีเมล</th>
            <th class="p-2">แผนก</th>
            <th class="p-2">บทบาท</th>
            <th class="p-2">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="border-b">
            <td class="p-2">{{ user.firstname }} {{ user.lastname }}</td>
            <td class="p-2">{{ user.email }}</td>
            <td class="p-2">{{ user.department }}</td>
            <td class="p-2">{{ user.role }}</td>
            <td class="p-2">{{ user.status }}</td>
          </tr>
          <tr v-if="!users.length">
            <td colspan="5" class="text-center text-gray-500 p-3">ยังไม่มีข้อมูล</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const departments = ['เทคโนโลยีสารสนเทศ', 'โยธา', 'ไฟฟ้ากำลัง']
const roles = ['ผู้ดูแล', 'ผู้ประเมิน', 'ผู้ถูกประเมิน']
const statuses = ['active', 'disabled']

const form = reactive({
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  department: '',
  role: '',
  status: 'active'
})

const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const users = ref([])
const listLoading = ref(false)
const listError = ref('')

const resetForm = () => {
  form.firstname = ''
  form.lastname = ''
  form.email = ''
  form.password = ''
  form.department = ''
  form.role = ''
  form.status = 'active'
  successMsg.value = ''
  errorMsg.value = ''
}

const submit = async () => {
  loading.value = true
  successMsg.value = ''
  errorMsg.value = ''
  try {
    const payload = { ...form }
    const res = await $fetch('/api/user', {
      method: 'POST',
      credentials: 'include',
      body: payload
    })
    if (res?.status !== 'success') {
      throw new Error(res?.message || 'บันทึกไม่สำเร็จ')
    }
    successMsg.value = 'เพิ่มผู้ใช้สำเร็จ'
    await fetchUsers()
    resetForm()
  } catch (error) {
    errorMsg.value = error?.data?.message || error.message || 'เกิดข้อผิดพลาด'
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  listLoading.value = true
  listError.value = ''
  try {
    const res = await $fetch('/api/users', {
      credentials: 'include'
    })
    users.value = res?.data || []
  } catch (error) {
    listError.value = error?.data?.message || error.message || 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    listLoading.value = false
  }
}

onMounted(fetchUsers)
</script>

