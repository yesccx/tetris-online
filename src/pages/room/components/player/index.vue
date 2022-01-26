<template>
    <div class="player">
        <div class="rect" :class="drop?'drop':''">
            <div class="screen">
                <div class="panel">
                    <!-- 矩阵/主界面 -->
                    <Matrix :propMatrix="matrix" :cur="cur" :reset="reset" />

                    <!-- 恐龙Logo -->
                    <Logo />

                    <div class="state">
                        <!-- 计分 -->
                        <p>得分</p>
                        <Point :number="points" />

                        <!-- 消除行 -->
                        <p>消除行</p>
                        <Number :number='cur ? clearLines : startLines' />

                        <!-- 级别 -->
                        <p>级别</p>
                        <Number :number='cur ? speedRun : speedStart' :length="1" />

                        <!-- 下一个方块 -->
                        <p>下一个</p>
                        <Next :type="next" />
                        <div class="bottom">
                            <Pause :status="pause" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Keyboard :filling='filling' :cur="!!cur" />
    </div>
</template>

<script>
    import { defineComponent, onMounted, ref, computed } from 'vue'
    import { useStore } from 'vuex'
    import { transform } from '@/utils/constant'
    import { visibilityChangeEvent, isFocus } from '@/utils'
    import states from '@/control/states'
    import Keyboard from './keyboard/index.vue'
    import Logo from './logo/index.vue'
    import Matrix from './matrix/index.vue'
    import Next from './next/index.vue'
    import Number from './number/index.vue'
    import Pause from './pause/index.vue'
    import Point from './point/index.vue'

    export default defineComponent({
        name: 'player',
        components: {
            Keyboard,
            Logo,
            Matrix,
            Next,
            Number,
            Pause,
            Point
        },
        setup() {
            const store = useStore()
            const size = ref({})
            const w = ref(document.documentElement.clientWidth)
            const h = ref(document.documentElement.clientHeight)
            const filling = ref('')

            const matrix = computed(() => store.state.matrix)
            const keyboard = computed(() => store.state.keyboard)
            const pause = computed(() => store.state.pause)
            const next = computed(() => store.state.next)
            const cur = computed(() => store.state.cur)
            const speedStart = computed(() => store.state.speedStart)
            const speedRun = computed(() => store.state.speedRun)
            const startLines = computed(() => store.state.startLines)
            const clearLines = computed(() => store.state.clearLines)
            const points = computed(() => store.state.points)
            const max = computed(() => store.state.max)
            const reset = computed(() => store.state.reset)
            const drop = computed(() => store.state.drop)

            onMounted(() => {
                window.addEventListener('resize', resize, true)
                render()
            })

            const resize = () => {
                w.value = document.documentElement.clientWidth
                h.value = document.documentElement.clientHeight
                render()
            }

            const render = () => {
                let _filling = 0
                const _size = (() => {

                    const _w = w.value
                    const _h = h.value
                    const ratio = _h / _w
                    let scale
                    let css = {}
                    if (ratio < 1.5) {
                        scale = _h / 960
                    } else {
                        scale = _w / 640
                        _filling = (_h - 960 * scale) / scale / 3
                        css = {
                            'padding-top': Math.floor(_filling) + 42 + 'px',
                            'padding-bottom': Math.floor(_filling) + 'px',
                            'margin-top': Math.floor(-480 - _filling * 1.5) + 'px'
                        }
                    }
                    css[transform] = `scale(${scale})`
                    return css
                })()
                size.value = _size
                filling.value = _filling
                start()
            }

            const start = () => {
                if (visibilityChangeEvent) {
                    // 将页面的焦点变换写入store
                    document.addEventListener(
                        visibilityChangeEvent,
                        () => {
                            states.focus(isFocus())
                        },
                        false
                    )
                }

                // 初始化界面
                states.overStart()
            }


            return {
                filling,
                size,
                w,
                h,
                matrix,
                keyboard,
                pause,
                next,
                cur,
                speedStart,
                speedRun,
                startLines,
                clearLines,
                points,
                max,
                reset,
                drop,
            }
        }
    })
</script>

<style lang="less">
    @import "./css/index.less";
</style>
