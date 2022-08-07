import '@/electron/renderer'
import '@/modules/electron-debug/renderer'
import '@/styles'
import { createApp } from 'vue'
import { VueQueryPlugin, VueQueryPluginOptions } from 'vue-query'

import App from '@/teams/messenger/App.vue'
import router from '@/router'
import store from '@/store'
import ElLoading from 'element-plus/lib/components/loading'
import '@/plugins'

const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  },
}

const app = createApp(App)
  .use(store)
  .use(router)
  .use(VueQueryPlugin, vueQueryPluginOptions)
  .use(ElLoading)
app.mount('#app')
