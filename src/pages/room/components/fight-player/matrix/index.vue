<template>
    <div class="matrix">
        <p v-for="(p, $pIndex) in matrix" :key="$pIndex">
            <b v-for="(e, $eIndex) in p" :key="$eIndex" :class="(e === 1 ? 'c' : '') + (e === 2 ? 'd' : '')" />
        </p>
    </div>
</template>

<script>
    import { watch, reactive, toRefs, onMounted } from 'vue';
    import { fillLine, blankLine } from '@/utils/constant'

    export default {
        props: {
            cur: {
                default: () => {
                    return null
                },
                type: Object
            },
            propMatrix: {
                default: () => [],
                type: Array
            },
            username: {
                type: String,
                default: ''
            }
        },
        setup(props, { expose }) {
            const state = reactive({
                overMatrix: [],
                joinMatrix: [],
                matrix: []
            })

            // 执行结束动画
            const overAnimate = async () => {
                let _overMatrix = buildRenderData(props)
                state.overMatrix = [..._overMatrix]
                const exLine = index => {
                    if (index <= 19) {
                        _overMatrix[19 - index] = fillLine
                    } else if (index >= 20 && index <= 39) {
                        _overMatrix[index - 20] = blankLine
                    } else {
                        return
                    }
                    state.overMatrix = [..._overMatrix]
                    render('over')
                }

                for (let i = 0; i <= 40; i++) {
                    setTimeout(exLine.bind(null, i), 25 * (i + 1))
                }
            }

            // 执行加入动画
            const joinAnimate = async () => {
                let _joinMatrix = buildRenderData(props)
                state.joinMatrix = [..._joinMatrix]
                const exLine = index => {
                    if (index <= 19) {
                        _joinMatrix[19 - index] = fillLine
                    } else if (index >= 20 && index <= 39) {
                        _joinMatrix[index - 20] = blankLine
                    } else {
                        return
                    }
                    state.joinMatrix = [..._joinMatrix]
                    render('join')
                }

                for (let i = 0; i <= 40; i++) {
                    setTimeout(exLine.bind(null, i), 25 * (i + 1))
                }
            }

            // 构建渲染的数据
            const buildRenderData = (_props) => {
                if (!_props) {
                    _props = props
                }
                const cur = _props.cur
                const shape = cur && cur.shape
                const xy = cur && cur.xy
                let matrix = JSON.parse(JSON.stringify(_props.propMatrix))

                if (shape) {
                    shape.forEach((m, k1) =>
                        m.forEach((n, k2) => {
                            if (n && xy[0] + k1 >= 0) {
                                // 竖坐标可以为负
                                let line = matrix[xy[0] + k1]
                                let color
                                if (line[xy[1] + k2] === 1) {
                                    // 矩阵与方块重合
                                    color = 2
                                } else {
                                    color = 1
                                }
                                line[xy[1] + k2] = color
                                matrix[xy[0] + k1] = line
                            }
                        })
                    )
                }

                return matrix
            }

            // 渲染
            const render = (type = 'normal') => {
                switch (type) {
                    case 'over':
                        state.matrix = state.overMatrix
                        break;
                    case 'join':
                        state.matrix = state.joinMatrix
                        break;

                    default:
                        state.matrix = buildRenderData(props)
                        break;
                }
            }

            watch(props, (newValue, oldValue) => {
                // 玩家变更时，触发加入动画
                if (newValue.username && newValue.username != oldValue?.username) {
                    joinAnimate()
                } else {
                    render()
                }
            }, {
                deep: true,
                immediate: true
            })

            expose({
                joinAnimate,
                overAnimate
            })

            return {
                ...toRefs(state),
            }
        }
    }
</script>

<style lang="less">
    @import "./index.less";
</style>