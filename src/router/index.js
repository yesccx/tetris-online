import $store from '@/store'
import {
    createRouter,
    createWebHashHistory
} from 'vue-router'
import { set_documment_title } from '@/utils/common'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            name: '/',
            name: '/',
            redirect: { name: 'hall' },
        },
        {
            name: 'login',
            path: '/login',
            meta: {
                title: '登录'
            },
            component: () => import('@/pages/login/index.vue'),
        },
        {
            name: 'hall',
            path: '/hall',
            meta: {
                title: '游戏大厅'
            },
            component: () => import('@/pages/hall/index.vue'),
        },
        {
            name: 'room',
            path: '/room/:number',
            meta: {
                title: '游戏房间'
            },
            component: () => import('@/pages/room/index.vue'),
        }
    ]
})



router.afterEach(async (to, from) => {
    // 设置页面标题
    set_documment_title(to?.meta?.title || '');
})

router.beforeEach((to, from, next) => {
    // 未登录
    if (!$store.state.userSession.username) {
        if (to.name !== 'login') {
            return next({ name: 'login', query: { r: to.fullPath } })
        } else {
            return next()
        }
    }

    if (to.name === 'login') {
        return next({ name: 'hall' })
    } else {
        next()
    }
})

export default router