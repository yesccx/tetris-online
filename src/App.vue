<template>
    <div>
        <router-view></router-view>
    </div>
</template>


<script>
    import { defineComponent, watch } from 'vue'
    import { useStore } from 'vuex'

    import { Notify } from 'vant'

    import { init as wsClientInit } from '@/utils/websocket';

    export default defineComponent({
        setup() {
            const $store = useStore()
            wsClientInit();

            setTimeout(() => {
                if ($store.state.serverStatus !== 1) {
                    Notify({
                        message: '连接服务器中',
                        duration: 0
                    })

                    watch(() => $store.state.serverStatus, (status) => {
                        if (status) {
                            Notify.clear()
                        }
                    })
                }
            }, 500);

        },
    })
</script>

<style lang="less">
    body {
        background: #f2f2f2;
    }
</style>