<template>
    <div class="page-room" v-show="inited">
        <!-- 对战玩家 -->
        <div class="flex justify-center">
            <FightPlayer v-for="player in fightPlayers" :key="player.username" :info="player" :style="fightPlayerCss"
                style="margin:20px;" :ref="setFightPlayerRefs" />
        </div>

        <!-- 玩家 -->
        <div class="flex justify-center">
            <Player :style="playerCss" style="margin:20px;" controller />
        </div>
    </div>

    <!-- 设置面板 -->
    <MenuPopup v-model:show="menuShow" />

    <!-- 结算面板 -->
    <SettlementPopup v-model:show="settlementShow" :data="settlementData" />
</template>

<script>
    import { defineComponent, reactive, onMounted, computed, onUnmounted, toRefs, watch, nextTick, provide } from 'vue'
    import { useStore } from 'vuex'
    import { useRoute, useRouter } from 'vue-router'

    import Player from './components/player/index.vue'
    import FightPlayer from './components/fight-player/index.vue'
    import MenuPopup from './components/menu-popup/index.vue'
    import SettlementPopup from './components/settlement-popup/index.vue'
    import { Toast, Dialog } from 'vant'

    import states from '@/control/states'
    import { wsClient as $wsClient } from '@/utils/websocket'
    import { loading, unloading } from '@/utils/common'
    import { music } from '@/utils/music'

    import { unzip, zip } from '@/utils/gzip'

    export default defineComponent({
        name: 'page-room',
        components: {
            Player,
            FightPlayer,
            MenuPopup,
            SettlementPopup,
        },
        setup() {
            const $store = useStore()
            const $route = useRoute()
            const $router = useRouter()
            const state = reactive({
                playerCss: { zoom: 1 },
                fightPlayerCss: { zoom: 1 },
                menuShow: false,
                settlementShow: false,
                settlementData: [],
                inited: false,
                fightPlayerRefs: {}
            })

            // 对战玩家列表
            const fightPlayers = computed(() => {
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

                    // 再次加入房间
                    if ($store.state.gameRoom.status == 1) {
                        nextTick(() => {
                            $wsClient.socket('/game').emit('join-last-room', (data) => {
                                if (!data['success']) {
                                    return setTimeout(() => {
                                        Toast.fail(data['message'] || '未知错误')
                                    }, 0);
                                }
                            });

                            if (!$store.state.gameRoom.pause) {
                                music.bgmusic && music.bgmusic.play()
                                autoReportFightData(true)
                                states.pause(false)
                            }
                        })
                    }
                })
            })

            onUnmounted(() => {
                window.removeEventListener('resize', adaptiveScreenSize)

                autoReportFightData(false);

                socketListen('off')

                $store.state.reset = false
                $store.state.drop = false
                $store.state.lock = false
                music.bgmusic && music.bgmusic.stop()

                if ($store.state.gameRoom.status == 0) {
                    $wsClient.socket('/game').emit('leave-room', () => {
                        $store.commit('quitGameRoom')
                    })
                } else {
                    $wsClient.socket('/game').emit('player-offline', () => {
                        $store.commit('quitGameRoom')
                    })
                }
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

                    initCallback && initCallback()
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

                // 用户离线
                $wsClient.socket('/game')[type]('player-offline', type == 'off' ? undefined : (data) => {
                    Toast(data + ' 已离线');
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
                        ...(state.settlementShow ? { zIndex: 1000 } : {}),
                    }).then(() => {
                        $store.commit('quitGameRoom')
                        $router.push({ name: 'hall' })
                    })
                });

                // 游戏设置更新
                $wsClient.socket('/game')[type]('game-settings', type == 'off' ? undefined : (data) => {
                    $store.commit('setGameRoomSettings', data)
                });

                // 游戏开始
                $wsClient.socket('/game')[type]('game-start', type == 'off' ? undefined : (data) => {
                    music.start.play()
                    $store.commit('setGameRoomStatus', 1);
                    $store.commit('setGameRoomBlocks', data.blocks);
                    Toast({ message: 'Ready!!!', overlay: true })
                    setTimeout(() => {
                        Toast({ message: 'Go!!!', duration: 300 })

                        $store.commit('lock', false)
                        $store.commit('reset', false)
                        music.bgmusic && music.bgmusic.play()
                        states.start();

                        // 开启自动上报游戏数据(每200毫秒)
                        autoReportFightData(true);
                    }, 1200)
                });

                // 游戏暂停
                $wsClient.socket('/game')[type]('game-pause', type == 'off' ? undefined : (data) => {
                    music.pause && music.pause.play()
                    music.bgmusic && music.bgmusic.pause()
                    autoReportFightData(false)
                    states.pause(true)
                });

                // 游戏恢复
                $wsClient.socket('/game')[type]('game-unpause', type == 'off' ? undefined : (data) => {
                    music.pause && music.pause.play()
                    music.bgmusic && music.bgmusic.play()
                    autoReportFightData(true)
                    states.pause(false)
                });

                // 消除音效
                $wsClient.socket('/game')[type]('game-block-clear', type == 'off' ? undefined : (data) => {
                    const currentClearLines = data.lines
                    const username = data.username
                    const $el = state.fightPlayerRefs[username] || null
                    if ($el) {
                        $el.clearPlay(currentClearLines)
                    }

                    if (currentClearLines == 1) {
                        music.clear1 && music.clear1.play()
                    } else if (currentClearLines == 2) {
                        music.clear2 && music.clear2.play()
                    } else if (currentClearLines == 3) {
                        music.clear3 && music.clear3.play()
                    } else if (currentClearLines == 4) {
                        music.clear4 && music.clear4.play()
                    }
                });

                // 游戏结束
                $wsClient.socket('/game')[type]('game-over', type == 'off' ? undefined : (data) => {
                    // 标记游戏结束
                    $store.commit('setGameOver')

                    // 播放音乐
                    music.bgmusic && music.bgmusic.stop()
                    music.win && music.win.play()

                    // 停止上报
                    autoReportFightData(false)

                    // 显示结算面板
                    state.settlementData = data
                    state.settlementShow = true
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
                const playerData = $store.state.playerData;
                clearInterval(reportInterval);
                reportInterval = null

                if (status == true) {
                    reportInterval = setInterval(() => {
                        $wsClient.socket('/game').emit('game-data-report', zip([
                            playerData.points,
                            playerData.isOwner ? 1 : 0,
                            playerData.isReady ? 1 : 0,
                            playerData.isOver ? 1 : 0,
                            playerData.blockIndex,
                            JSON.stringify(playerData.cur),
                            playerData.speedRun,
                            playerData.clearLines,
                            JSON.stringify(playerData.matrix),
                            playerData.dischargeBuffers,
                            playerData.fillBuffers,
                        ]));
                        flushMemberList();
                    }, 60);
                }
            }

            // 刷新成员列表
            const flushMemberList = (callback) => {
                $wsClient.socket('/game').emit('room-member-list', (rawData) => {
                    const data = unzip(rawData)
                    if (!data.success) {
                        return false;
                    }

                    $store.commit('setGameRoomMembers', data.data);
                    callback && callback()
                });
            }

            const setFightPlayerRefs = (el) => {
                if (el) {
                    state.fightPlayerRefs[el.info.username] = el
                }
            }

            // 重回游戏
            provide('returnToGame', () => {
                initRoomInfo(() => {
                    state.inited = true

                    // 初始化刷新成员列表
                    flushMemberList()
                })
            })

            return {
                ...toRefs(state),
                fightPlayers,
                setFightPlayerRefs
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