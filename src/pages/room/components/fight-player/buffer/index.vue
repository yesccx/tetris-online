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
            isQuit: {
                type: Boolean,
                default: false
            }
        },
        setup(props) {
            const state = reactive({
                realCount: 0
            })

            watch(() => props.count, (newValue, oldValue) => {
                if (!props.isOver && !props.isQuit) {
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
