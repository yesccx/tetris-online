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
            name: 'login',
            path: '/login',
            meta: {
                title: '登录'
            },
            component: () => import('@/pages/Login/index.vue'),
        },
        {
            name: 'hall',
            path: '/hall',
            meta: {
                title: '游戏大厅'
            },
            component: () => import('@/pages/Hall/index.vue'),
        },
        {
            name: 'room',
            path: '/room',
            meta: {
                title: '游戏房间'
            },
            component: () => import('@/pages/Room/index.vue'),
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
            return next({ name: 'login' })
        } else {
            return next()
        }
    }

    // 已加入房间
    if (!$store.state.gameRoom.number) {
        if (to.name === 'room') {
            return next({ name: 'hall' })
        }
    } else {
        if (to.name !== 'room') {
            return next({ name: 'room' })
        }
    }

    if (to.name === 'login') {
        return next({ name: 'hall' })
    } else {
        next()
    }
})

export default router