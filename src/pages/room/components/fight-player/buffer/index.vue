<template>
    <div class="buffer">
        <div class="wrapper" :class="{fill: count >= 1}"></div>
        <div class="wrapper" :class="{fill: count >= 2}"></div>
        <div class="wrapper" :class="{fill: count >= 3}"></div>
        <div class="wrapper" :class="{fill: count >= 4}"></div>
        <div class="wrapper" :class="{fill: count >= 5}"></div>
    </div>
</template>

<script>
    import { defineComponent } from 'vue'

    export default defineComponent({
        props: {
            count: {
                type: Number,
                default: 0
            }
        },
        setup() {

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
