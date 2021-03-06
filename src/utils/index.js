import { watch } from 'vue'
import { blockType, StorageKey } from './constant'
const hiddenProperty = (() => {
    // document[hiddenProperty] 可以判断页面是否失焦
    let names = ['hidden', 'webkitHidden', 'mozHidden', 'msHidden']
    names = names.filter(e => e in document)
    return names.length > 0 ? names[0] : false
})()
const utils = {
    getNextType() {
        // 随机获取下一个方块类型
        const len = blockType.length
        return blockType[Math.floor(Math.random() * len)]
    },
    want(next, matrix) {
        // 方块是否能移到到指定位置
        const xy = next.xy
        const shape = next.shape
        const horizontal = shape[0].length
        return shape.every((m, k1) =>
            m.every((n, k2) => {
                if (xy[1] < 0) {
                    // left
                    return false
                }
                if (xy[1] + horizontal > 10) {
                    // right
                    return false
                }
                if (xy[0] + k1 < 0) {
                    // top
                    return true
                }
                if (xy[0] + k1 >= 20) {
                    // bottom
                    return false
                }
                if (n) {
                    if (matrix[xy[0] + k1][xy[1] + k2]) {
                        return false
                    }
                    return true
                }
                return true
            })
        )
    },

    isClear(matrix) {
        if (!matrix) {
            return false
        }

        // 是否达到消除状态
        const clearLines = []
        matrix.forEach((m, k) => {
            if (m.every(n => !!n)) {
                clearLines.push(k)
            }
        })
        if (clearLines.length === 0) {
            return false
        }
        return clearLines
    },

    isOver(matrix) {
        // 游戏是否结束, 第一行落下方块为依据
        return matrix[0].some(n => !!n)
    },
    // 订阅store userSetting
    subscribeStoreUserSetting(store) {
        // 开启订阅 (保存至localStorage)
        watch(() => store.state.userSetting, (rawData) => {
            let data = JSON.stringify(rawData)
            data = encodeURIComponent(data)
            if (window.btoa) {
                data = window.btoa(data)
            }
            window.localStorage.setItem(StorageKey, data)
        }, {
            deep: true
        })

        // 还原
        let data = window.localStorage.getItem(StorageKey)
        if (!data) {
            return null
        }
        try {
            if (window.btoa) {
                data = window.atob(data)
            }
            data = decodeURIComponent(data)
            data = JSON.parse(data)

            store.commit('initUserSettings', data)
        } catch (e) {
            if (window.console || window.console.error) {
                window.console.error('读取记录错误:', e)
            }
            return null
        }
    },

    isMobile() {
        // 判断是否为移动端
        const ua = navigator.userAgent
        const android = /Android (\d+\.\d+)/.test(ua)
        const iphone = ua.indexOf('iPhone') > -1
        const ipod = ua.indexOf('iPod') > -1
        const ipad = ua.indexOf('iPad') > -1
        return android || iphone || ipod || ipad
    },

    visibilityChangeEvent: (() => {
        return false

        if (!hiddenProperty) {
            return false
        }
        return hiddenProperty.replace(/hidden/i, 'visibilitychange') // 如果属性有前缀, 相应的事件也有前缀
    })(),

    isFocus: () => {
        if (!hiddenProperty) {
            // 如果不存在该特性, 认为一直聚焦
            return true
        }
        return !document[hiddenProperty]
    }
}
export const {
    getNextType,
    isMobile,
    want,
    isClear,
    isOver,
    subscribeStoreUserSetting,
    visibilityChangeEvent,
    isFocus
} = utils
