import store from '@/store/index'

// 使用 Web Audio API
const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext ||
    window.mozAudioContext ||
    window.oAudioContext ||
    window.msAudioContext

export const hasWebAudioAPI = {
    data: !!AudioContext && location.protocol.indexOf('http') !== -1
}

export const bgmusic = {}
    ; (() => {
        if (!hasWebAudioAPI.data) {
            return
        }
        const url = '/static/music/bg1.mp3'
        const context = new AudioContext()
        const req = new XMLHttpRequest()
        req.open('GET', url, true)
        req.responseType = 'arraybuffer'

        req.onload = () => {
            context.decodeAudioData(
                req.response,
                buf => {
                    // 将拿到的audio解码转为buffer
                    const getSource = () => {
                        // 创建source源。
                        const source = context.createBufferSource()
                        source.buffer = buf
                        source.connect(context.destination)
                        return source
                    }
                    bgmusic.start = () => {
                        // getSource().start(0)
                    }
                },
                error => {
                    if (window.console && window.console.error) {
                        window.console.error(`音频: ${url} 读取错误`, error)
                        hasWebAudioAPI.data = false
                    }
                }
            )
        }

        req.send()
    })()
