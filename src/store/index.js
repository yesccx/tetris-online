import { createStore } from 'vuex';
import mutations from './mutations'

import { getNextType } from '@/utils'
import { isFocus } from '@/utils'
import { blankMatrix, lastRecord, maxPoint, blockType } from '@/utils/constant'
import Block from '@/utils/block'

const _lastRecord = lastRecord

const clearLinesInitState = () => {
    let _state = (_lastRecord && !isNaN(parseInt(_lastRecord.clearLines, 10)))
        ? parseInt(_lastRecord.clearLines, 10)
        : 0
    if (_state < 0) {
        _state = 0
    }
    return _state
}

const curInitState = () => {
    if (!_lastRecord || !_lastRecord.cur) {
        // 无记录 或 有记录 但方块为空, 返回 null
        return null
    }
    const cur = _lastRecord.cur
    const option = {
        type: cur.type,
        rotateIndex: cur.rotateIndex,
        shape: cur.shape,
        xy: cur.xy
    }
    return new Block(option)
}

const dropInitState = () => {
    let _state = _lastRecord && _lastRecord.drop !== undefined
        ? !!_lastRecord.drop
        : false
    return _state
}

const lockInitState = () => {
    let _state = _lastRecord && _lastRecord.lock !== undefined
        ? !!_lastRecord.lock
        : false
    return _state;
}


const matrixInitState = () => {
    let _state = _lastRecord && Array.isArray(_lastRecord.matrix)
        ? _lastRecord.matrix
        : blankMatrix

    return _state
}

const maxInitState = () => {
    let _state = _lastRecord && !isNaN(parseInt(_lastRecord.max, 10))
        ? parseInt(_lastRecord.max, 10)
        : 0
    if (_state < 0) {
        _state = 0
    } else if (_state > maxPoint) {
        _state = maxPoint
    }

    return _state
}

const nextInitState = () => {
    let _state = _lastRecord && blockType.indexOf(_lastRecord.next) !== -1
        ? _lastRecord.next
        : getNextType()
    return _state
}

const pauseInitState = () => {
    let _state = _lastRecord && _lastRecord.pause !== undefined
        ? !!_lastRecord.pause
        : false
    return _state
}

const pointsInitState = () => {
    let _state = _lastRecord && !isNaN(parseInt(_lastRecord.points, 10))
        ? parseInt(_lastRecord.points, 10)
        : 0
    if (_state < 0) {
        _state = 0
    } else if (_state > maxPoint) {
        _state = maxPoint
    }

    return _state
}

const speedRunInitState = () => {
    let _state = _lastRecord && !isNaN(parseInt(_lastRecord.speedRun, 10))
        ? parseInt(_lastRecord.speedRun, 10)
        : 1
    if (_state < 1 || _state > 6) {
        _state = 1
    }
    return _state
}

const speedStartInitState = () => {
    let _state = _lastRecord && !isNaN(parseInt(_lastRecord.speedStart, 10))
        ? parseInt(_lastRecord.speedStart, 10)
        : 1
    if (_state < 1 || _state > 6) {
        _state = 1
    }
    return _state
}

const startLinesInitState = () => {
    let _state = _lastRecord && !isNaN(parseInt(_lastRecord.startLines, 10))
        ? parseInt(_lastRecord.startLines, 10)
        : 0
    if (_state < 0 || _state > 10) {
        _state = 0
    }

    return _state
}

const resetInitState = () => {
    let _state = _lastRecord && _lastRecord.reset
        ? !!_lastRecord.reset
        : false
    return _state
}

const state = {
    matrix: matrixInitState(),
    pause: pauseInitState(),
    next: nextInitState(),
    cur: curInitState(),
    speedStart: speedStartInitState(),
    speedRun: speedRunInitState(),
    startLines: startLinesInitState(),
    clearLines: clearLinesInitState(),
    points: pointsInitState(),
    max: maxInitState(),
    reset: resetInitState(),
    drop: dropInitState(),
    lock: lockInitState(),
    focus: isFocus(),
    keyboard: {
        drop: false,
        down: false,
        left: false,
        right: false,
        rotate: false,
        reset: false,
        pause: false,
        setting: false,
        multifunction: false
    },

    // 用户会话
    userSession: {
        username: '',
    },
    // 用户设置
    userSetting: {
        layoutStyle: 'style1',
    },

    // 当前游戏房间
    gameRoom: {
        number: '',
        owner: '',
        pause: false,
        status: 0,
        currentCount: 0,
        maxCount: 0,
        blocks: [],
    },
    // 当前游戏房间成员
    gameRoomMembers: [],
    // 玩家数据
    playerData: {
        isOwner: false,
        isReady: false,
        blockIndex: 0
    },

    // 服务器连接状态
    serverStatus: 0
}

const getters = {
    // 房间内的对战玩家(不包含自己)
    fightPlayers(state) {
        let players = state.gameRoomMembers
        return players.filter((player) => player.username != state.userSession.username).slice(0, 3);
    },
    // 房间内玩家是否都已准备
    gameRoomFightReady(state) {
        return state.gameRoomMembers.every((player) => !player.username || player.isReady)
    }
}


const store = createStore({
    state,
    getters,
    mutations
})

export default store
