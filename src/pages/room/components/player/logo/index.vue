<template>
    <div class="logo" :style="{ display: display }">
        <div class="bg dragon" :class="animateClassName" />
        <p class="text-white" :class="titleColorClass" style="background-color: #46982f; border-radius: 10px; padding: 10px;">
            <span>{{ title }}</span>
            <span v-show="subtitle">
                <br />
                <span>{{ subtitle }}</span>
            </span>
        </p>
    </div>
</template>

<script>
    import { computed, reactive, toRefs, watch } from 'vue'

    export default {
        props: {
            status: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: ''
            },
            subtitle: {
                type: String,
                default: ''
            },
            color: {
                type: String,
                default: 'green'
            },
        },
        setup(props) {
            const state = reactive({
                animateClassName: 'r1',
                display: 'none',
                logoTimeout: null
            });

            // 颜色样式
            const titleColorClass = computed(() => {
                return {
                    'bg-green-600': props.color == 'green',
                    'bg-red-600': props.color == 'red',
                    'shadow-2xl': true
                }
            })

            // 显示
            const show = () => {
                animate('show')
            }

            // 隐藏
            const hidden = () => {
                animate('hidden')
            }

            const animate = async (type) => {
                clearTimeout(state.logoTimeout)
                state.animateClassName = 'r1'
                state.display = 'none'

                if (type === 'hidden') {
                    state.display = 'none'
                    return
                }

                let m = 'r' // 方向
                let count = 0

                const sleep = delay => {
                    return new Promise((reslove) => {
                        state.logoTimeout = setTimeout(reslove, delay)
                    })
                }

                const isShow = (func, value) => {
                    state.display = value ? 'block' : 'none'
                    func && func()
                }

                const eyes = (func, delay1, delay2) => {
                    // 龙在眨眼睛
                    return new Promise(async resolve => {
                        await sleep(delay1)
                        state.animateClassName = m + 2
                        await sleep(delay2)
                        state.animateClassName = m + 1
                        func && func()
                        return resolve()
                    })
                }

                const run = async func => {
                    // 开始跑步
                    await sleep(100)
                    state.animateClassName = m + 4
                    await sleep(100)
                    state.animateClassName = m + 3;
                    count++
                    if (count === 10 || count === 20 || count === 30) {
                        m = m === 'r' ? 'l' : 'r'
                    }
                    if (count < 40) {
                        run(func)
                        return
                    }
                    state.animateClassName = m + 1
                    await sleep(4000)
                    func && func()
                }

                const dra = async () => {
                    count = 0
                    await eyes(null, 1000, 1500)
                    await eyes(null, 150, 150)
                    await eyes(() => {
                        state.animateClassName = m + 2
                        run(dra)
                    }, 150, 150)
                }

                isShow(null, false)
                await sleep(150)
                isShow(null, true)
                await sleep(150)
                isShow(null, false)
                await sleep(150)
                isShow(dra, true)
            }

            // 显示动画
            watch(() => props.status, (newValue) => {
                if (newValue) {
                    show()
                } else {
                    hidden()
                }
            }, {
                immediate: true
            })

            return {
                ...toRefs(state),
                titleColorClass
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "./index.less";
</style>
