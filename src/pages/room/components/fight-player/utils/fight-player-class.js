import { useStore } from "vuex"
import _ from 'lodash'

class FightPlayerClass {
    username = ''
    blocks = []
    blockIndex = 0
    points = 0
    clearLines = 0
    speedStart = 1
    speedRun = 1

    // 是否房主
    isOwner = 0

    // 是否准备
    isReady = 0

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
