<template>
    <div class="buffer">
        <div class="wrapper" :class="{f50: realCount > 0 && realCount < 1, f100: realCount >= 1}"></div>
        <div class="wrapper" :class="{f50: realCount > 1 && realCount < 2, f100: realCount >= 2}"></div>
        <div class="wrapper" :class="{f50: realCount > 2 && realCount < 3, f100: realCount >= 3}"></div>
        <div class="wrapper" :class="{f50: realCount > 3 && realCount < 4, f100: realCount >= 4}"></div>
        <div class="wrapper" :class="{f50: realCount > 4 && realCount < 5, f100: realCount >= 5}"></div>
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
            },
            gameStatus: {
                type: Number,
                default: 0
            }
        },
        setup(props) {
            const state = reactive({
                realCount: 0
            })

            watch(() => props.count, (newValue, oldValue) => {
                newValue = parseInt(newValue)
                if (props.gameStatus == 1 && !props.isOver && newValue > oldValue) {
                    music.buffer && music.buffer.play()
                }
            })

            watch(() => props.count, (newValue, oldValue) => {
                if (props.gameStatus == 1 && !props.isOver) {
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

            &.f50 {
                background: linear-gradient(90deg, #de4d4d 50%, #fee94e 50%);
                box-shadow: 0px -3px 6px rgb(0 0 0 / 80%) inset;
            }
            &.f100 {
                background: #de4d4d;
                box-shadow: 0px -3px 6px rgb(0 0 0 / 80%) inset;
            }
        }
    }
</style>
