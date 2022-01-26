<template>
    <div class="page-room" v-show="inited">
        <!-- 对战玩家 -->
        <div class="flex justify-center">
            <FightPlayer v-for="player in fightPlayers" :key="player.username" :info="player" :style="fightPlayerCss"
                style="margin:20px;" />
        </div>

        <!-- 玩家 -->
        <div class="flex justify-center">
            <Player :style="playerCss" style="margin:20px;" controller />
        </div>
    </div>

    <!-- 设置面板 -->
    <MenuPopup v-model:show="menuShow" />
</template>

<script>
    import { defineComponent, reactive, onMounted, computed, onUnmounted, toRefs, watch } from 'vue'
    import { useStore } from 'vuex'
    import { useRoute, useRouter } from 'vue-router'

    import Player from './components/player/index.vue'
    import FightPlayer from './components/fight-player/index.vue'
    import MenuPopup from './components/menu-popup/index.vue'
    import { Toast, Dialog } from 'vant'

    import states from '@/control/states'
    import { wsClient as $wsClient } from '@/utils/websocket'
    import { loading, unloading } from '@/utils/common'

    export default defineComponent({
        name: 'page-room',
        components: {
            Player,
            FightPlayer,
            MenuPopup
        },
        setup() {
            const $store = useStore()
            const $route = useRoute()
            const $router = useRouter()
            const state = reactive({
                playerCss: { zoom: 1 },
                fightPlayerCss: { zoom: 1 },
                menuShow: false,
                inited: false
            })

            // 对战玩家列表
            const fightPlayers = computed(() => {
                console.log($store.getters.fightPlayers)
                return $store.getters.fightPlayers || [];
            })

            // 监听菜单打开
            watch(() => $store.state.keyboard['setting'], (newValue, oldValue) => {
                // 按钮弹起时才触发打开
                if (!newValue) {
                    state.menuShow = true
                }
            })

            onMounted(() => {
                // 窗体大小自适应
                window.addEventListener('resize', adaptiveScreenSize, true)
                adaptiveScreenSize();


                initRoomInfo(() => {
                    state.inited = true
                    // 监听socket事件
                    socketListen();

                    // 初始化刷新成员列表
                    flushMemberList();
                })
            })

            onUnmounted(() => {
                window.removeEventListener('resize', adaptiveScreenSize)

                // autoReportFightData(false);

                socketListen('off')
            })

            // 初始化房间信息
            const initRoomInfo = (initCallback) => {
                const roomNumber = $route?.params?.number || ''
                if (!roomNumber) {
                    return Dialog.alert({ title: '提示', message: '房间不存在或已解散' }).then(() => {
                        window.history.back()
                    })
                }

                // 获取房间信息
                loading()
                $wsClient.socket('/game').emit('room-info', (data) => {
                    unloading()
                    if (!data.success) {
                        return Dialog.alert({ title: '提示', message: data.message }).then(() => {
                            window.history.back()
                        })
                    }

                    const gameRoom = data.data
                    $store.commit('joinGameRoom', gameRoom)

                    initCallback()
                })
            }

            // socket监听
            const socketListen = (type = 'on') => {
                // 用户进入房间
                $wsClient.socket('/game')[type]('join-room', type == 'off' ? undefined : (data) => {
                    Toast(data + ' 进入房间');
                    flushMemberList();
                });

                // 用户离开房间
                $wsClient.socket('/game')[type]('leave-room', type == 'off' ? undefined : (data) => {
                    Toast(data + ' 离开房间');
                    flushMemberList();
                });

                // 用户准备状态更新
                $wsClient.socket('/game')[type]('room-update', type == 'off' ? undefined : (data) => {
                    flushMemberList();
                });

                // 房间关闭
                $wsClient.socket('/game')[type]('room-close', type == 'off' ? undefined : (data) => {
                    socketListen('off')
                    Dialog.alert({
                        title: '提示',
                        message: '房间已解散',
                    }).then(() => {
                        $store.commit('quitGameRoom')
                        $router.push({ name: 'hall' })
                    })
                });

                // 游戏开始
                $wsClient.socket('/game')[type]('game-start', type == 'off' ? undefined : (data) => {
                    $store.commit('setCurrentRoomStatus', 1);
                    $store.commit('setCurrentRoomBlocks', data.blocks);

                    states.start();

                    // 开启自动上报游戏数据(每200毫秒)
                    autoReportFightData(true);
                });
            }

            // 自适应屏幕大小
            const adaptiveScreenSize = () => {
                const clientWidth = document.documentElement.clientWidth;
                const clientHeight = document.documentElement.clientHeight;

                // 对战玩家屏幕 缩放比例(不大小规定的最大比例值)
                const maxScale = clientHeight * .2 / 500;
                const sacle = clientWidth / 1600;
                state.fightPlayerCss.zoom = Math.min(sacle, maxScale);

                // 玩家屏幕 缩放比例
                const maxHeight = clientHeight * .8 - 60;
                state.playerCss.zoom = maxHeight * 0.8 / 800;
            }

            // 定时自动上报对战信息
            let reportInterval = 0;
            const autoReportFightData = (status = false) => {
                clearInterval(reportInterval);

                if (status == true) {
                    reportInterval = setInterval(() => {
                        $wsClient.socket('/game').emit('game-data-report', {
                            cur: JSON.stringify($store.state.cur),
                            block_index: $store.state.roomPlayer.blockIndex,
                            blocks: JSON.parse(JSON.stringify($store.state.matrix))
                        });
                        flushMemberList();
                    }, 100);
                }
            }

            // 刷新成员列表
            const flushMemberList = () => {
                $wsClient.socket('/game').emit('room-member-list', (data) => {
                    if (!data.success) {
                        return false;
                    }

                    $store.commit('setGameRoomMembers', data.data);
                });
            }

            return {
                ...toRefs(state),
                fightPlayers,
            };
        }
    })
</script>

<style lang="less" scoped>
    .page-room {
        width: 100%;
        min-height: 100vh;
        background: rgb(241, 241, 241);
        // background-image: url("@/assets/images/room-bg.svg");
        // background-repeat: initial;
        // background-position: 200%;
        // background-size: 120%;
        padding: 0;
        margin: 0;
        font: 20px/1 "HanHei SC", "PingHei", "PingFang SC", "STHeitiSC-Light",
            "Helvetica Neue", "Helvetica", "Arial", sans-serif;
        overflow: hidden;
        cursor: default;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        -moz-font-feature-settings: "liga", "kern";
        direction: ltr;
        text-align: left;
    }
</style>