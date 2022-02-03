<template>
    <div>
        <p class="text-center truncate opacity-80 rounded-2xl font-bold text-gray-800 mt-1"
            style="font-size: 20px; width: 100%; line-height: 30px; padding: 5px 0px; display: flex; justify-content: center; align-items: center;">
            <van-icon name="bookmark" :color="teamColor" size="24" />
            <span class="pr-1" v-if="isOwner">[房主]</span>{{ username }}
        </p>
        <div style="width: 100%;background:red;width:100%"></div>
    </div>
</template>

<script>
    import { computed, toRefs } from 'vue'

    import { Icon } from 'vant'
    import { useStore } from 'vuex'

    export default {
        components: {
            [Icon.name]: Icon
        },
        props: {
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
            const $store = useStore()
            const colorMap = {
                1: 'red',
                2: '#8229d1',
                3: 'blue',
                4: 'green',
            }
            const teamColor = computed(() => colorMap[props.team])

            const username = computed(() => $store.state.userSession.username)

            return {
                username,
                teamColor,
                ...toRefs(props)
            }
        },
    }
</script>
