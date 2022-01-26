<template>
    <div class="logo" :style="{ display: display }">
        <div class="bg dragon" :class="className" />
        <p class="text-white" :class="storeGameRoomFightReady ? 'bg-green-600' : 'bg-red-600'">
            <span>玩家: {{ storeGameRoom.currentCount }}/{{ storeGameRoom.maxCount }}</span>
            <br />
            <span v-if="!storeGameRoomFightReady">有玩家未准备！</span>
            <span v-else>准备就绪！</span>
        </p>
    </div>
</template>

<script>
    import { computed, reactive, toRefs, watch } from 'vue'
    import { useStore } from 'vuex';

    export default {
        setup(props) {
            const $store = useStore()
            const state = reactive({
                className: 'r1',
                display: 'none',
                logoTimeout: null
            });

            const storePlayerData = computed(() => $store.state.playerData)
            const storeGameRoom = computed(() => $store.state.gameRoom)
            const storeGameRoomFightReady = computed(() => $store.getters.gameRoomFightReady)

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
                state.className = 'r1'
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
                        state.className = m + 2
                        await sleep(delay2)
                        state.className = m + 1
                        func && func()
                        return resolve()
                    })
                }

                const run = async func => {
                    // 开始跑步
                    await sleep(100)
                    state.className = m + 4
                    await sleep(100)
                    state.className = m + 3;
                    count++
                    if (count === 10 || count === 20 || count === 30) {
                        m = m === 'r' ? 'l' : 'r'
                    }
                    if (count < 40) {
                        run(func)
                        return
                    }
                    state.className = m + 1
                    await sleep(4000)
                    func && func()
                }

                const dra = async () => {
                    count = 0
                    await eyes(null, 1000, 1500)
                    await eyes(null, 150, 150)
                    await eyes(() => {
                        state.className = m + 2
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

            // 显示准备动画
            watch(() => $store.state.playerData.isReady, (newValue, oldValue) => {
                if (newValue != oldValue) {
                    if (newValue) {
                        show()
                    } else {
                        hidden()
                    }
                }
            }, {
                immediate: true
            })

            return {
                ...toRefs(state),
                storePlayerData,
                storeGameRoom,
                storeGameRoomFightReady
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "./index.less";
</style>
