<template>
    <div>
        <p class="text-center truncate opacity-80 rounded-2xl font-bold text-gray-800 mt-1"
            style="font-size: 40px;width: 100%;padding: 0 40px;height: 65px;line-height: 65px;">
            <van-icon v-show="username" name="bookmark" :color="teamColor" size="40" style="margin-top: 20px;" />
            <span class="pr-1" v-if="isOwner">[房主]</span>{{ username }}
        </p>
        <div style="width: 100%;background:red;width:100%"></div>
    </div>
</template>

<script>
    import { computed, toRefs } from 'vue'

    import { Icon } from 'vant'

    export default {
        components: {
            [Icon.name]: Icon
        },
        props: {
            username: {
                type: String,
                default: '',
            },
            isOwner: {
                type: Boolean,
                default: false
            },
            team: {
                type: Number,
                default: 1
            }
        },
        setup(props) {
            const colorMap = {
                1: 'red',
                2: '#8229d1',
                3: 'blue',
                4: 'green',
            }
            const teamColor = computed(() => colorMap[props.team])

            return {
                teamColor,
                ...toRefs(props)
            }
        },
    }
</script>
