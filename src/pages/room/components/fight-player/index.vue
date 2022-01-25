<template>
    <div class="fight-player" :class="{vacancy: isVacancy}">
        <div class="rect" :class="drop?'drop':''">
            <div class="screen">
                <div class="panel">
                    <!-- 矩阵/主界面 -->
                    <Matrix :username="info.username" :prop-matrix="blocks" :cur="cur" :reset="reset" />

                    <!-- 恐龙Logo -->
                    <Logo />

                    <div class="state">
                        <!-- 计分 -->
                        <p>得分</p>
                        <Number :number="info.points" />

                        <!-- 消除行 -->
                        <p>消除行</p>
                        <Number :number='info.clearLines' />

                        <!-- 级别 -->
                        <p>级别</p>
                        <Number :number='cur ? info.speedRun : info.speedStart' :length="1" />

                        <!-- 下一个方块 -->
                        <p>下一个</p>
                        <Next :data="nextBlock" />
                        <div class="bottom">
                            <Pause :data="pause" />
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
    import { defineComponent, onMounted, computed, toRefs, reactive, ref, watch } from 'vue'
    import { useStore } from 'vuex'
    import states from '@/control/states'
    import Logo from './logo/index.vue'
    import Matrix from './matrix/index.vue'
    import Next from './next/index.vue'
    import Number from './number/index.vue'
    import Pause from './pause/index.vue'
    import Username from './username/index.vue'

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

            const pause = computed(() => $store.state.pause)
            const cur = computed(() => $store.state.cur)
            const reset = computed(() => $store.state.reset)
            const drop = computed(() => $store.state.drop)

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
                pause,
                nextBlock,
                isVacancy,
                cur,
                reset,
                drop
            }
        }
    })
</script>

<style lang="less">
    @import "./css/index.less";
</style>
