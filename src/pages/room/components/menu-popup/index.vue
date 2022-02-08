<template>
    <van-action-sheet v-model:show="show" title="设置">
        <div style="padding: 0 10px 20px 10px;zoom:0.85">
            <van-form input-align="right" label-width="110px">
                <van-divider content-position="left">局内游戏</van-divider>
                <van-field name="slider" label="游戏模式">
                    <template #label>
                        <van-icon name="diamond" /> 游戏模式
                    </template>
                    <template #input>
                        <van-radio-group v-model="mode" direction="horizontal" :disabled="!gameRoomSetting"
                            @change="onSettingsChange">
                            <van-radio :name="1" disabled>积分</van-radio>
                            <van-radio :name="2">生存</van-radio>
                        </van-radio-group>
                    </template>
                </van-field>
                <van-field name="slider" label="初始速度">
                    <template #label>
                        <van-icon name="fire" /> 初始速度
                    </template>
                    <template #input>
                        <van-slider v-model="speed" :min="1" :max="6" :disabled="!gameRoomSetting"
                            @change="onSettingsChange">
                            <template #button>
                                <div class="van-slider__button text-center text-gray-500">{{ speed }}</div>
                            </template>
                        </van-slider>
                    </template>
                </van-field>
                <van-field name="slider" label="队伍">
                    <template #label>
                        <van-icon name="manager" /> 队伍
                    </template>
                    <template #input>
                        <van-radio-group v-model="team" direction="horizontal" @change="onTeamChange"
                            :disabled="!playerSetting">
                            <van-radio :name="1" checked-color="red">红</van-radio>
                            <van-radio :name="2" checked-color="#8229d1">紫</van-radio>
                            <van-radio :name="3" checked-color="blue">蓝</van-radio>
                            <van-radio :name="4" checked-color="green">绿</van-radio>
                        </van-radio-group>
                    </template>
                </van-field>
                <van-divider content-position="left">音效设置</van-divider>
                <van-field name="slider" label="背景音乐">
                    <template #label>
                        <van-icon name="audio" /> 背景音乐
                    </template>
                    <template #input>
                        <van-slider v-model="bgmVolume" :min="0" :max="100" @change="onBgmVolumeChange">
                            <template #button>
                                <div class="van-slider__button text-center text-gray-500" style="font-size:10px">
                                    {{ bgmVolume }}</div>
                            </template>
                        </van-slider>
                    </template>
                </van-field>
                <van-field name="slider" label="游戏音效">
                    <template #label>
                        <van-icon name="volume" /> 游戏音效
                    </template>
                    <template #input>
                        <van-slider v-model="soundVolume" :min="0" :max="100" @change="onSoundVolumeChange">
                            <template #button>
                                <div class="van-slider__button text-center text-gray-500" style="font-size:10px">
                                    {{ soundVolume }}</div>
                            </template>
                        </van-slider>
                    </template>
                </van-field>
                <van-divider content-position="left">偏好设置</van-divider>
                <van-field name="slider" label="控制器">
                    <template #label>
                        <van-icon name="graphic" /> 控制器
                    </template>
                    <template #input>
                        <van-radio-group v-model="controllerStyle" direction="horizontal"
                            @change="onControllerStyleChange">
                            <van-radio v-for="style in controllerStyleResource" :name="style.index" :key="style.index">
                                {{ style.name }}
                            </van-radio>
                        </van-radio-group>
                    </template>
                </van-field>
            </van-form>
            <van-button type="danger" size="small" icon="clear" @click="onQuitRoom"
                style="margin-top:1rem;position:sticky;bottom:1rem" block round>退出房间</van-button>
        </div>
    </van-action-sheet>
</template>

<script>
    import { computed, onMounted, reactive, toRefs, watch } from 'vue'
    import { useStore } from 'vuex'
    import { useRouter } from 'vue-router'

    import { Form, Field, Slider, Radio, ActionSheet, RadioGroup, Divider, Switch, Button, Icon, Dialog } from 'vant'

    import { wsClient as $wsClient } from '@/utils/websocket'
    import { loading, unloading } from '@/utils/common'

    import keyboardLayout from '../player/keyboard/layout';
    import { music } from '@/utils/music'
    import _ from 'loadsh'

    export default {
        components: {
            [ActionSheet.name]: ActionSheet,
            [Form.name]: Form,
            [Field.name]: Field,
            [Slider.name]: Slider,
            [Radio.name]: Radio,
            [RadioGroup.name]: RadioGroup,
            [Divider.name]: Divider,
            [Switch.name]: Switch,
            [Button.name]: Button,
            [Icon.name]: Icon,
        },
        props: {
            show: {
                type: Boolean,
                default: false
            }
        },
        emit: [
            'update:show'
        ],
        setup(props, { emit }) {
            const $store = useStore()
            const $router = useRouter()
            const state = reactive({
                team: '红',
                speed: 1,
                mode: 1,
                controllerStyle: $store.state.userSetting.layoutStyle,
                bgmVolume: $store.state.userSetting.bgmVolume,
                soundVolume: $store.state.userSetting.soundVolume,
                controllerStyleResource: []
            })

            state.controllerStyleResource = Object.keys(keyboardLayout).map((index) => ({
                name: keyboardLayout[index].name,
                index: index
            }))

            watch(() => props.show, (value) => {
                emit('update:show', value)
            })

            // 控制背景音乐
            watch(() => state.bgmVolume, (value) => {
                music.bgmusic.volume(value / 100)
            }, {
                immediate: true
            })
            // 控制游戏音效
            watch(() => state.soundVolume, (value) => {
                _(music).each((item, key) => {
                    if (key != 'bgmusic') {
                        item.volume(value / 100)
                    }
                })
            }, {
                immediate: true
            })
            // 游戏设置变更
            watch(() => $store.state.gameRoom, (data) => {
                state.speed = data.speedStart
                state.mode = data.mode
            }, {
                deep: true,
                immediate: true
            })
            // 玩家设置变更
            watch(() => $store.state.playerData, (data) => {
                state.team = data.team
            }, {
                deep: true,
                immediate: true
            })

            onMounted(() => {
                state.controllerStyle = $store.state.userSetting.layoutStyle
                state.bgmVolume = $store.state.userSetting.bgmVolume
                state.soundVolume = $store.state.userSetting.soundVolume
            })

            // 事件: 退出房间
            const onQuitRoom = () => {
                Dialog.confirm({
                    title: '退出房间',
                    message: '是否确认退出当前房间？',
                }).then(() => {
                    loading()
                    $wsClient.socket('/game').emit('leave-room', () => {
                        unloading()
                        $store.commit('quitGameRoom')
                        $router.push({ name: 'hall' })
                    })
                })
            }

            // 事件: 控制器风格变更
            const onControllerStyleChange = (value) => {
                $store.commit('setUserSettingLayoutStyle', value)
            }

            // 事件: 背景音乐音量变更
            const onBgmVolumeChange = (value) => {
                $store.commit('setUserSettingBgmVolume', value)
            }

            // 事件: 游戏音效音量变更
            const onSoundVolumeChange = (value) => {
                $store.commit('setUserSettingSoundVolume', value)
            }

            // 事件: 游戏设置更新
            const onSettingsChange = () => {
                loading()
                $wsClient.socket('/game').emit('game-settings', {
                    'speed_start': state.speed,
                    'mode': state.mode
                }, () => {
                    unloading()
                })
            }

            // 事件: 队伍更新
            const onTeamChange = () => {
                const team = state.team
                loading()
                $wsClient.socket('/game').emit('player-settings', {
                    'team': team,
                }, (data) => {
                    unloading()
                    if (data.success) {
                        $store.commit('setPlayerTeam', team)
                    }
                })
            }

            return {
                ...toRefs(state),
                ...toRefs(props),
                onQuitRoom,
                onControllerStyleChange,
                onBgmVolumeChange,
                onSoundVolumeChange,
                onSettingsChange,
                onTeamChange,
                gameRoomSetting: computed(() => $store.state.playerData.isOwner && $store.state.gameRoom.status != 1),
                playerSetting: computed(() => $store.state.gameRoom.status != 1)
            }
        }
    }
</script>