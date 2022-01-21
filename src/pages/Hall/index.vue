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

    import Statistics from './components/Statistics.vue';
    import ActionBar from './components/ActionBar.vue';
    import RoomList from './components/RoomList.vue';

    import { wsClient as $wsClient } from '@/utils/websocket'

    export default defineComponent({
        name: 'page-hall',
        components: {
            Statistics,
            ActionBar,
            RoomList,
        },
        setup() {
            const state = reactive({
                // 在线人数
                onlineCount: 0
            })

            onMounted(() => {
                socketListen('on');

                flushOnlineCount();
            });

            onUnmounted(() => {
                socketListen('off')
            })

            // socket监听
            const socketListen = (type = 'on') => {
                // 在线人数更新
                $wsClient.socket('/game')[type]('online-update', (data) => {
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