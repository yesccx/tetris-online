<template>
    <div>
        <p class="text-center truncate opacity-80 rounded-2xl font-bold text-gray-800 mt-1"
            style="font-size: 45px;width: 100%;padding: 0 40px;height: 65px;line-height: 65px;">
            <span class="pr-1" v-if="isOwner">[房主]</span>{{ username }}
        </p>
        <div style="width: 100%;background:red;width:100%"></div>
    </div>
</template>

<script>
    import { toRefs } from 'vue'

    export default {
        props: {
            username: {
                type: String,
                default: '',
            },
            isOwner: {
                type: Boolean,
                default: false
            }
        },
        setup(props) {
            return {
                ...toRefs(props)
            }
        },
    }
</script>
