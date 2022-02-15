import { createStore } from 'vuex';
import mutations from './mutations'

import { isFocus } from '@/utils'
import { blankMatrix } from '@/utils/constant'

const state = {
    reset: false,
    drop: false,
    lock: false,
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
        bgmVolume: 50,
        soundVolume: 60
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
        speedStart: 1,
        startLines: 0,
        mode: 2
    },

    // 当前游戏房间成员
    gameRoomMembers: [],

    // 玩家数据
    playerData: {
        points: 0,
        isOwner: false,
        isReady: false,
        isOver: false,
        blockIndex: 0,
        cur: null,
        speedRun: 1,
        clearLines: 0,
        matrix: blankMatrix,
        dischargeBuffers: 0,
        fillBuffers: 0,
        team: 1
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
    },
    // playerBuffers
    playerBuffers(state, getters) {
        // 积分模式不累计buffer
        if (state.gameRoom.mode == 1) {
            return 0
        }

        const players = state.gameRoomMembers.filter((player) => player.team != state.playerData.team);
        const value = players.reduce((previousValue, current) => {
            return (previousValue + current?.clearLines || 0)
        }, 0);
        return value * getters.clearLevel
    },
    // playerSurplusBuffers
    playerSurplusBuffers(state, getters) {
        return getters.playerBuffers - state.playerData.dischargeBuffers - state.playerData.fillBuffers
    },
    // 消除行的倍率
    clearLevel(state) {
        let players = state.gameRoomMembers.filter((player) => player.username)
        return players.length > 2 ? 0.5 : 1
    }
}


const store = createStore({
    state,
    getters,
    mutations
})

export default store
