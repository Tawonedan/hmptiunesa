// Design system tokens & utility classes — replaces the legacy Vue starter
// main.css / base.css. Phase 5 will fully retire the old assets directory.
import './assets/pillars.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
