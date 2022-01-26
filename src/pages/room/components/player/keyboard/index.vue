<template>
    <div class="keyboard" :style="containerCss">
        <v-button ref="dom_rotate_el" color="blue" :size="useStyleData.rotate.size" arrow="translate(0, 63px)"
            :top="useStyleData.rotate.top" :left="useStyleData.rotate.left" label="旋转" :position="true"
            :active="keyboard['rotate']" />
        <v-button ref="dom_down_el" color="blue" :size="useStyleData.down.size"
            arrow="translate(0,-71px) rotate(180deg)" :top="useStyleData.down.top" :left="useStyleData.down.left"
            label="下移" :active="keyboard['down']" />
        <v-button ref="dom_left_el" color="blue" :size="useStyleData.left.size"
            arrow="translate(60px, -12px) rotate(270deg)" :top="useStyleData.left.top" :left="useStyleData.left.left"
            label="左移" :active="keyboard['left']" />
        <v-button ref="dom_right_el" color="blue" :size="useStyleData.right.size"
            arrow="translate(-60px, -12px) rotate(90deg)" :top="useStyleData.right.top" :left="useStyleData.right.left"
            label="右移" :active="keyboard['right']" />
        <v-button ref="dom_space_el" color="blue" :size="useStyleData.space.size" :top="useStyleData.space.top"
            :left="useStyleData.space.left" label="掉落(SPACE)" :active="keyboard['drop']" />
        <v-button v-if="playerData.isOwner && !gameStarted" ref="dom_multifunction_el" color="green"
            :size="useStyleData.multifunction.size" :top="useStyleData.multifunction.top"
            :left="useStyleData.multifunction.left" label="开始" :active="keyboard['multifunction']" />
        <v-button v-if="!playerData.isOwner && !gameStarted" ref="dom_multifunction_el"
            :color="playerData.isReady ? 'red' : 'green'" :size="useStyleData.multifunction.size"
            :top="useStyleData.multifunction.top" :left="useStyleData.multifunction.left"
            :label="playerData.isReady ? '取消准备' : '准备'" :active="keyboard['multifunction']" />
        <v-button v-if="gameStarted" ref="dom_multifunction_el" :color="isPause ? 'green' : 'red'"
            :size="useStyleData.multifunction.size" :top="useStyleData.multifunction.top"
            :left="useStyleData.multifunction.left" :label="isPause ? '暂停' : '恢复'"
            :active="keyboard['multifunction']" />
        <v-button ref="dom_setting_el" color="orange" :size="useStyleData.setting.size" :top="useStyleData.setting.top"
            :left="useStyleData.setting.left" label="设置" :active="keyboard['setting']" />
    </div>
</template>

<script>
    import { defineComponent, ref, onMounted, reactive, toRefs, computed, onUnmounted, onBeforeUnmount } from 'vue'
    import { useStore } from 'vuex'

    import todo from '@/control/todo'
    import vButton from './button/index.vue'

    import keyboardLayout from './layout';

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

            // 当前使用的风格布局数据
            const useStyleData = computed(() => {
                const useStyle = $store.state.userSetting.layoutStyle
                return (keyboardLayout[useStyle] || keyboardLayout['style1'])?.data
            })

            const isPause = computed(() => $store.state.pause)
            const keyboard = computed(() => $store.state.keyboard)
            const playerData = computed(() => $store.state.playerData)

            // 对于手机操作, 触发了touchstart, 将作出记录, 不再触发后面的mouse事件
            const touchEventCatch = {}
            // 在鼠标触发mousedown时, 移除元素时可以不触发mouseup, 这里做一个兼容, 以mouseout模拟mouseup
            const mouseDownEventCatch = {}
            const eventHandler = {}
            const eventCall = (type, callback) => {
                eventHandler[type] = callback
                return callback
            }

            // 事件监听
            const listen = (type = 'on') => {
                if (type == 'on') {
                    document.getElementsByClassName('keyboard')[0].addEventListener(
                        'touchstart',
                        eventCall('touchstart', e => {
                            if (e.preventDefault) {
                                e.preventDefault()
                            }
                        }),
                        { passive: false }
                    )
                    document.getElementsByClassName('keyboard')[0].addEventListener(
                        'touchend',
                        eventCall('touchend', e => {
                            if (e.preventDefault) {
                                e.preventDefault();
                            }
                        }),
                        { passive: false }
                    )
                    // 阻止双指放大
                    document.addEventListener(
                        'gesturestart',
                        eventCall('gesturestart', e => {
                            if (e.preventDefault) {
                                e.preventDefault();
                            }
                        }),
                        { passive: false }
                    )
                    document.addEventListener(
                        'mousedown',
                        eventCall('mousedown', e => {
                            console.log('点击')
                            if (e.preventDefault) {
                                e.preventDefault();
                            }
                        }),
                        { passive: false }
                    )
                    Object.keys(todo).forEach(key => {
                        const $el = doms[`dom_${key}_el`].$el

                        $el.addEventListener(
                            'mousedown',
                            eventCall(key + 'mousedown', e => {
                                if (touchEventCatch[key] === true) {
                                    return
                                }

                                todo[key].down($store)
                                mouseDownEventCatch[key] = true
                            }),
                            true
                        )
                        $el.addEventListener(
                            'mouseup',
                            eventCall(key + 'mouseup', e => {
                                if (touchEventCatch[key] === true) {
                                    touchEventCatch[key] = false
                                    return
                                }
                                todo[key].up($store)
                                mouseDownEventCatch[key] = false
                            }),
                            true
                        )
                        $el.addEventListener(
                            'mouseout',
                            eventCall(key + 'mouseout', e => {
                                if (mouseDownEventCatch[key] === true) {
                                    todo[key].up($store)
                                }
                            }),
                            true
                        )
                        $el.addEventListener(
                            'touchstart',
                            eventCall(key + 'touchstart', e => {
                                touchEventCatch[key] = true
                                todo[key].down($store)
                            }),
                            true
                        )
                        $el.addEventListener(
                            'touchend',
                            eventCall(key + 'touchend', e => {
                                todo[key].up($store)
                            }),
                            true
                        )
                    })
                } else {
                    document.getElementsByClassName('keyboard')[0].removeEventListener('touchstart', eventHandler['touchstart'])
                    document.getElementsByClassName('keyboard')[0].removeEventListener('touchend', eventHandler['touchend'])
                    // 阻止双指放大
                    document.removeEventListener('gesturestart', eventHandler['gesturestart'])
                    document.removeEventListener('mousedown', eventHandler['mousedown'])

                    Object.keys(todo).forEach(key => {
                        const $el = doms[`dom_${key}_el`].$el
                        $el.removeEventListener('mousedown', eventHandler[key + 'mousedown'])
                        $el.removeEventListener('mouseup', eventHandler[key + 'mouseup'])
                        $el.removeEventListener('mouseout', eventHandler[key + 'mouseout'])
                        $el.removeEventListener('touchstart', eventHandler[key + 'touchstart'])
                        $el.removeEventListener('touchend', eventHandler[key + 'touchend'])
                    })
                }
            }

            onMounted(() => {
                listen('on')
            })

            onBeforeUnmount(() => {
                listen('off')
            })

            return {
                ...toRefs(state),
                ...toRefs(doms),
                gameStarted,
                containerCss,
                useStyleData,
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
