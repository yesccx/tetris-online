<template>
    <div>
        <Number :number="number" />
    </div>
</template>

<script>
    import { toRefs } from 'vue';
    import Number from '../number/index.vue'

    export default {
        components: {
            Number
        },
        props: {
            number: {
                default: 0
            }
        },
        setup(props) {
            return {
                ...toRefs(props)
            }
        }
    }
</script>