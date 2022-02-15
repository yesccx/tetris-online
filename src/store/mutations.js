import Block from '@/utils/block'
import FightPlayerClass from '@/pages/room/components/fight-player/utils/fight-player-class'
import { blankMatrix, eachLines } from '@/utils/constant'
import states from '@/control/states'

const mutations = {
    prepareNextBlock(state) {
        // 积分模式时，下落速度会增加(最高7级)
        if (state.gameRoom.mode == 1) {
            const speedAdd = Math.floor(state.playerData.blockIndex / eachLines)
            const speedNow = Math.min(state.gameRoom.speedStart + speedAdd, 7)
            this.commit('speedRun', speedNow)
        }

        states.fillPlayerSurplusBuffers()
        state.playerData.blockIndex++
    },
    autoMoveBlock(state, getters) {
        this.commit('moveBlock', {
            type: state.gameRoom.blocks[state.playerData.blockIndex] || ''
        })
    },
    moveBlock(state, data) {
        state.playerData.cur = data.reset === true ? null : new Block(data)
    },
    speedStart(state, data) {
        state.gameRoom.speedStart = data
    },
    speedRun(state, data) {
        state.playerData.speedRun = data
    },
    startLines(state, data) {
        state.gameRoom.startLines = data
    },
    matrix(state, data) {
        state.playerData.matrix = data
    },
    lock(state, data) {
        state.lock = data
    },
    clearLines(state, data) {
        state.playerData.clearLines = data
    },
    points(state, data) {
        state.playerData.points = data
    },
    reset(state, data) {
        state.reset = data
    },
    drop(state, data) {
        state.drop = data
    },
    pause(state, data) {
        state.gameRoom.pause = Boolean(data)
    },
    focus(state, data) {
        state.focus = data
    },
    key_drop(state, data) {
        state.keyboard['drop'] = data
    },
    key_down(state, data) {
        state.keyboard['down'] = data
    },
    key_left(state, data) {
        state.keyboard['left'] = data
    },
    key_right(state, data) {
        state.keyboard['right'] = data
    },
    key_rotate(state, data) {
        state.keyboard['rotate'] = data
    },
    key_reset(state, data) {
        state.keyboard['reset'] = data
    },
    key_pause(state, data) {
        state.keyboard['pause'] = data
    },
    key_setting(state, data) {
        state.keyboard['setting'] = data
    },
    key_multifunction(state, data) {
        state.keyboard['multifunction'] = data
    },
    setSessionUsername(state, username = '') {
        // 暂存登录状态
        window.sessionStorage.setItem('session.username', username)
        state.userSession.username = username;
    },
    // 加入房间
    joinGameRoom(state, {
        number = '',
        current_count = 0,
        max_count,
        owner = '',
        status = 0,
        pause = 0,
        blocks = [],
        speed_start = 1,
        start_lines = 0,
        userinfo = {},
        members = [],
        mode = 2,
    }) {
        // 房间信息
        state.gameRoom.number = number;
        state.gameRoom.currentCount = current_count;
        state.gameRoom.maxCount = max_count;
        state.gameRoom.owner = owner;
        state.gameRoom.status = status;
        state.gameRoom.pause = Boolean(pause);
        state.gameRoom.speedStart = speed_start;
        state.gameRoom.startLines = start_lines;
        state.gameRoom.mode = mode;

        this.commit('setGameRoomBlocks', blocks)

        // 初始化房间成员
        this.commit('initGameRoomMembers', members);

        // 设置当前玩家信息
        this.commit('setPlayerData', userinfo)
    },
    // 退出房间
    quitGameRoom(state) {
        // 房间信息
        state.gameRoom.number = '';
        state.gameRoom.owner = '';
        state.gameRoom.status = 0;
        state.gameRoom.currentCount = 0;
        state.gameRoom.maxCount = 0;
        state.gameRoom.blocks = [];

        // 房间成员列表
        this.commit('setGameRoomMembers', []);

        // 重置当前玩家信息
        this.commit('setPlayerData', {})
    },
    // 设置 玩家数据
    setPlayerData(state, data) {
        state.playerData.points = data?.points || 0
        state.playerData.isOwner = Boolean(data?.is_owner || 0)
        state.playerData.isReady = Boolean(data?.is_ready || 0)
        state.playerData.isOver = Boolean(data?.is_over || 0)
        state.playerData.blockIndex = data?.block_index || 0
        state.playerData.cur = (data?.cur && data.cur != 'null') ? new Block().decode(JSON.parse(data.cur)) : null
        state.playerData.dischargeBuffers = data?.discharge_buffers || 0
        state.playerData.fillBuffers = data?.fill_buffers || 0
        state.playerData.speedRun = data?.speed_run || 1
        state.playerData.clearLines = data?.clear_lines || 0
        state.playerData.matrix = (data?.matrix && data.matrix != 'null') ? JSON.parse(data.matrix) : blankMatrix
        state.playerData.team = data?.team || 1
    },
    // 初始化房间成员
    initGameRoomMembers(state, members = []) {
        const gameRoomMembers = [
            new FightPlayerClass,
            new FightPlayerClass,
            new FightPlayerClass,
            new FightPlayerClass,
        ]

        members.forEach((info, index) => {
            gameRoomMembers[index].fill({
                username: info?.[0] || '',
                matrix: info?.[1] ? JSON.parse(info[1]) : blankMatrix,
                blockIndex: info?.[2] || 0,
                points: info?.[3] || 0,
                clearLines: info?.[4] || 0,
                speedRun: info?.[5] || 0,
                dischargeBuffers: info?.[6] || 0,
                fillBuffers: info?.[7] || 0,
                isOwner: Boolean(info?.[8] || false),
                isReady: Boolean(info?.[9] || false),
                isOver: Boolean(info?.[10] || false),
                isOnline: Boolean(info?.[11] || false),
                isQuit: Boolean(info?.[12] || false),
                cur: (info?.[13] && info[13] != 'null') ? new Block().decode(JSON.parse(info[13])) : null,
                team: info?.[14] || 1,
                overTime: info?.[15] || 0,
            })
        })

        state.gameRoomMembers = gameRoomMembers
    },
    // 设置当前房间成员
    setGameRoomMembers(state, members = []) {
        for (let i = 0; i < state.gameRoomMembers.length; i++) {
            const info = members[i]
            state.gameRoomMembers[i].fill({
                username: info?.[0] || '',
                matrix: info?.[1] ? JSON.parse(info[1]) : blankMatrix,
                blockIndex: info?.[2] || 0,
                points: info?.[3] || 0,
                clearLines: info?.[4] || 0,
                speedRun: info?.[5] || 0,
                dischargeBuffers: info?.[6] || 0,
                fillBuffers: info?.[7] || 0,
                isOwner: Boolean(info?.[8] || false),
                isReady: Boolean(info?.[9] || false),
                isOver: Boolean(info?.[10] || false),
                isOnline: Boolean(info?.[11] || false),
                isQuit: Boolean(info?.[12] || false),
                cur: (info?.[13] && info[13] != 'null') ? new Block().decode(JSON.parse(info[13])) : null,
                team: info?.[14] || 1,
                overTime: info?.[15] || 0,
            })
        }

        state.gameRoom.currentCount = members.length
    },
    // 设置当前房间状态
    setGameRoomStatus(state, status) {
        state.gameRoom.status = status
    },
    // 设置当前房间blocks
    setGameRoomBlocks(state, blocks) {
        if (Array.isArray(blocks) && blocks.length > 0) {
            let retBlocks = []
            for (let i = 0; i < 10; i++) {
                retBlocks = retBlocks.concat(blocks)
            }
            state.gameRoom.blocks = retBlocks
        } else {
            state.gameRoom.blocks = blocks
        }
    },
    // 设置当前房间配置
    setGameRoomSettings(state, data) {
        state.gameRoom.speedStart = data?.speed_start || state.gameRoom.speedStart
        state.gameRoom.mode = data?.mode || state.gameRoom.mode
    },
    // 服务器连接状态
    setServerStatus(state, status) {
        state.serverStatus = status;
    },
    // 设置 用户设置项-布局风格
    setUserSettingLayoutStyle(state, layoutStyle) {
        state.userSetting.layoutStyle = layoutStyle
    },
    // 设置 用户设置项-背景音乐音量变更
    setUserSettingBgmVolume(state, bgmVolume) {
        state.userSetting.bgmVolume = bgmVolume
    },
    // 设置 用户设置项-游戏音效音量变更
    setUserSettingSoundVolume(state, soundVolume) {
        state.userSetting.soundVolume = soundVolume
    },
    // 设置 玩家数据-准备状态
    setPlayerReadyStatus(state, status) {
        state.playerData.isReady = status;
    },
    // 设置 玩家数据-dischargeBuffers
    setPlayerDischargeBuffers(state, data) {
        state.playerData.dischargeBuffers = data;
    },
    // 设置 玩家数据-fillBuffers
    setPlayerFillBuffers(state, data) {
        state.playerData.fillBuffers = data;
    },
    // 设置 玩家数据-结束状态
    setPlayerOverStatus(state, data) {
        state.playerData.isOver = data;
    },
    // 初始化用户设置
    initUserSettings(state, data) {
        state.userSetting.layoutStyle = data?.layoutStyle || 'style1'
        state.userSetting.bgmVolume = data?.bgmVolume || 50
        state.userSetting.soundVolume = data?.soundVolume || 60
    },
    // 设置 玩家数据-队伍
    setPlayerTeam(state, data) {
        state.playerData.team = data;
    },
    // 标记游戏结束
    setGameOver(state) {
        state.gameRoom.status = 0
    }
}
export default mutations
