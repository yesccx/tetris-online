<template>
    <div class="fight-player" :class="{vacancy: isVacancy || info.isOver}">
        <div class="rect">
            <!-- Buffer -->
            <div class="buffer-container">
                <Buffer v-if="info.username" :count="playerSurplusBuffers" :is-over="info.isOver" />
            </div>

            <div class="screen">
                <div class="panel">
                    <!-- 矩阵/主界面 -->
                    <Matrix :username="info.username" :prop-matrix="info.matrix" :cur="info.cur" />

                    <!-- 恐龙Logo -->
                    <Logo :status="gameRoom.status != 1 && info.isReady" />

                    <div class="state">
                        <!-- 计分 -->
                        <p>得分</p>
                        <Point :number="info.points" />

                        <!-- 下落方块 -->
                        <p>下落方块</p>
                        <Number :number='info.blockIndex > 0  ? (info.blockIndex - 1) : 0' />

                        <!-- 消除行 -->
                        <p>消除行</p>
                        <Number :number='info.clearLines' />

                        <!-- 级别 -->
                        <p>级别</p>
                        <Number :number='gammeSpeed' :length="1" />

                        <!-- 下一个方块 -->
                        <p>下一个</p>
                        <Next :type="nextBlock" />
                        <div class="bottom">
                            <Pause :username="info.username" :status="gameRoom.pause" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- 用户名 -->
            <Username :is-owner="info.isOwner" :username="info.username" :team="info.team" />
        </div>

        <p v-if="isVacancy" class="vacancy-tip">空缺</p>
        <p v-else-if="!info.isOnline" class="over-tip bg-red-500">已离线</p>
        <p v-else-if="info.isOver" class="over-tip bg-yellow-500">已结束</p>

        <!-- 消除提醒 -->
        <transition name="van-slide-down">
            <p class="clear-tip" v-show="clearTip.show">{{ clearTip.message }}</p>
        </transition>
    </div>
</template>

<script>
    import { defineComponent, computed, toRefs, reactive } from 'vue'
    import { useStore } from 'vuex'
    import Logo from './logo/index.vue'
    import Matrix from './matrix/index.vue'
    import Next from './next/index.vue'
    import Number from './number/index.vue'
    import Pause from './pause/index.vue'
    import Username from './username/index.vue'
    import Point from './point/index.vue'
    import Buffer from './buffer/index.vue'

    import FightPlayerClass from './utils/fight-player-class'

    export default defineComponent({
        name: 'fight-player',
        components: {
            Logo,
            Matrix,
            Next,
            Number,
            Pause,
            Username,
            Point,
            Buffer
        },
        props: {
            // 对战玩家信息
            info: {
                default() {
                    return new FightPlayerClass
                }
            }
        },
        setup(props) {
            const $store = useStore()
            const state = reactive({
                clearTip: {
                    show: false,
                    message: '',
                    timeout: null
                }
            })

            // 下一个方块
            const nextBlock = computed(() => props.info.nextBlock())

            // 是否为空缺
            const isVacancy = computed(() => !props.info.username)

            // 游戏房间（暂停状态、初始速度等）
            const gameRoom = computed(() => $store.state.gameRoom)

            // 游戏速度(未开始时，显示初始数度)
            const gammeSpeed = computed(() => props.info.cur ? props.info.speedRun : gameRoom.speedStart)

            // playerSurplusBuffers
            const playerSurplusBuffers = computed(() => {
                const info = props.info
                const players = $store.state.gameRoomMembers.filter((player) => player.team != info.team);
                const playerBuffers = players.reduce((previousValue, current) => {
                    return previousValue + (current?.clearLines || 0) * $store.getters.clearLevel
                }, 0);

                return playerBuffers - info.dischargeBuffers - info.fillBuffers
            })

            // 显示消除行动画
            const clearPlay = (count) => {
                if (state.clearTip.timetout) {
                    clearTimeout(state.clearTip.timetout)
                }

                state.clearTip.message = `消除${count}行`
                state.clearTip.show = true

                state.clearTip.timetout = setTimeout(() => {
                    state.clearTip.show = false
                }, 800)
            }

            return {
                ...toRefs(state),
                ...toRefs(props),
                nextBlock,
                isVacancy,
                gameRoom,
                gammeSpeed,
                playerSurplusBuffers,
                clearPlay
            }
        }
    })
</script>

<style lang="less">
    @import "./css/index.less";
</style>
