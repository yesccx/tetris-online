<template>
    <div class="room-list p-4">
        <div class="room-wrapper" v-for="room in roomList" :key="room.number" @click="onJoinRoom(room.number)">
            <div class="info ">
                <span class="number">#{{ room.format_number }}</span>
                <span class="count">{{ room.current_count }}/{{ room.max_count }}</span>
            </div>
            <span class="title">{{ room.title }}</span>
        </div>

        <div class="text-center">
            <van-empty v-show="roomList.length === 0 && !roomListLoading" description="暂无房间～" />
        </div>

        <van-loading v-show="roomListLoading" color="#1989fa" size="24" vertical>加载中...</van-loading>
    </div>
</template>

<script>
    import { computed, defineComponent, onMounted, onUnmounted, reactive, toRefs, watch } from 'vue'
    import { useStore } from 'vuex'

    import { Loading, Toast, Empty } from 'vant';

    import { wsClient as $wsClient } from '@/utils/websocket'
    import { loading, unloading } from '@/utils/common'

    export default defineComponent({
        components: {
            [Loading.name]: Loading,
            [Empty.name]: Empty
        },
        setup() {
            const $store = useStore()

            const state = reactive({
                // 加载状态
                roomListLoading: false,
                joinRoomLoading: false,

                // 房间列表
                roomList: [],
            })

            // 监听加载状态，做加载动画
            watch(() => state.joinRoomLoading, (value) => {
                if (value) {
                    loading()
                } else {
                    unloading()
                }
            })

            onMounted(() => {
                socketListen('on');

                flushRoomList();
            });

            onUnmounted(() => {
                socketListen('off')
            })

            // socket监听
            const socketListen = (type = 'on') => {
                // 房间列表更新
                $wsClient.socket('/game')[type]('room-list-update', () => {
                    flushRoomList();
                });
            }

            // 刷新房间列表
            const flushRoomList = () => {
                state.roomListLoading = true;
                $wsClient.socket('/game').emit('room-list', (data) => {
                    state.roomListLoading = false;
                    state.roomList = data.data;
                });
            }

            // 事件: 加入房间
            const onJoinRoom = (roomNumber) => {
                if (state.joinRoomLoading) {
                    return true;
                }

                state.joinRoomLoading = true;
                $wsClient.socket('/game').emit('join-room', {
                    number: roomNumber
                }, (data) => {
                    state.joinRoomLoading = false;
                    if (!data['success']) {
                        return Toast.fail(data['message'] || '未知错误');
                    }

                    $store.commit('setCurrentRoom', { number: roomNumber });
                });
            }

            return {
                ...toRefs(state),
                onJoinRoom
            }
        },
    })
</script>



<style lang="less" scoped>
    .room-list {
        @apply space-y-4 bg-white rounded-md;
        overflow-y: auto;
        height: calc(100vh - 100px);

        .room-wrapper {
            @apply w-full block rounded-md text-white font-extrabold text-center bg-blue-500 p-6 divide-y-2 divide-gray-300 divide-solid;

            .info {
                @apply flex justify-between text-gray-100 text-sm;
            }
            .title {
                @apply block truncate w-full  mt-2 pt-2 text-left text-sm;
            }

            &.fire {
                @apply bg-red-600;
            }
        }

        .empty-tip {
            @apply text-center text-gray-300 font-bold text-sm mt-10;
        }
    }
</style>
