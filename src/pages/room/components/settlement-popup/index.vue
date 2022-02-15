<template>
    <van-dialog v-model:show="show" confirm-button-text="继续游戏" @confirm="onNext">
        <template #title>
            <van-icon name="bookmark" :style="winTeamStyle" />
            <span :style="winTeamStyle">{{ winTeamMessage }}</span> 获胜
        </template>
        <van-collapse v-model="collapseActive" accordion>
            <van-collapse-item v-for="(player, index) in players" :name="index" :key="index">
                <template #title>
                    <van-icon name="bookmark" :style="buildTeamStyle(player.team)" />
                    <span class="text-gray-800 ml-2">第{{ Number(index) + 1 }}名
                        <span class="text-gray-500 font-bold">{{ player.username }}</span>
                    </span>
                </template>
                <PlayerInfo :team="player.team" :points="player.points" :block-index="player.block_index"
                    :clear-lines="player.clear_lines" :discharge-buffers="player.discharge_buffers"
                    :duration-time="player.duration_time" :speed-run="player.speed_run" />
            </van-collapse-item>
        </van-collapse>
    </van-dialog>
</template>

<script>
    import { computed, inject } from 'vue'
    import { reactive, toRefs } from '@vue/reactivity'
    import { Dialog, Collapse, CollapseItem, Icon } from 'vant'
    import PlayerInfo from './components/player-info.vue'
    import { useStore } from 'vuex'
    import _ from 'lodash'

    export default {
        props: {
            show: {
                type: Boolean,
                default: false
            },
            data: {
                type: Array,
                default: () => ([])
            },
        },
        components: {
            [Dialog.Component.name]: Dialog.Component,
            [Collapse.name]: Collapse,
            [CollapseItem.name]: CollapseItem,
            [Icon.name]: Icon,
            PlayerInfo
        },
        emit: [
            'update:show'
        ],
        setup(props) {
            const $store = useStore()
            const state = reactive({
                collapseActive: 0
            })
            const returnToGame = inject('returnToGame', () => { })

            const winTeam = computed(() => {
                if ($store.state.gameRoom.mode == 1) {
                    return _.map(_.groupBy(props.data, 'team'), (item) => ({
                        team: item[0].team,
                        points: _.sumBy(item, 'points'),
                    })).sort((a, b) => b.points - a.points)[0].team
                } else {
                    return props.data[0].team
                }
            })
            const teamMap = { '1': '红队', '2': '紫队', '3': '蓝队', '4': '绿队' }
            const winTeamMessage = computed(() => teamMap[winTeam.value])
            const winTeamStyle = computed(() => buildTeamStyle(winTeam.value))

            // 按结束时间排序，获胜队伍中的未结束成员按积分排序
            const players = computed(() => {
                if ($store.state.gameRoom.mode == 1) {
                    return props.data.sort((a, b) => {
                        return b.points - a.points
                    })
                } else {
                    return props.data.sort((a, b) => b.over_time - a.over_time)
                        .sort((a, b) => {
                            return (a.team == winTeam.value && b.team == winTeam.value)
                                ? (b.points - a.points)
                                : 0
                        })
                }
            })

            // 构建队伍色彩风格
            const buildTeamStyle = (team) => {
                const style = {}
                switch (team) {
                    case 1:
                        style.color = 'red'
                        break;
                    case 2:
                        style.color = '#8229d1'
                        break;
                    case 3:
                        style.color = 'blue'
                        break;
                    case 4:
                        style.color = 'green'
                        break;
                }
                return style
            }

            // 事件: 继续游戏
            const onNext = () => {
                returnToGame()
            }

            return {
                ...toRefs(state),
                ...toRefs(props),
                winTeamMessage,
                winTeamStyle,
                players,
                buildTeamStyle,
                onNext
            }
        },
    }
</script>
