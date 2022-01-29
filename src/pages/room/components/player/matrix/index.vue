<template>
    <div class="matrix">
        <p v-for="(p, $pIndex) in matrix" :key="$pIndex">
            <b v-for="(e, $eIndex) in p" :key="$eIndex" :class="(e === 1 ? 'c' : '') + (e === 2 ? 'd' : '')" />
        </p>
    </div>
</template>

<script>
    import { watch, ref, onMounted, reactive, toRefs } from 'vue';
    import { isClear } from '@/utils'
    import { fillLine, blankLine } from '@/utils/constant'
    import states from '@/control/states'

    const sleep = (delay) => {
        return new Promise((resolve) => {
            setTimeout(resolve, delay)
        })
    }

    export default {
        props: {
            cur: {
                default: () => {
                    return null
                },
                type: Object
            },
            reset: {
                default: false,
                type: Boolean
            },
            propMatrix: {
                default: () => [],
                type: Array
            }
        },
        setup(props) {
            const state = reactive({
                clearLines: [],
                animateColor: 2,
                isOver: false,
                overMatrix: null,
                matrix: []
            })

            const propsChange = async (nextProps) => {
                const clears = isClear(nextProps.propMatrix)
                const overs = nextProps.reset
                setTimeout(() => {
                    state.clearLines = clears
                    state.isOver = overs
                }, 0)

                if (clears && !state.clearLines) {
                    clearAnimate()
                } else if (!clears && overs && !state.isOver) {
                    // over(nextProps)
                    // TODO: 游戏结束动画
                    render()
                } else {
                    state.clearLines = false
                    render()
                }
            }

            // 消除行时的动画
            const clearAnimate = async () => {
                const anima = callback => {
                    return new Promise((resolve) => {
                        sleep(100).then(() => {
                            state.animateColor = 0
                            render()
                            return sleep(100)
                        }).then(() => {
                            state.animateColor = 2
                            render()
                            if (typeof callback === 'function') {
                                callback()
                            }
                            return resolve()
                        })
                    })
                }

                await anima()
                await anima()
                await anima(() => {
                    sleep(100).then(() => {
                        states.clearLines(props.propMatrix, state.clearLines)
                    })
                })
            }

            const over = async (nextProps) => {
                let _overMatrix = buildRenderData(nextProps)
                state.overMatrix = [..._overMatrix]
                const exLine = index => {
                    if (index <= 19) {
                        _overMatrix[19 - index] = fillLine
                    } else if (index >= 20 && index <= 39) {
                        _overMatrix[index - 20] = blankLine
                    } else {
                        states.overEnd()
                        return
                    }
                    state.overMatrix = [..._overMatrix]
                    render()
                }

                for (let i = 0; i <= 40; i++) {
                    setTimeout(exLine.bind(null, i), 40 * (i + 1))
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
                const _clearLines = state.clearLines
                if (_clearLines) {
                    const _animateColor = state.animateColor
                    _clearLines.forEach(index => {
                        matrix[index] = new Array(10).fill(_animateColor)
                    })
                } else if (shape) {
                    shape.forEach((m, k1) =>
                        m.forEach((n, k2) => {
                            if (n && xy[0] + k1 >= 0) {
                                // 竖坐标可以为负
                                let line = matrix[xy[0] + k1]
                                let color
                                if (line[xy[1] + k2] === 1 && !_clearLines) {
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

            const render = () => {
                state.matrix = buildRenderData(props)
                // state.matrix = state.isOver ? state.overMatrix : buildRenderData(props)
            }

            watch(props, (newValue = {}) => {
                propsChange(newValue)
            }, {
                deep: true,
                immediate: true
            })

            return {
                ...toRefs(state)
            }
        }
    }
</script>

<style lang="less">
    @import "./index.less";
</style>