import store from '@/store'
import { want, isClear, isOver } from '@/utils'
import {
    speeds,
    blankLine,
    blankMatrix,
    clearPoints,
    eachLines
} from '@/utils/constant'
import { music } from '@/utils/music'
import { wsClient as $wsClient } from '@/utils/websocket'

const sleep = (delay) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay)
    })
}

const getStartMatrix = startLines => {
    // 生成startLines
    const getLine = (min, max) => {
        // 返回标亮个数在min~max之间一行方块, (包含边界)
        const count = parseInt((max - min + 1) * Math.random() + min, 10)
        const line = []
        for (let i = 0; i < count; i++) {
            // 插入高亮
            line.push(1)
        }
        for (let i = 0, len = 10 - count; i < len; i++) {
            // 在随机位置插入灰色
            const index = parseInt((line.length + 1) * Math.random(), 10)
            line.splice(index, 0, 0)
        }

        return line
    }
    let startMatrix = []

    for (let i = 0; i < startLines; i++) {
        if (i <= 2) {
            // 0-3
            startMatrix.push(getLine(5, 8))
        } else if (i <= 6) {
            // 4-6
            startMatrix.push(getLine(4, 9))
        } else {
            // 7-9
            startMatrix.push(getLine(3, 9))
        }
    }
    for (let i = 0, len = 20 - startLines; i < len; i++) {
        // 插入上部分的灰色
        startMatrix.unshift(blankLine)
    }
    return startMatrix
}

const getBufferMatrix = (matrix, count) => {
    if (!matrix) {
        return matrix
    }

    // 生成startLines
    const getLine = (position) => {
        const line = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        line.splice(position, 1, 0)
        return line
    }
    let bufferMatrix = JSON.parse(JSON.stringify(matrix))
    // 寻找上一个缺口位置
    const lastPosition = bufferMatrix.slice(-1)[0].indexOf(0)
    const position = lastPosition >= 0 ? lastPosition : parseInt(Math.random() * 10)

    bufferMatrix.splice(0, count)
    for (let i = 0; i < count; i++) {
        bufferMatrix.push(getLine(position))
    }

    return bufferMatrix
}

const states = {
    // 自动下落setTimeout变量
    fallInterval: null,

    // 游戏开始
    start: () => {
        const state = store.state
        states.dispatchPoints(0)
        store.commit('speedRun', state.gameRoom.speedStart)
        const startLines = state.gameRoom.startLines
        const startMatrix = getStartMatrix(startLines)
        store.commit('matrix', startMatrix)
        store.commit('autoMoveBlock')
        store.commit('prepareNextBlock', () => {
            store.commit('reset', false)
            store.commit('drop', false)
            store.commit('lock', false)
            states.auto()
        })
    },

    // 自动下落
    auto: timeout => {
        const out = timeout < 0 ? 0 : timeout
        let state = store.state
        let cur = state.playerData.cur

        // 下落处理
        const fall = () => {
            state = store.state
            cur = state.playerData.cur

            if (state.gameRoom?.status != 1) {
                return
            }

            if (state.playerData?.isOver == 1) {
                return
            }

            if (state.gameRoom?.pause == 1) {
                return
            }

            // 方块下落
            const next = cur.fall()

            // 判断方块是否可以放到下一个位置，否则当前方块结束
            if (want(next, state.playerData.matrix)) {
                store.commit('moveBlock', next)
                states.fallInterval = setTimeout(fall, speeds[state.playerData.speedRun - 1])
            } else {
                let matrix = JSON.parse(JSON.stringify(state.playerData.matrix))
                const shape = cur && cur.shape
                const xy = cur && cur.xy
                shape.forEach((m, k1) =>
                    m.forEach((n, k2) => {
                        if (n && xy[0] + k1 >= 0) {
                            // 竖坐标可以为负
                            let line = matrix[xy[0] + k1]
                            line[xy[1] + k2] = 1
                            matrix[xy[0] + k1] = line
                        }
                    })
                )
                states.nextAround(matrix)
            }
        }
        clearTimeout(states.fallInterval)
        states.fallInterval = setTimeout(
            fall,
            out === undefined ? speeds[state.playerData.speedRun - 1] : out
        )
    },

    // 处理当前方块的结束, 并释放下一个方块
    nextAround: (matrix, stopDownTrigger) => {
        // 清除上一个方块下落定时器
        clearTimeout(states.fallInterval)

        // 锁定操作
        store.commit('lock', true)

        // 保存当前矩阵
        store.commit('matrix', matrix)

        if (typeof stopDownTrigger === 'function') {
            stopDownTrigger()
        }

        const addPoints = store.state.playerData.points + 10 * store.state.playerData.speedRun // 速度越快, 得分越高
        states.dispatchPoints(addPoints)

        // 存在消除行时，暂时不释放一个方块(由matrix组件先做消除处理)
        if (isClear(matrix)) {
            return
        }

        // 在暂停中时，暂时不释放下一个方块
        if (store.state.gameRoom.pause) {
            return
        }

        // 判断是否游戏结束
        if (isOver(matrix)) {
            states.gameOver()
            return
        }

        // 延迟一定时间后，释放方块
        setTimeout(() => {
            store.commit('lock', false)
            store.commit('moveBlock', {
                type: store.state.gameRoom.blocks[store.state.playerData.blockIndex] || ''
            })
            store.commit('prepareNextBlock', () => {
                states.auto()
            })
        }, 100)
    },

    // 页面焦点变换
    focus: isFocus => {
        store.commit('focus', isFocus)
        if (!isFocus) {
            clearTimeout(states.fallInterval)
            return
        }
        const state = store.state
        if (state.cur && !state.reset && !state.gameRoom.pause) {
            states.auto()
        }
    },

    // 暂停
    pause: isPause => {
        store.commit('pause', isPause ? 1 : 0)
        if (isPause) {
            clearTimeout(states.fallInterval)
            return
        }

        if (store.state.playerData.cur == null) {
            store.commit('autoMoveBlock')
            store.commit('prepareNextBlock', () => {
                states.auto()
            })
        } else {
            states.auto()
        }
    },

    // 上报锁定
    reportLock(satus) {

    },

    // 消除行
    clearLines: (matrix, lines) => {
        const state = store.state
        let newMatrix = JSON.parse(JSON.stringify(matrix))
        lines.forEach(n => {
            newMatrix.splice(n, 1)
            newMatrix.unshift(blankLine)
        })
        const currentClearLines = lines.length
        const clearLines = state.playerData.clearLines + currentClearLines
        store.commit('clearLines', clearLines)

        if (currentClearLines == 1) {
            music.clear1 && music.clear1.play()
        } else if (currentClearLines == 2) {
            music.clear2 && music.clear2.play()
        } else if (currentClearLines == 3) {
            music.clear3 && music.clear3.play()
        } else if (currentClearLines == 4) {
            music.clear4 && music.clear4.play()
        }
        $wsClient.socket('/game').emit('game-block-clear', currentClearLines)

        const addPoints = store.state.playerData.points + clearPoints[currentClearLines - 1] // 一次消除的行越多, 加分越多
        states.dispatchPoints(addPoints)

        // 抵销buffers
        if (store.getters.playerSurplusBuffers > 0) {
            const dischargeBuffers = currentClearLines * store.getters.clearLevel
            const playerSurplusBuffers = store.getters.playerSurplusBuffers
            store.commit(
                'setPlayerDischargeBuffers',
                store.state.playerData.dischargeBuffers + Math.min(playerSurplusBuffers, dischargeBuffers)
            )
        }

        store.commit('matrix', newMatrix)
        store.commit('autoMoveBlock')
        store.commit('prepareNextBlock', () => {
            states.auto()
            store.commit('lock', false)
        })
    },

    // 游戏结束, 触发动画
    overStart: () => {
        clearTimeout(states.fallInterval)
        store.commit('lock', false)
        store.commit('reset', true)
        store.commit('pause', false)
    },
    // 游戏结束
    gameOver: () => {
        store.commit('setPlayerOverStatus', true)
        store.commit('lock', false)
        clearTimeout(states.fallInterval)
    },

    // 游戏结束动画完成
    overEnd: () => {
        store.commit('matrix', blankMatrix)
        store.commit('moveBlock', { reset: true })
        store.commit('reset', false)
        store.commit('lock', false)
        store.commit('clearLines', 0)
    },

    // 写入分数
    dispatchPoints: point => {
        store.commit('points', point)
    },
    getStartMatrix,
    getBufferMatrix,
    // 填充玩家剩余buffers
    fillPlayerSurplusBuffers: async () => {
        const playerSurplusBuffers = parseInt(store.getters.playerSurplusBuffers)
        if (playerSurplusBuffers > 0) {
            for (let index = 1; index <= playerSurplusBuffers; index++) {
                await sleep(index * 15)
                const fillBuffers = store.state.playerData.fillBuffers
                store.commit('matrix', getBufferMatrix(store.state.playerData.matrix, 1))
                store.commit('setPlayerFillBuffers', fillBuffers + 1)
            }
        }
    }
}

export default states
