<template>
    <div>
        <router-view></router-view>
    </div>
</template>


<script>
    import { defineComponent } from 'vue'

    import { init as wsClientInit } from '@/utils/websocket';

    export default defineComponent({
        setup() {
            wsClientInit();
        },
    })
</script>

<style lang="less">
    body {
        background: #f2f2f2;
    }
</style>