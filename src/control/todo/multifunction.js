import { wsClient as $wsClient } from '@/utils/websocket';
import { Toast } from 'vant'

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

    if (store.state.gameRoom.status == 1) {
        // TODO: 游戏暂停..
    } else {
        if (store.state.playerData.isOwner) {
            $wsClient.socket('/game').emit('game-start', (data) => {
                lock = false;
                if (!data['success']) {
                    return Toast.fail(data['message'] || '未知错误');
                }
            });
        } else {
            if (store.state.playerData.isReady) {
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
