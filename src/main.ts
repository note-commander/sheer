import { createApp } from 'vue'
import App from './App.vue'
import mavonEditor from 'mavon-editor'

const app = createApp(App).use(mavonEditor)

app.mount('#app')
