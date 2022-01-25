import { getNextType } from '@/utils'
import Block from '@/utils/block'
import FightPlayerClass from '@/pages/room/components/fight-player/utils/fight-player-class'

const mutations = {
    nextBlock(state, data) {
        if (!data) {
            data = getNextType()
        }
        state.next = data
    },
    moveBlock(state, data) {
        state.cur = data.reset === true ? null : new Block(data)
    },
    speedStart(state, data) {
        state.speedStart = data
    },
    speedRun(state, data) {
        state.speedRun = data
    },
    startLines(state, data) {
        state.startLines = data
    },
    matrix(state, data) {
        state.matrix = data
    },
    lock(state, data) {
        state.lock = data
    },
    clearLines(state, data) {
        state.clearLines = data
    },
    points(state, data) {
        state.points = data
    },
    max(state, data) {
        state.max = data
    },
    reset(state, data) {
        state.reset = data
    },
    drop(state, data) {
        state.drop = data
    },
    pause(state, data) {
        state.pause = data
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
    setSessionUsername(state, username = '') {
        // 暂存登录状态
        window.sessionStorage.setItem('session.username', username)
        state.userSession.username = username;
    },
    // 加入房间
    joinGameRoom(state, { number = '', current_count = 0, max_count, status = 0, owner = '', members = [], blocks = [], userinfo = {} }) {
        // 房间信息
        state.gameRoom.number = number;
        state.gameRoom.owner = owner;
        state.gameRoom.status = status;
        state.gameRoom.currentCount = current_count;
        state.gameRoom.maxCount = max_count;
        state.gameRoom.blocks = blocks;

        // 初始化房间成员
        this.commit('initGameRoomMembers', members);

        // 当前玩家信息
        state.playerData.blockIndex = userinfo.block_index || 0
        state.playerData.isReady = Boolean(userinfo.is_ready || 0)
        state.playerData.isOwner = Boolean(userinfo.is_owner || 0)
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

        // 当前玩家信息
        state.playerData.blockIndex = 0
        state.playerData.isReady = false
        state.playerData.isOwner = false
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
                username: info?.username || '',
                isOwner: info?.is_owner || false,
                isReady: info?.is_ready || false,
            })
        })

        state.gameRoomMembers = gameRoomMembers
    },
    // 设置当前房间成员
    setGameRoomMembers(state, members = []) {
        for (let i = 0; i < state.gameRoomMembers.length; i++) {
            const info = members[i]
            state.gameRoomMembers[i].fill({
                username: info?.username || '',
                isOwner: info?.is_owner || false,
                isReady: info?.is_ready || false,

                blocks: info?.blocks || [],
                blockIndex: info?.block_index || 0,
                points: info?.points || 0,
                clearLines: info?.clear_lines || 0,
                speedStart: info?.speed_start || 0,
                speedRun: info?.speed_run || 0,
            })
        }
    },
    // 服务器连接状态
    setServerStatus(state, status) {
        state.serverStatus = status;
    },
}
export default mutations
