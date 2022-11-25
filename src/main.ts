import { createApp } from 'vue'
import App from './App.vue'
import mavonEditor from 'mavon-editor'
import { init } from './utils/cache-storage'

const app = createApp(App)
  .use(mavonEditor)
  .use(() => init('123456'))

app.mount('#app')
