<template>
    <p class="text-center text-gray-400 text-sm pb-2 flex justify-between pl-1 pr-1 font-bold">
        <span class="truncate">Hello，<span class="text-gray-500">{{ sessionUsername }}</span></span>
        <span style="min-width: 90px;">在线：<span class="text-gray-500">{{ onlineCount }}人</span></span>
    </p>
</template>

<script>
    import { computed, defineComponent, reactive, toRefs } from 'vue'
    import { useStore } from 'vuex'

    export default defineComponent({
        props: {
            // 在线人数
            onlineCount: {
                type: Number,
                default: 0
            }
        },
        setup(props) {
            const $store = useStore()

            const state = reactive({
                sessionUsername: computed(() => $store.state.userSession.username)
            })

            return {
                ...toRefs(state),
                ...toRefs(props)
            }
        },
    })
</script>
