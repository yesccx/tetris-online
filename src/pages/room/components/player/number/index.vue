<template>
    <div class="number">
        <span v-for="(item, index) in numData" :class="'bg s_'+item" :key="index" />
    </div>
</template>

<script>
    import { onMounted, reactive, toRefs, watch } from 'vue';

    export default {
        props: {
            number: {
                type: Number,
                default: 0
            },
            length: {
                type: Number,
                default: 6
            }
        },
        setup(props) {
            const state = reactive({
                numData: []
            })

            watch(() => props, () => {
                render()
            }, {
                deep: true
            })

            onMounted(() => {
                render()
            })

            const render = () => {
                const numData = `${props.number || 0}`.split('')
                const maxLength = props.length || 6
                for (let i = 0, len = maxLength - numData.length; i < len; i++) {
                    numData.unshift('n')
                }
                state.numData = numData
            }

            return {
                ...toRefs(state)
            }
        }
    }
</script>

<style lang="less">
    @import "./index.less";
</style>