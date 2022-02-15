<template>
    <div class="proportion">
        <div v-for="player in players" class="wrapper" :key="player.team" :class="player.color"
            :style="{width: player.ratio + '%'}">
            {{ player.points }}
        </div>
    </div>
</template>

<script>
    import { computed, defineComponent } from 'vue'
    import _ from 'lodash'

    export default defineComponent({
        props: {
            members: {
                type: Array,
                default: () => ([])
            }
        },
        setup(props) {
            const players = computed(() => {
                const data = []

                // 按团队统计积分
                const team = _(props.members).filter((member) => member.username).groupBy('team')
                _(team).each((items, teamKey) => {
                    data.push({
                        color: 'c' + teamKey,
                        points: _.sumBy(items, 'points') || 0
                    })
                })

                // 计算占比，并按积分排序
                const defaultRatio = 1 / data.length
                const totalPoints = _.sumBy(data, 'points')
                return data.map((item) => ({
                    ...item,
                    ...{ ratio: (totalPoints == 0 ? defaultRatio : (item.points / totalPoints)) * 100 }
                })).sort((a, b) => b.points - a.points)
            })

            return {
                players
            }
        },
    })
</script>


<style lang="less" scoped>
    .proportion {
        height: 22px;
        line-height: 22px;
        display: inline-flex;
        width: 100%;
        padding: 2px;
        background: #fdf5be;

        .wrapper {
            @apply truncate;
            font-size: 15px;
            width: 25%;
            transition: 0.3s all;
            text-align: center;
            min-width: calc(5% + 20px);
            margin: 0 2px;
            -webkit-filter: grayscale(20%);
            filter: grayscale(20%);

            &.c1 {
                background: red;
                color: white;
            }

            &.c2 {
                background: #fee94e;
            }

            &.c3 {
                background: blue;
                color: white;
            }

            &.c4 {
                background: green;
                color: white;
            }
        }
    }
</style>
