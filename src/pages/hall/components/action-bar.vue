<template>
    <div class="action-bar">
        <button class="create" type="button" @click="onCreateRoom">
            创建房间
        </button>
        <button class="logout" type="button" @click="onLogout">
            退出登录
        </button>
    </div>
</template>

<script>
    import { defineComponent, reactive, watch } from 'vue'
    import { useStore } from 'vuex';
    import { useRouter } from 'vue-router';

    import { Toast } from 'vant';
    import { loading, unloading } from '@/utils/common';

    import { wsClient as $wsClient } from '@/utils/websocket'

    export default defineComponent({
        setup() {
            const $store = useStore()
            const $router = useRouter()

            const state = reactive({
                // 加载状态
                createRoomLoading: false,
            })

            watch(() => state.createRoomLoading, (value) => {
                if (value) {
                    loading()
                } else {
                    unloading()
                }
            })

            // 事件: 创建房间
            const onCreateRoom = () => {
                if (state.createRoomLoading == true) {
                    return false;
                }

                state.createRoomLoading = true;
                $wsClient.socket('/game').emit('create-room', (data) => {
                    state.createRoomLoading = false;
                    if (!data['success']) {
                        return Toast.fail(data['message'] || '未知错误');
                    }

                    // 前往房间
                    $router.push({ name: 'room', params: { number: data.data.number } })
                });
            }

            // 事件: 退出登录
            const onLogout = () => {
                $wsClient.socket('/user').emit('logout', (data) => {
                    if (!data['success']) {
                        return Toast.fail(data['message'] || '退出登录失败');
                    }

                    $store.commit('setSessionUsername', '');
                    $router.push({ name: 'login' })
                });
            }

            return {
                onCreateRoom,
                onLogout
            }
        },
    })
</script>

<style lang="less" scoped>
    .action-bar {
        @apply fixed bottom-0 mt-4 p-4 bg-gray-100 inline-flex justify-between flex-1;
        width: 100%;

        .create {
            @apply flex-1 mr-3 flex-shrink-0 bg-indigo-600 text-white text-sm py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-indigo-200 font-bold;
        }

        .logout {
            @apply flex-shrink-0 bg-red-600 text-white text-sm py-2 px-4 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-red-200 font-bold;
        }
    }
</style>
