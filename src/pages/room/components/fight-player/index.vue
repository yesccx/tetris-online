<template>
    <div class="fight-player" :class="{vacancy: isVacancy}">
        <div class="rect">
            <div class="screen">
                <div class="panel">
                    <!-- 矩阵/主界面 -->
                    <Matrix :username="info.username" :prop-matrix="blocks" :cur="cur" />

                    <!-- 恐龙Logo -->
                    <Logo :userReadyStatus="info.isReady" />

                    <div class="state">
                        <!-- 计分 -->
                        <p>得分</p>
                        <Point :number="info.points" />

                        <!-- 消除行 -->
                        <p>消除行</p>
                        <Number :number='info.clearLines' />

                        <!-- 级别 -->
                        <p>级别</p>
                        <Number :number='cur ? info.speedRun : info.speedStart' :length="1" />

                        <!-- 下一个方块 -->
                        <p>下一个</p>
                        <Next :type="nextBlock" />
                        <div class="bottom">
                            <Pause :username="info.username" :status="gamePause" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- 用户名 -->
            <Username :is-owner="info.isOwner" :username="info.username" />
        </div>

        <p v-show="isVacancy" class="vacancy-tip">空缺</p>
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
        },
        props: {
            info: {
                default() {
                    return new FightPlayerClass
                }
            },
            blocks: {
                type: Array,
                default: []
            },
            blockIndex: {
                default: 0
            },
            cur: {
                default: null
            }
        },
        setup(props) {
            const $store = useStore()
            const state = reactive({})

            const gamePause = computed(() => $store.state.gameRoom.pause)
            const cur = computed(() => $store.state.cur)

            // 下一个方块
            const nextBlock = computed(() => {
                return props.info.nextBlock()
            })

            // 是否为空缺
            const isVacancy = computed(() => {
                return !props.info.username
            })

            return {
                ...toRefs(state),
                ...toRefs(props),
                nextBlock,
                isVacancy,
                gamePause,
                cur
            }
        }
    })
</script>

<style lang="less">
    @import "./css/index.less";
</style>
