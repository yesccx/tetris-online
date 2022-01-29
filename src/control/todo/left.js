import { want } from '@/utils'
import event from '@/utils/event'
import states from '../states'
import { speeds, delays } from '@/utils/constant'
import { music } from '@/utils/music';

const down = store => {
    store.commit('key_left', true)
    event.down({
        key: 'left',
        begin: 200,
        interval: 100,
        callback: () => {
            const state = store.state

            music.move()

            // 锁定状态时不允许操作
            if (state.lock) {
                return;
            }

            // 游戏未开始时不允许操作
            if (state.gameRoom.status != 1) {
                return
            }

            // 当前不存在方块时不允许操作
            const cur = state.playerData.cur
            if (cur === null) {
                return
            }

            const next = cur.left()
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
    store.commit('key_left', false)
    event.up({
        key: 'left'
    })
}

export default {
    down,
    up
}
