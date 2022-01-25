<template>
    <div class="keyboard" :style="containerCss">
        <v-button ref="dom_rotate_el" color="blue" size="s1" arrow="translate(0, 63px)" :top="0" :left="374" label="旋转"
            :position="true" :active="keyboard['rotate']" />
        <v-button ref="dom_down_el" color="blue" size="s1" arrow="translate(0,-71px) rotate(180deg)" :top="180"
            :left="374" label="下移" :active="keyboard['down']" />
        <v-button ref="dom_left_el" color="blue" size="s1" arrow="translate(60px, -12px) rotate(270deg)" :top="90"
            :left="284" label="左移" :active="keyboard['left']" />
        <v-button ref="dom_right_el" color="blue" size="s1" arrow="translate(-60px, -12px) rotate(90deg)" :top="90"
            :left="464" label="右移" :active="keyboard['right']" />
        <v-button ref="dom_space_el" color="blue" size="s0" :top="100" :left="52" label="掉落(SPACE)"
            :active="keyboard['drop']" />
        <v-button v-if="playerData.isOwner && !gameStarted" ref="dom_multifunction_el" color="green" size="s2" :top="0"
            :left="40" label="开始" :active="keyboard['multifunction']" />
        <v-button v-if="!playerData.isOwner && !gameStarted" ref="dom_multifunction_el"
            :color="playerData.isReady ? 'red' : 'green'" size="s2" :top="0" :left="40"
            :label="playerData.isReady ? '取消准备' : '准备'" :active="keyboard['multifunction']" />
        <v-button v-if="gameStarted" ref="dom_multifunction_el" :color="isPause ? 'green' : 'red'" size="s2" :top="0"
            :left="40" :label="isPause ? '暂停' : '恢复'" :active="keyboard['multifunction']" />
        <v-button ref="dom_setting_el" color="orange" size="s2" :top="0" :left="130" label="设置"
            :active="keyboard['setting']" />
    </div>
</template>

<script>
    import { defineComponent, ref, onMounted, reactive, toRefs, computed } from 'vue'
    import { useStore } from 'vuex'

    import todo from '@/control/todo'
    import vButton from './button/index.vue'

    export default defineComponent({
        components: {
            vButton
        },
        props: {
            filling: {
                type: Number,
                default: 0
            }
        },
        setup(props) {
            const $store = useStore()
            const state = reactive({})
            const doms = reactive({
                dom_rotate_el: ref(null),
                dom_down_el: ref(null),
                dom_left_el: ref(null),
                dom_right_el: ref(null),
                dom_space_el: ref(null),
                dom_multifunction_el: ref(null),
                dom_setting_el: ref(null)
            })

            // 容器css样式
            const containerCss = computed(() => {
                return {
                    'margin-top': (Number(props.filling) + 20) + 'px'
                }
            })

            // 游戏开始状态
            const gameStarted = computed(() => {
                return $store.state.gameRoom.status == 1
            })

            const isPause = computed(() => $store.state.pause)
            const keyboard = computed(() => $store.state.keyboard)
            const playerData = computed(() => $store.state.playerData)

            onMounted(() => {
                // 对于手机操作, 触发了touchstart, 将作出记录, 不再触发后面的mouse事件
                const touchEventCatch = {}

                // 在鼠标触发mousedown时, 移除元素时可以不触发mouseup, 这里做一个兼容, 以mouseout模拟mouseup
                const mouseDownEventCatch = {}
                document.getElementsByClassName('keyboard')[0].addEventListener(
                    'touchstart',
                    e => {
                        if (e.preventDefault) {
                            e.preventDefault()
                        }
                    },
                    { passive: false }
                )
                document.getElementsByClassName('keyboard')[0].addEventListener('touchend', (e) => {
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                }, { passive: false });

                // 阻止双指放大
                document.addEventListener('gesturestart', (event) => {
                    event.preventDefault();
                }, { passive: false });

                document.addEventListener(
                    'mousedown',
                    e => {
                        if (e.preventDefault) {
                            e.preventDefault()
                        }
                    },
                    true
                )
                Object.keys(todo).forEach(key => {
                    const $el = doms[`dom_${key}_el`].$el

                    $el.addEventListener(
                        'mousedown',
                        () => {
                            if (touchEventCatch[key] === true) {
                                return
                            }

                            todo[key].down($store)
                            mouseDownEventCatch[key] = true
                        },
                        true
                    )
                    $el.addEventListener(
                        'mouseup',
                        () => {
                            if (touchEventCatch[key] === true) {
                                touchEventCatch[key] = false
                                return
                            }
                            todo[key].up($store)
                            mouseDownEventCatch[key] = false
                        },
                        true
                    )
                    $el.addEventListener(
                        'mouseout',
                        () => {
                            if (mouseDownEventCatch[key] === true) {
                                todo[key].up($store)
                            }
                        },
                        true
                    )
                    $el.addEventListener(
                        'touchstart',
                        () => {
                            touchEventCatch[key] = true
                            todo[key].down($store)
                        },
                        true
                    )
                    $el.addEventListener(
                        'touchend',
                        () => {
                            todo[key].up($store)
                        },
                        true
                    )
                })
            })

            return {
                ...toRefs(doms),
                gameStarted,
                containerCss,
                keyboard,
                isPause,
                playerData
            }
        }
    })
</script>

<style lang="less" scoped>
    @import "./index.less";
</style>
