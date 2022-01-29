import { want } from '@/utils'
import event from '@/utils/event'
import { music } from '@/utils/music';

const down = store => {
    store.commit('key_rotate', true)

    event.down({
        key: 'rotate',
        once: true,
        callback: () => {
            const state = store.state

            music.rotate()

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

            const next = cur.rotate()
            if (want(next, state.playerData.matrix)) {
                store.commit('moveBlock', next)
            }
        }
    })
}

const up = store => {
    store.commit('key_rotate', false)
    event.up({
        key: 'rotate'
    })
}

export default {
    down,
    up
}
