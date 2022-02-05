import { useStore } from "vuex"
import _ from 'lodash'

class FightPlayerClass {
    username = ''
    matrix = null
    blockIndex = 0
    points = 0
    clearLines = 0
    speedRun = 1
    dischargeBuffers = 0
    fillBuffers = 0
    team = 1

    // 是否房主
    isOwner = false

    // 是否准备
    isReady = false

    // 是否已结束
    isOver = false

    // 当前下落的方块
    cur = null

    // 在线状态
    online = false

    constructor(attributes) {
        this.fill(attributes)
    }

    // 下一个方块
    nextBlock() {
        const $store = useStore()

        if ($store.state.gameRoom.status != 1) {
            return ''
        }
        return $store.state.gameRoom.blocks?.[this.blockIndex] || ''
    }

    fill(attributes) {
        _(attributes).each((value, key) => {
            this[key] = value;
        });
    }
}

export default FightPlayerClass
