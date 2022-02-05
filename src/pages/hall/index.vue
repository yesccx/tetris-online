<template>
    <div class="page-hall flex justify-center content-between flex-wrap bg-gray-100 h-screen">
        <div class="p-3 m-2 pt-1 w-full">
            <!-- 统计信息 -->
            <Statistics :online-count="onlineCount" />

            <!-- 房间列表 -->
            <RoomList />
        </div>

        <!-- 操作栏 -->
        <ActionBar />
    </div>
</template>

<script>
    import { defineComponent, onMounted, onUnmounted, reactive, toRefs } from 'vue'

    import Statistics from './components/statistics.vue';
    import ActionBar from './components/action-bar.vue';
    import RoomList from './components/room-list.vue';

    import { wsClient as $wsClient } from '@/utils/websocket'
    import { Dialog, Toast } from 'vant';
    import { loading, unloading } from '@/utils/common';
    import { useRouter } from 'vue-router';

    export default defineComponent({
        name: 'page-hall',
        components: {
            Statistics,
            ActionBar,
            RoomList,
        },
        setup() {
            const $router = useRouter()
            const state = reactive({
                // 在线人数
                onlineCount: 0
            })

            onMounted(() => {
                socketListen('on');

                flushOnlineCount();

                checkLastRoom()
            });

            onUnmounted(() => {
                socketListen('off')
            })

            // 检测上一个房间
            const checkLastRoom = () => {
                loading()
                $wsClient.socket('/game').emit('room-info', (data) => {
                    unloading()
                    if (data.success && data.data.status == 1) {
                        const roomNumber = data.data.number
                        Dialog.confirm({
                            title: '提醒',
                            message: '上次游戏还没结束，是否返回房间？',
                        }).then(() => {
                            unloading()

                            // 加入房间
                            $wsClient.socket('/game').emit('join-last-room', (data) => {
                                if (!data['success']) {
                                    return setTimeout(() => {
                                        Toast.fail(data['message'] || '未知错误')
                                    }, 0);
                                }

                                // 前往房间
                                $router.push({ name: 'room', params: { number: roomNumber } })
                            });
                        })
                    }
                })
            }

            // socket监听
            const socketListen = (type = 'on') => {
                // 在线人数更新
                $wsClient.socket('/game')[type]('online-update', type == 'off' ? undefined : (data) => {
                    state.onlineCount = data
                })
            }

            // 刷新在线人数
            const flushOnlineCount = () => {
                $wsClient.socket('/game').emit('get-online-count', (data) => {
                    state.onlineCount = data.data.count;
                });
            }

            return {
                ...toRefs(state),
            };
        },
    })
</script>