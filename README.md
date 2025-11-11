# ทำไมใช้ nuxt
nuxt เป็นส่วนเสริมจาก vue ก็จริงแต่มันจัดการอะไรได้ง่ายกว่าเช่นการทำ เราเตอร์ seo และอื่นๆ



# วิธีติดตั้ง
ให้ติดตั้ง nodejs ก่อน

แล้วใช้คำสั่ง 
```
npm create nuxt@latest
```
มันจะถามว่าจะตั้งชื่อโปรเจคอะไร
กับจะติดตั้งส่วนอื่นๆด้วยตัวไหนให้ใช้ npm


# การใช้งานพื้นฐาน
เป็นคำสั่งไว้รันเขียนโค้ดโหมด dev
```
npm run dev
```

อันนี้ไว้เริ่มใช้งานจริงๆ
```
npm start
```


# พื้นฐาน

## Single File Component
จะมี 3 ส่วนหลักๆคือ
- template
- script
- style

ส่วน template จะเป็นส่วนที่จะสร้างหน้าตาของหน้าเว็บ html
ส่วน script จะเป็นส่วนที่จะสร้างฟังก์ชันหรือการทำงานของหน้าเว็บ javascript
ส่วน style จะเป็นส่วนที่จะสร้างส่วนหน้าตาของหน้าเว็บ css

## โครงสร้างไฟล์พื้นฐาน
![img](images/1.png)

การทำงาน จะเข้าทำงาน app.vue ก่อน แล้วจะส่งค่าไปยังหน้าเว็บที่ต้องการ

## การทำงาน routing
ส่วนการเข้าหน้าที่ต้องการต่างๆหน้าหรือ routing จะอยู่ใน pages หรือ components หรือ layouts หรือ app.vue

ส่วนการศึกษาต่อไปจะต้องศึกษาเกี่ยวกับ routing

### เราเตอร์
เราเตอร์คืออะไร
คือหน้าต่างๆ เช่น หน้า /test /about

แต่จะมีลึกๆอีกหรือการจัดการ parameter หรือการจัดการหน้าต่างๆอื่นๆ
เช่นการดึงไอดีๆต่างๆเช่น
/post/1 /post/2 /post/3

ตัวเลขตัวนี้ถ้าเราไม่ทำเราเตอร์เราต้องสร้างไฟล์ทุกหน้าที่ผู้ใช้งานเข้ามาเลยจะมีการทำงาน parameter

การทำงาน
```
---| posts/
-----| [id].vue

```

[id] คือตัวแปรที่จะดึงค่าจาก url ต่างๆ
เช่น /post/1 จะดึงค่าจาก id ที่เป็น 1
จะเอาไอดีพวกนี้ไปทำงานดึงค่าหรือต่างๆต่อได้


## Vue Template Syntax
หรือเกี่ยวกับตัวแปรต่างๆที่ใช้ใน vue หรือจะคำนวนอะไรต่างๆ เช่น if loop ตัวแปร
### ตัวอย่าง: รวม Template Syntax พื้นฐานทั้งหมดในหน้าเดียว

```
<template>
  <div class="box">

    <!-- 🧠 1. Interpolation ({{ }}) -->
    <p>Hello, {{ name }}!</p>

    <!-- 🧠 2. v-if / v-else-if / v-else -->
    <p v-if="isLoggedIn">✅ You are logged in.</p>
    <p v-else>❌ Please log in.</p>

    <!-- 🧠 3. v-else-if -->
    <p v-else-if="status === 'delivering'">
      🚚 กำลังจัดส่งสินค้า!
    </p>

    <p v-else-if="status === 'delivered'">
      ✅ จัดส่งสำเร็จแล้ว!
    </p>

    <p v-else>
      ❌ ไม่พบสถานะออเดอร์นี้
    </p>


    <!-- 🧠 3. v-show (แค่ซ่อนด้วย CSS ไม่ลบออกจาก DOM) -->
    <p v-show="showMessage">👀 This message can be toggled</p>

    <!-- 🧠 4. v-for (loop ข้อมูลใน list) -->
    <ul>
      <li v-for="(item, index) in fruits" :key="index">
        {{ index + 1 }}. {{ item }}
      </li>
    </ul>

    <!-- 🧠 5. v-bind หรือ : (bind attribute) -->
    <img :src="imageUrl" :alt="imageAlt" width="100" />

    <!-- 🧠 6. v-on หรือ @ (event binding) -->
    <button @click="sayHello">Say Hello</button>

    <!-- 🧠 7. v-model (two-way binding) -->
    <input v-model="message" placeholder="Type something..." />
    <p>You typed: {{ message }}</p>

    <!-- 🧠 8. v-pre (ไม่ให้ Vue ประมวลผล {{ }}) -->
    <p v-pre>{{ this will not be compiled }}</p>

    <!-- 🧠 9. v-once (render ครั้งเดียว) -->
    <p v-once>Render only once: {{ Date.now() }}</p>

  </div>
</template>

<script setup>
import { ref } from 'vue'

// ✅ ข้อมูลแบบ reactive
const name = ref('RJROCK')
const isLoggedIn = ref(true)
const showMessage = ref(true)
const fruits = ref(['Apple', 'Banana', 'Cherry'])
const imageUrl = 'https://via.placeholder.com/100'
const imageAlt = 'Example Image'
const message = ref('')

// ✅ ฟังก์ชัน event
function sayHello() {
  alert(`Hello ${name.value}!`)
}
</script>

<style scoped>
.box {
  font-family: sans-serif;
  padding: 1rem;
  border: 1px solid #ccc;
  width: 300px;
}
button {
  margin-top: 10px;
  background: dodgerblue;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 8px;
}
input {
  display: block;
  margin-top: 10px;
}
</style>
```

## Reactivity การทำงานของตัวแปรต่างๆ
เป็นตัวแปรที่จะทำงานต่างๆได้ เช่นกดปุ่มให้บวกเลขได้เลย โดยหน้าเว็บไม่ต้องรีเฟรชหน้าเว็บอีก
| ฟังก์ชัน     | ใช้ทำอะไร                         | จุดเด่น                         |
| ------------ | --------------------------------- | ------------------------------- |
| `ref()`      | ตัวแปร reactive เดี่ยว            | ใช้ `.value`                    |
| `reactive()` | Object / Array แบบ reactive       | ไม่ต้อง `.value`                |
| `computed()` | สร้างค่าที่คำนวณจาก reactive อื่น | อัปเดตอัตโนมัติ                 |
| `watch()`    | ทำงานเมื่อค่าหนึ่งเปลี่ยน         | เหมาะกับ logic ที่มีผลข้างเคียง |


แต่ละประเภทจะมีการใช้งานต่างๆกัน

### ref()
คือตัวแปรตัวอย่าง
```js
<script setup>
import { ref } from 'vue'

// ref ใช้สร้างตัวแปร reactive (ใช้ .value เข้าถึงค่า)
const count = ref(0)

function increase() {
  count.value++
}
</script>
<template>
  <h2>🔢 Count: {{ count }}</h2>
  <button @click="increase">เพิ่ม</button>
</template>
```

กดปุ่มแล้วบวกค่าแล้วโชว์

reactive()
เป็นตัวแปรตัวอย่างที่เป็น object หรือ array

```js
<script setup>
import { reactive } from 'vue'

// reactive ใช้กับ object/array
const user = reactive({
  name: 'RJROCK',
  age: 20
})

function grow() {
  user.age++
}
</script>

<template>
  <h2>👤 ชื่อ: {{ user.name }}</h2>
  <p>อายุ: {{ user.age }}</p>
  <button @click="grow">โตขึ้น</button>
</template>
```
### computed()
ค่าที่คำนวณอัตโนมัติจากตัวแปร reactive
```js
<script setup>
import { ref, computed } from 'vue'

const price = ref(100)
const quantity = ref(2)

// computed จะอัปเดตอัตโนมัติเมื่อ price หรือ quantity เปลี่ยน
const total = computed(() => price.value * quantity.value)
</script>

<template>
  <h2>🛒 ราคา: {{ price }} × {{ quantity }} = {{ total }}</h2>
</template>
```
### watch()
ทำงานเมื่อค่าหนึ่งเปลี่ยน
```js
<script setup>
import { ref, watch } from 'vue'

const count = ref(0)

watch(count, (newVal, oldVal) => {
  console.log(`count เปลี่ยนจาก ${oldVal} เป็น ${newVal}`)
})
</script>
```

## Component Communication
คือการส่งค่าจากหน้าเว็บหนึ่งไปหน้าเว็บอื่น


aa