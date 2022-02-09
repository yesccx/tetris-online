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
                    <span class=" text-gray-500 ml-2">第{{ Number(index) + 1 }}名 {{ player.username }}</span>
                </template>
                <PlayerInfo :team="player.team" :points="player.points" :block-index="player.block_index"
                    :clear-lines="player.clear_lines" :discharge-buffers="player.discharge_buffers" />
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

    export default {
        props: {
            show: {
                type: Boolean,
                default: false
            },
            data: {
                type: Array,
                default: () => ([])
            }
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

            const teamMap = { '1': '红队', '2': '紫队', '3': '蓝队', '4': '绿队' }
            const winTeamMessage = computed(() => teamMap[props.data[0].team])
            const winTeamStyle = computed(() => buildTeamStyle(props.data[0].team))

            const players = computed(() => props.data.sort((a, b) => b.over_time - a.over_time))

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
