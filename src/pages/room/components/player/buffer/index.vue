<template>
    <div class="buffer">
        <div class="wrapper" :class="{fill: realCount >= 1}"></div>
        <div class="wrapper" :class="{fill: realCount >= 2}"></div>
        <div class="wrapper" :class="{fill: realCount >= 3}"></div>
        <div class="wrapper" :class="{fill: realCount >= 4}"></div>
        <div class="wrapper" :class="{fill: realCount >= 5}"></div>
    </div>
</template>

<script>
    import { music } from '@/utils/music'
    import { defineComponent, reactive, toRefs, watch } from 'vue'

    export default defineComponent({
        props: {
            count: {
                type: Number,
                default: 0
            },
            isOver: {
                type: Boolean,
                default: false
            }
        },
        setup(props) {
            const state = reactive({
                realCount: 0
            })

            watch(() => props.count, (newValue, oldValue) => {
                if (!props.isOver && newValue > oldValue) {
                    music.buffer && music.buffer.play()
                }
            })

            watch(() => props.count, (newValue, oldValue) => {
                if (!props.isOver) {
                    state.realCount = newValue
                }
            }, {
                immediate: true
            })

            return {
                ...toRefs(state)
            }
        },
    })
</script>

<style lang="less" scoped>
    .buffer {
        height: 22px;
        display: flex;

        .wrapper {
            background: #fee94e;
            width: 18%;
            margin-right: 2%;
            border-radius: 8px;
            box-shadow: 0px 3px 6px rgb(0 0 0 / 80%) inset;

            &.fill {
                background: #de4d4d;
                box-shadow: 0px -3px 6px rgb(0 0 0 / 80%) inset;
            }
        }
    }
</style>
