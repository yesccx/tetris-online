import { want } from '@/utils'
import event from '@/utils/event'
import states from '../states'
import { speeds, delays } from '@/utils/constant'

const down = store => {
    store.commit('key_right', true)
    event.down({
        key: 'right',
        begin: 200,
        interval: 100,
        callback: () => {
            const state = store.state

            // 锁定状态时不允许操作
            if (state.lock) {
                return;
            }

            // 游戏未开始、暂停时不允许操作
            if (state.gameRoom.status != 1 ||  state.gameRoom.pause) {
                return
            }

            // 游戏已结束
            if (state.playerData.isOver) {
                return
            }

            // 当前不存在方块时不允许操作
            const cur = state.playerData.cur
            if (cur === null) {
                return
            }

            const next = cur.right()
            const delay = delays[state.playerData.speedRun - 1]
            let timeStamp
            if (want(next, state.playerData.matrix)) {
                next.timeStamp += parseInt(delay, 10)
                store.commit('moveBlock', next)
                timeStamp = next.timeStamp
            } else {
                cur.timeStamp += parseInt(parseInt(delay, 10) / 1.5, 10) // 真实移动delay多一点，碰壁delay少一点
                store.commit('moveBlock', cur)
                timeStamp = cur.timeStamp
            }
            const remain = speeds[state.playerData.speedRun - 1] - (Date.now() - timeStamp)
            states.auto(remain)
        }
    })
}

const up = store => {
    store.commit('key_right', false)
    event.up({
        key: 'right'
    })
}

export default {
    down,
    up
}
