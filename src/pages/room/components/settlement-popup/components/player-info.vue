<template>
    <div>
        <ul class="data-container">
            <li class="data-wrapper">
                <span class="column-name">队伍：</span>
                <span class="column-value">{{ teamName }}</span>
            </li>
            <li class="data-wrapper">
                <span class="column-name">积分：</span>
                <span class="column-value">{{ points }}</span>
            </li>
            <li class="data-wrapper">
                <span class="column-name">下落方块：</span>
                <span class="column-value">{{ blockIndex }}</span>
            </li>
            <li class="data-wrapper">
                <span class="column-name">消除行：</span>
                <span class="column-value">{{ clearLines }}</span>
            </li>
            <li class="data-wrapper">
                <span class="column-name">抵消行：</span>
                <span class="column-value">{{ dischargeBuffers }}</span>
            </li>
            <li class="data-wrapper">
                <span class="column-name">下落速度：</span>
                <span class="column-value">{{ speedRun !== '' ? (speedRun + '级') : '' }}</span>
            </li>
            <li class="data-wrapper">
                <span class="column-name">生存时间：</span>
                <span class="column-value">{{ durationTime }}</span>
            </li>
        </ul>
    </div>
</template>

<script>
    import { toRefs } from '@vue/reactivity'
    import { computed } from '@vue/runtime-core'
    export default {
        props: {
            team: {
                type: Number,
                default: 0
            },
            points: {
                type: Number,
                default: 0
            },
            blockIndex: {
                type: Number,
                default: 0
            },
            clearLines: {
                type: Number,
                default: 0
            },
            dischargeBuffers: {
                type: Number,
                default: 0
            },
            durationTime: {
                type: String,
                default: '-'
            },
            speedRun: {
                default: ''
            }
        },
        setup(props) {
            // 队伍名称
            const teamMap = { '1': '红队', '2': '紫队', '3': '蓝队', '4': '绿队' }
            const teamName = computed(() => teamMap[props.team])

            return {
                teamName,
                ...toRefs(props)
            }
        },
    }
</script>

<style lang="less" scoped>
    .data-container {
        @apply flex flex-wrap;
        font-size: 13px;

        .data-wrapper {
            margin: 3px 7px;
            .column-name {
                @apply text-gray-800;
            }
            .column-value {
                @apply text-gray-500;
            }
        }
    }
</style>
