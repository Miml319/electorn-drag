import { createApp } from 'vue'
import 'element-plus/dist/index.css'

import App from './App.vue'
import './samples/node-api'
import ElementPlus from 'element-plus'

const app = createApp(App)

app.use(ElementPlus, { size: 'small', zIndex: 3000 })
createApp(App)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })

app.mount('#app')
