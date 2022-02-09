<template>
    <div class="player shadow-lg">
        <div class="rect" :class="drop?'drop':''">
            <!-- Buffer -->
            <div class="buffer-container">
                <Buffer :count="playerSurplusBuffers" :is-over="playerData.isOver" :game-status="gameRoom.status" />
            </div>

            <div class="screen">
                <div class="panel">
                    <!-- 矩阵/主界面 -->
                    <Matrix :propMatrix="playerData.matrix" :cur="playerData.cur" :reset="reset" />

                    <!-- 恐龙Logo -->
                    <Logo :status="logoManager.status" :title="logoManager.title" :subtitle="logoManager.subtitle"
                        :color="logoManager.color" />

                    <div class="state">
                        <!-- 计分 -->
                        <p>得分</p>
                        <Point :number="playerData.points" />

                        <!-- 下落方块 -->
                        <p>下落方块</p>
                        <Number :number='playerData.blockIndex > 0  ? (playerData.blockIndex - 1) : 0' />

                        <!-- 消除行 -->
                        <p>消除行</p>
                        <Number :number='playerData.clearLines' />

                        <!-- 级别 -->
                        <p>级别</p>
                        <Number :number='playerData.cur ? playerData.speedRun : gameRoom.speedStart' :length="1" />

                        <!-- 下一个方块 -->
                        <p>下一个</p>
                        <Next :type="nextBlock" />
                        <div class="bottom">
                            <Pause :status="gameRoom.pause" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- 用户名 -->
            <Username :is-owner="playerData.isOwner" :team="playerData.team" />
        </div>

        <Keyboard :filling='filling' :cur="!!playerData.cur" />
    </div>
</template>

<script>
    import { defineComponent, onMounted, computed, reactive, toRefs, onUnmounted } from 'vue'
    import { useStore } from 'vuex'

    import { visibilityChangeEvent, isFocus } from '@/utils'

    import states from '@/control/states'
    import Keyboard from './keyboard/index.vue'
    import Logo from './logo/index.vue'
    import Matrix from './matrix/index.vue'
    import Next from './next/index.vue'
    import Number from './number/index.vue'
    import Pause from './pause/index.vue'
    import Point from './point/index.vue'
    import Buffer from './buffer/index.vue'
    import Username from './username/index.vue'

    import { Progress } from 'vant'

    export default defineComponent({
        name: 'player',
        components: {
            Keyboard,
            Logo,
            Matrix,
            Next,
            Number,
            Pause,
            Point,
            Buffer,
            Username,
            [Progress.name]: Progress
        },
        setup() {
            const $store = useStore()
            const state = reactive({
                w: document.documentElement.clientWidth,
                h: document.documentElement.clientHeight,
                filling: ''
            })

            // 游戏房间
            const gameRoom = computed(() => $store.state.gameRoom)

            // 游戏玩家
            const playerData = computed(() => $store.state.playerData)

            // 下一个方块
            const nextBlock = computed(() => {
                if ($store.state.gameRoom.status == 1) {
                    return $store.state.gameRoom.blocks[$store.state.playerData.blockIndex] || ''
                } else {
                    return ''
                }
            })

            // playerSurplusBuffers
            const playerSurplusBuffers = computed(() => $store.getters.playerSurplusBuffers)

            // logo信息
            const logoManager = computed(() => {
                const data = {
                    status: false,
                    title: '',
                    subtitle: '',
                    color: ''
                }

                if ($store.state.playerData.isOver) {
                    data.subtitle = ''
                    data.color = 'red'
                    data.title = `已结束`
                    data.status = true
                } else if ($store.state.gameRoom.status == 1) {
                    data.status = false
                } else if ($store.state.playerData.isReady) {
                    if ($store.getters.gameRoomFightReady) {
                        data.subtitle = '准备就绪！'
                        data.color = 'green'
                    } else {
                        data.subtitle = '有玩家未准备！'
                        data.color = 'red'
                    }
                    data.title = `玩家: ${$store.state.gameRoom.currentCount} / ${$store.state.gameRoom.maxCount}`
                    data.status = true
                }

                return data
            })

            const reset = computed(() => $store.state.reset)
            const drop = computed(() => $store.state.drop)

            onMounted(() => {
                listen('on')

                // 初始化界面
                adaptiveScreenSize()
                states.overStart()
            })

            onUnmounted(() => {
                listen('off')
            })

            // 监听事件
            const listen = (type = 'on') => {
                if (type == 'on') {
                    window.addEventListener('resize', resizeHandler, true)

                    // 将页面的焦点变换写入store
                    if (visibilityChangeEvent) {
                        document.addEventListener(visibilityChangeEvent, focusHandler, false)
                    }
                } else {
                    window.removeEventListener('resize', resizeHandler)

                    // 将页面的焦点变换写入store
                    if (visibilityChangeEvent) {
                        document.removeEventListener(visibilityChangeEvent, focusHandler)
                    }
                }
            }

            const resizeHandler = () => {
                state.w = document.documentElement.clientWidth
                state.h = document.documentElement.clientHeight
                adaptiveScreenSize()
            }
            const focusHandler = () => {
                states.focus(isFocus())
            }

            // 适配大小
            const adaptiveScreenSize = () => {
                const ratio = state.h / state.w
                let _filling = 0
                let scale = 0
                if (ratio < 1.5) {
                    scale = state.h / 960
                } else {
                    scale = state.w / 640
                    _filling = (state.h - 960 * scale) / scale / 3
                }

                state.filling = _filling
            }

            return {
                ...toRefs(state),
                nextBlock,
                gameRoom,
                playerData,
                logoManager,
                playerSurplusBuffers,
                reset,
                drop,
            }
        }
    })
</script>

<style lang="less">
    @import "./css/index.less";
</style>
