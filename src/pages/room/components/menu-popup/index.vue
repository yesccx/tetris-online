<template>
    <van-action-sheet v-model:show="show" title="设置">
        <div style="padding: 0 10px 20px 10px;">
            <van-form input-align="right" label-width="90px">
                <van-divider content-position="left">局内游戏</van-divider>
                <van-field name="slider" label="游戏模式">
                    <template #label>
                        <van-icon name="diamond" /> 游戏模式
                    </template>
                    <template #input>
                        <van-radio-group v-model="mode" direction="horizontal">
                            <van-radio :name="1">积分</van-radio>
                            <van-radio :name="2">生存</van-radio>
                        </van-radio-group>
                    </template>
                </van-field>
                <van-field name="slider" label="初始速度">
                    <template #label>
                        <van-icon name="fire" /> 初始速度
                    </template>
                    <template #input>
                        <van-slider v-model="speed" :min="1" :max="10">
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
                        <van-radio-group v-model="team" direction="horizontal">
                            <van-radio name="红">红</van-radio>
                            <van-radio name="黄">黄</van-radio>
                            <van-radio name="蓝">蓝</van-radio>
                            <van-radio name="绿">绿</van-radio>
                        </van-radio-group>
                    </template>
                </van-field>
                <van-divider content-position="left">音效设置</van-divider>
                <van-field name="slider" label="游戏音乐">
                    <template #label>
                        <van-icon name="audio" /> 游戏音乐
                    </template>
                    <template #input>
                        <van-switch v-model="bgmSwitch" size="20px" />
                    </template>
                </van-field>
                <van-field name="slider" label="游戏音效">
                    <template #label>
                        <van-icon name="volume" /> 游戏音乐
                    </template>
                    <template #input>
                        <van-switch v-model="soundSwitch" size="20px" />
                    </template>
                </van-field>
                <van-divider content-position="left">偏好设置</van-divider>
                <van-field name="slider" label="控制器">
                    <template #label>
                        <van-icon name="graphic" /> 控制器
                    </template>
                    <template #input>
                        <van-radio-group v-model="controllerStyle" direction="horizontal">
                            <van-radio :name="1">风格1</van-radio>
                            <van-radio :name="2">风格2</van-radio>
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
    import { reactive, toRefs, watch } from 'vue'
    import { useStore } from 'vuex'
    import { useRouter } from 'vue-router'

    import { Form, Field, Slider, Radio, ActionSheet, RadioGroup, Divider, Switch, Button, Icon, Dialog } from 'vant'

    import { wsClient as $wsClient } from '@/utils/websocket'
    import { loading, unloading } from '@/utils/common'

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
                controllerStyle: 1,
                bgmSwitch: true,
                soundSwitch: true,
            })

            watch(() => props.show, (value) => {
                emit('update:show', value)
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

            return {
                ...toRefs(state),
                ...toRefs(props),
                onQuitRoom
            }
        }
    }
</script>