import { Manager } from 'socket.io-client'
import { Dialog, Toast } from 'vant'
import { useStore } from 'vuex'

let wsClient = null;
const init = () => {
    const $store = useStore();

    wsClient = new Manager(import.meta.env.VITE_WS_HOST, {
        autoConnect: true,
        transports: ['websocket'],
        upgrade: false,
        reconnectionAttempts: 10,
        timeout: 5000
    })

    wsClient.socket('/user').on('connect', () => {
        console.log('服务器连接成功');
        $store.commit('setServerStatus', 1);
    })

    wsClient.on('connect_error', () => {
        Toast.clear()
        Dialog.alert({
            title: '错误',
            message: '服务器连接已断开',
        }).then(() => {
            window.location.reload()
        })
    })
    wsClient.on('connect_timeout', () => {
        Toast.clear()
        Dialog.alert({
            title: '错误',
            message: '服务器连接超时',
        }).then(() => {
            window.location.reload()
        })
    })
    wsClient.on('reconnect', () => {
        Toast.clear()
        Dialog.alert({
            title: '错误',
            message: '服务器连接重置',
        }).then(() => {
            window.location.reload()
        })
    })
}

export {
    init,
    wsClient
}