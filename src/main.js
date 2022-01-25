import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'


import '@/assets/css/index.css';
import 'vant/lib/index.css';

import './utils/constant';
import './control';
import { subscribeRecord } from './utils';
subscribeRecord(store);

createApp(App)
    .use(store)
    .use(router)
    .mount('#app')
