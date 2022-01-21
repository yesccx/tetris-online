<template>
    <div class="login flex items-center h-screen flex-wrap content-center p-5">
        <p class="italic text-center mb-5 font-bold text-2xl w-full text-gray-600">
            <span>俄罗斯方块</span>
            <van-badge content="Beta" :offset="[10, 5]">
                <span> Online</span>
            </van-badge>
        </p>
        <form class="flex w-full space-x-3">
            <input v-model="username"
                class="flex-1 appearance-none border border-transparent w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-md rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="阁下尊姓大名？" @keydown.enter="onLogin">
        </form>

        <div class="mt-2 grid grid-cols-2 w-full gap-2">
            <button
                class="flex-shrink-0 bg-yellow-400 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-purple-200"
                type="button" @click="onPersonal">
                个人磨练
            </button>
            <button
                class="flex-shrink-0 bg-indigo-600 text-white text-sm py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-indigo-200 font-bold"
                type="button" @click="onLogin">
                进入江湖
            </button>
        </div>
    </div>
</template>

<script>
    import { defineComponent, onMounted, reactive, toRaw, toRefs } from 'vue'
    import { useStore } from 'vuex'
    import { useRouter } from 'vue-router'
    import { Toast, Badge } from 'vant'

    import { wsClient as $wsClient } from '@/utils/websocket'
    import { loading } from '@/utils/common'

    export default defineComponent({
        name: 'page-login',
        components: {
            [Badge.name]: Badge
        },
        setup() {
            const $store = useStore()
            const $router = useRouter()

            const state = reactive({
                username: ''
            })

            onMounted(() => {
                // 读取历时用户名
                state.username = localStorage.getInfo()

                autoLogin();
            })

            // 会话存储
            const localStorage = {
                setInfo(info) {
                    window.localStorage.setItem('session.username', info)
                },
                getInfo() {
                    return window.localStorage.getItem('session.username') || ''
                }
            }

            // 自动登录
            const autoLogin = () => {
                const sessionUsername = window.sessionStorage.getItem('session.username') || '';
                if (!sessionUsername) {
                    return true;
                }

                submitLogin(sessionUsername);
            }

            // 提交登录
            const submitLogin = (username) => {
                username = username.trim()
                if (!username || new RegExp(/^[^\s^]+$/).exec(username) === null) {
                    return Toast.fail('用户名不合法')
                }

                loading()
                $wsClient.socket('/user').emit('login', {
                    username
                }, (data) => {
                    if (!data['success']) {
                        return Toast.fail(data['message'])
                    }

                    // 保存历史用户名
                    localStorage.setInfo(username)

                    // 更新会话信息
                    $store.commit('setSessionUsername', username)

                    Toast.success('欢迎回来～')
                    $router.push({ name: 'hall' })
                })
            }


            // 事件: 登录
            const onLogin = () => {
                const username = state.username;
                if (!username) {
                    return Toast.fail('请输入用户名')
                }

                submitLogin(toRaw(username))
            }

            // 事件: 前往个人练习
            const onPersonal = () => {
                window.location.href = 'http://tetris.yes-api.com/personal/index.html'
            }

            return {
                ...toRefs(state),
                onLogin,
                onPersonal
            }
        },
    })
</script>