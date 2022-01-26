<template>
    <div class="bg pause" :class="{'c': showPause}" />
</template>

<script>
    import { reactive, toRefs, watch } from 'vue';

    export default {
        props: {
            status: {
                type: Boolean,
                default: true
            },
            username: {
                type: String,
                default: '',
            },
        },
        setup(props) {
            const state = reactive({
                showPause: false,
                pauseTimeout: null
            })

            const setShake = (bool) => {
                if (bool && !state.pauseTimeout) {
                    state.pauseTimeout = setInterval(() => {
                        state.showPause = !state.showPause
                    }, 250)
                }
                if (!bool && state.pauseTimeout) {
                    clearInterval(state.pauseTimeout)
                    state.showPause = false
                    state.pauseTimeout = null
                }
            }

            watch(() => props, (newValue) => {
                if (newValue.username) {
                    setShake(newValue.status)
                } else {
                    setShake(false)
                }
            }, {
                deep: true,
                immediate: true
            })

            return {
                ...toRefs(state)
            }
        }
    }
</script>

<style lang="less">
    @import "./index.less";
</style>