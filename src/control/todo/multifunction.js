import { wsClient as $wsClient } from '@/utils/websocket';
import { Toast } from 'vant'
import states from '../states';

const down = store => {
    store.commit('key_multifunction', true)
}

let lock = false;

const up = store => {
    store.commit('key_multifunction', false)

    if (lock) {
        return;
    }
    lock = true;

    const playerData = store.state.playerData
    const gameRoom = store.state.gameRoom
    if (gameRoom.status == 1) {
        // 游戏暂停/恢复
        if (gameRoom.pause) {
            $wsClient.socket('/game').emit('game-unpause', (data) => {
                lock = false;
                if (!data['success']) {
                    return Toast.fail(`恢复游戏失败（${data['message'] || '未知错误'}）`);
                }
                states.pause(false)
            });
        } else {
            $wsClient.socket('/game').emit('game-pause', (data) => {
                lock = false;
                if (!data['success']) {
                    return Toast.fail(`暂停游戏失败（${data['message'] || '未知错误'}）`);
                }
                states.pause(true)
            });
        }
    } else {
        if (playerData.isOwner) {
            $wsClient.socket('/game').emit('game-start', (data) => {
                lock = false;
                if (!data['success']) {
                    return Toast.fail(data['message'] || '未知错误');
                }
            });
        } else {
            if (playerData.isReady) {
                store.commit('setPlayerReadyStatus', false);
                $wsClient.socket('/game').emit('game-unready', () => {
                    lock = false;
                });
            } else {
                store.commit('setPlayerReadyStatus', true);
                $wsClient.socket('/game').emit('game-ready', () => {
                    lock = false;
                });
            }
        }
    }
}

export default {
    down,
    up
}
