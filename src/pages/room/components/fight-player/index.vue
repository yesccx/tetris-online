<template>
    <div class="fight-player" :class="{vacancy: isVacancy || info.isOver}">
        <div class="rect">
            <!-- Buffer -->
            <div class="buffer-container">
                <Buffer v-if="info.username" :count="playerSurplusBuffers" />
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
                        <Number :number='info.blockIndex - 1' />

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
            <Username :is-owner="info.isOwner" :username="info.username" />
        </div>

        <p v-if="isVacancy" class="vacancy-tip">空缺</p>
        <p v-show="info.isOver" class="over-tip bg-red-600">已结束</p>
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
            Buffer,
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
            const state = reactive({})

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
                const players = $store.state.gameRoomMembers.filter((player) => player.username != info.username).slice(0, 3);
                const playerBuffers = players.reduce((previousValue, current) => {
                    return previousValue + (current?.clearLines || 0)
                }, 0);

                return playerBuffers - info.dischargeBuffers - info.fillBuffers
            })

            return {
                ...toRefs(state),
                ...toRefs(props),
                nextBlock,
                isVacancy,
                gameRoom,
                gammeSpeed,
                playerSurplusBuffers
            }
        }
    })
</script>

<style lang="less">
    @import "./css/index.less";
</style>
