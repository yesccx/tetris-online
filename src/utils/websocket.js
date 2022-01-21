import { Manager } from 'socket.io-client'
import { Dialog } from 'vant'

let wsClient = null;
const init = () => {
    wsClient = new Manager('http://81.68.72.28:8992', {
        autoConnect: true,
        transports: ['websocket'],
        upgrade: false,
        reconnectionAttempts: 10,
    })

    wsClient.on('connect_error', () => {
        Dialog.alert({
            title: '错误',
            message: '服务器连接异常',
        }).then(() => {
            window.location.reload()
        })
    })
    wsClient.on('connect_timeout', () => {
        Dialog.alert({
            title: '错误',
            message: '服务器连接已断开',
        }).then(() => {
            window.location.reload()
        })
    })
    wsClient.on('reconnect', () => {
        window.location.reload()
    })
}

export {
    init,
    wsClient
}